import os
import sys
import torch
import gc
from django.apps import AppConfig
from django.conf import settings
from transformers import AutoTokenizer
from .dl_models import CoTEGModel, BaselineModel
from transformers import logging as hf_logging


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    # Global holders
    coteg_model = None
    baseline_model = None
    tokenizer = None
    labels = None
    coteg_thresholds = None
    coteg_metrics = None
    base_thresholds = None
    base_metrics = None

    def ready(self):
        # 1. STARTUP: Do NOTHING here.
        # This allows Render to start the server immediately without crashing.
        print("System Ready. Models will load on first request.")
        pass

    def load_models(self):
        # 2. CHECK: If models are already loaded, stop here.
        if self.coteg_model is not None:
            return

        print("Trigger received: Loading DL Models...")
        hf_logging.set_verbosity_error()

        # Force CPU device for consistency and memory saving on Render
        device = torch.device("cpu")

        try:
            # 3. PATH SETUP
            model_dir = os.path.join(settings.BASE_DIR, 'dl_models')
            coteg_path = os.path.join(model_dir, 'coteg_model.pth')
            base_path = os.path.join(model_dir, 'baseline_model.pth')

            if not os.path.exists(coteg_path):
                print(f"ERROR: Model not found at {coteg_path}")
                return

            print(f"Found models at: {model_dir}")

            # ---------------------------------------------------------
            # PHASE 1: Load CoTEG (The heavy lifter)
            # ---------------------------------------------------------
            print("1/4 Loading CoTEG Checkpoint...")
            coteg_ckpt = torch.load(coteg_path, map_location=device, weights_only=False)

            # Setup Global Configs from CoTEG
            GO_EMOTIONS = ['admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion',
                           'curiosity', 'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment',
                           'excitement', 'fear', 'gratitude', 'grief', 'joy', 'love', 'nervousness', 'optimism',
                           'pride', 'realization', 'relief', 'remorse', 'sadness', 'surprise', 'neutral']
            self.labels = coteg_ckpt.get('labels', GO_EMOTIONS)
            num_labels = len(self.labels)

            default_thr = [0.3] * num_labels
            self.coteg_thresholds = coteg_ckpt.get('thr', default_thr)
            self.coteg_metrics = coteg_ckpt.get('metrics', {})

            # Initialize CoTEG Model
            print("Constructing CoTEG Model...")
            initial_adj = torch.eye(num_labels).to(device)
            self.coteg_model = CoTEGModel(num_labels, initial_adj).to(device)

            # Load Weights
            coteg_state = coteg_ckpt.get('state', coteg_ckpt.get('state_dict'))
            self.coteg_model.load_state_dict(coteg_state, strict=False)
            self.coteg_model.eval()

            # CRITICAL: Delete the raw checkpoint to free RAM immediately
            del coteg_ckpt
            del coteg_state
            gc.collect()

            # OPTIMIZATION: Quantize CoTEG (Shrinks memory by ~4x)
            print("Quantizing CoTEG...")
            self.coteg_model = torch.quantization.quantize_dynamic(
                self.coteg_model, {torch.nn.Linear}, dtype=torch.qint8
            )
            gc.collect()

            # ---------------------------------------------------------
            # PHASE 2: Load Baseline
            # ---------------------------------------------------------
            print("2/4 Loading Baseline Checkpoint...")
            base_ckpt = torch.load(base_path, map_location=device, weights_only=False)

            self.base_thresholds = base_ckpt.get('thr', default_thr)
            self.base_metrics = base_ckpt.get('metrics', {})

            print("Constructing Baseline Model...")
            self.baseline_model = BaselineModel(num_labels).to(device)
            base_state = base_ckpt.get('state', base_ckpt.get('state_dict'))
            self.baseline_model.load_state_dict(base_state, strict=False)
            self.baseline_model.eval()

            # Clean up Baseline inputs
            del base_ckpt
            del base_state
            gc.collect()

            # OPTIMIZATION: Quantize Baseline
            print("Quantizing Baseline...")
            self.baseline_model = torch.quantization.quantize_dynamic(
                self.baseline_model, {torch.nn.Linear}, dtype=torch.qint8
            )
            gc.collect()

            # ---------------------------------------------------------
            # PHASE 3: Tokenizer
            # ---------------------------------------------------------
            print("3/4 Loading Tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained("roberta-base")

            print("SUCCESS: All models loaded, quantized, and ready!")

        except Exception as e:
            print(f"CRITICAL ERROR initializing models: {e}")