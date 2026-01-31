import torch
import gc
from django.http import JsonResponse
from django.apps import apps
from rest_framework.decorators import api_view
from .dl_models import CoTEGModel, BaselineModel  # Import your model classes


# Helper function for "Just-In-Time" Inference
def run_isolated_inference(model_class, model_path, inputs, num_labels, is_coteg=False):
    """
    Loads a model, runs inference, and immediately clears it from memory.
    """
    print(f"🚀 Loading {'CoTEG' if is_coteg else 'Baseline'} from disk...")
    device = torch.device("cpu")

    # 1. Load Checkpoint
    checkpoint = torch.load(model_path, map_location=device)

    # 2. Initialize Model Architecture
    if is_coteg:
        initial_adj = torch.eye(num_labels).to(device)
        model = model_class(num_labels, initial_adj).to(device)
    else:
        model = model_class(num_labels).to(device)

    # 3. Load Weights
    state_dict = checkpoint.get('state', checkpoint.get('state_dict'))
    model.load_state_dict(state_dict, strict=False)
    model.eval()

    # 4. QUANTIZE (Critical for RAM)
    model = torch.quantization.quantize_dynamic(
        model, {torch.nn.Linear}, dtype=torch.qint8
    )

    # 5. Run Inference
    with torch.no_grad():
        outputs = model(inputs['input_ids'], inputs['attention_mask'])
        # Handle different output formats of your models
        logits = outputs['logits'] if isinstance(outputs, dict) else outputs

    # 6. MEMORY CLEANUP (The most important part)
    print("🗑️ Cleaning up model from RAM...")
    del checkpoint
    del state_dict
    del model
    gc.collect()  # Force Python to release memory NOW

    return logits


@api_view(['POST'])
def predict_emotions(request):
    api_config = apps.get_app_config('api')

    # Ensure metadata is loaded
    if api_config.tokenizer is None:
        api_config.load_metadata()

    text = request.data.get('text', '')

    # Tokenize
    inputs = api_config.tokenizer(
        text, return_tensors="pt", truncation=True, padding=True, max_length=128
    )

    try:
        # --- STEP 1: Run CoTEG ---
        coteg_logits = run_isolated_inference(
            CoTEGModel,
            api_config.coteg_path,
            inputs,
            len(api_config.labels),
            is_coteg=True
        )

        # Process CoTEG Results (Sigmoid + Thresholds)
        coteg_probs = torch.sigmoid(coteg_logits).squeeze().tolist()
        coteg_results = []
        for i, prob in enumerate(coteg_probs):
            if prob > api_config.coteg_thresholds[i]:
                coteg_results.append({
                    "emotion": api_config.labels[i],
                    "score": f"{prob:.2%}"
                })

        # --- STEP 2: Run Baseline ---
        base_logits = run_isolated_inference(
            BaselineModel,
            api_config.base_path,
            inputs,
            len(api_config.labels),
            is_coteg=False
        )

        # Process Baseline Results
        base_probs = torch.sigmoid(base_logits).squeeze().tolist()
        base_results = []
        for i, prob in enumerate(base_probs):
            if prob > api_config.base_thresholds[i]:
                base_results.append({
                    "emotion": api_config.labels[i],
                    "score": f"{prob:.2%}"
                })

        return JsonResponse({
            "coteg": {"predicted": coteg_results, "metrics": api_config.coteg_metrics},
            "baseline": {"predicted": base_results, "metrics": api_config.base_metrics}
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return JsonResponse({"error": str(e)}, status=500)