import torch
import numpy as np
import json
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps

DEVICE = torch.device("cpu")

def run_smart_inference(model, tokenizer, text, labels, thresholds):
    """
    Runs inference using the 'Divide and Conquer' strategy.
    Splits text by 'but'/'however' and takes the MAX score for each emotion.
    """
    # 1. Split Text
    chunks = re.split(r' but | however |[.!?]+', text)
    chunks = [c.strip() for c in chunks if len(c) > 5]  # Remove tiny chunks
    if not chunks: chunks = [text]  # Fallback

    # 2. Initialize Score Arrays
    num_labels = len(labels)
    final_scores_vec = np.zeros(num_labels)

    # 3. Run Inference on EACH Chunk
    with torch.no_grad():
        for chunk in chunks:
            inputs = tokenizer(chunk, return_tensors="pt", truncation=True, max_length=128, padding="max_length")
            inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

            logits = model(inputs["input_ids"], inputs["attention_mask"])
            probs = torch.sigmoid(logits)[0].cpu().numpy()

            # Max Pooling: Keep highest score seen for each emotion
            final_scores_vec = np.maximum(final_scores_vec, probs)

    # 4. Apply Thresholds
    scores_dict = {}
    predicted = []
    thresholds_dict = {}

    for i, prob in enumerate(final_scores_vec):
        label = labels[i]
        thr = float(thresholds[i])

        scores_dict[label] = float(prob)
        thresholds_dict[label] = thr

        # Selection Logic
        if prob > thr:
            predicted.append(label)

    if not predicted:
        max_idx = np.argmax(final_scores_vec)
        if final_scores_vec[max_idx] > 0.15:
            predicted.append(labels[max_idx])

    return {
        "predicted": predicted,
        "scores": scores_dict,
        "thresholds": thresholds_dict
    }


@csrf_exempt
def predict_emotions(request):
    if request.method == "POST":
        try:
            # 1. Get Config
            api_config = apps.get_app_config('api')

            api_config.load_models()

            if not api_config.coteg_model:
                return JsonResponse({"error": "Models failed to load..."}, status=503)

            data = json.loads(request.body)
            text = data.get("text", "")
            if not text:
                return JsonResponse({"error": "No text provided"}, status=400)

            # 2. Run Inference (CoTEG)
            coteg_result = run_smart_inference(
                api_config.coteg_model,
                api_config.tokenizer,
                text,
                api_config.labels,
                api_config.coteg_thresholds
            )
            # Attach Metrics from Config
            coteg_result["metrics"] = api_config.coteg_metrics

            # 3. Run Inference (Baseline)
            base_result = run_smart_inference(
                api_config.baseline_model,
                api_config.tokenizer,
                text,
                api_config.labels,
                api_config.base_thresholds
            )
            # Attach Metrics from Config
            base_result["metrics"] = api_config.base_metrics

            # 4. Return Combined Response
            return JsonResponse({
                "coteg": coteg_result,
                "baseline": base_result
            })

        except Exception as e:
            print(f"Error during inference: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid method"}, status=405)