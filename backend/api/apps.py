import os
import sys
import torch
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
        # 1. STARTUP: We do NOTHING here anymore.
        # This allows Render to start the server immediately without crashing.
        print("System Ready. Models will load on first request.")
        pass

    def load_models(self):
        # 2. CHECK: If models are already loaded, stop here.
        if self.coteg_model is not None:
            return

        print("Trigger received: Loading DL Models now...")
        hf_logging.set_verbosity_error()

        try:
            device = torch.device("cpu")

            # 3. PATH SETUP
            model_dir = os.path.join(settings.BASE_DIR, 'dl_models')
            coteg_path = os.path.join(model_dir, 'coteg_model.pth')
            base_path = os.path.join(model_dir, 'baseline_model.pth')

            if not os.path.exists(coteg_path):
                print(f"ERROR: Model not found at {coteg_path}")
                print(f"   BASE_DIR is: {settings.BASE_DIR}")
                return

            print(f"Found models at: {model_dir}")

            # 4. LOAD CHECKPOINTS (CPU Only)
            coteg_ckpt = torch.load(coteg_path, map_location=device, weights_only=False)
            base_ckpt = torch.load(base_path, map_location=device, weights_only=False)

            # 5. LABELS
            GO_EMOTIONS = ['admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion',
                           'curiosity', 'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment',
                           'excitement', 'fear', 'gratitude', 'grief', 'joy', 'love', 'nervousness', 'optimism',
                           'pride', 'realization', 'relief', 'remorse', 'sadness', 'surprise', 'neutral']
            self.labels = coteg_ckpt.get('labels', GO_EMOTIONS)
            num_labels = len(self.labels)

            # 6. THRESHOLDS
            default_thr = [0.3] * num_labels
            self.coteg_thresholds = coteg_ckpt.get('thr', default_thr)
            self.coteg_metrics = coteg_ckpt.get('metrics', {})
            self.base_thresholds = base_ckpt.get('thr', default_thr)
            self.base_metrics = base_ckpt.get('metrics', {})

            # 7. TOKENIZER
            self.tokenizer = AutoTokenizer.from_pretrained("roberta-base")

            # 8. BASELINE MODEL
            print("Constructing Baseline...")
            self.baseline_model = BaselineModel(num_labels).to(device)
            base_state = base_ckpt.get('state', base_ckpt.get('state_dict'))
            self.baseline_model.load_state_dict(base_state, strict=False)
            self.baseline_model.eval()

            # 9. CoTEG MODEL
            print("Constructing CoTEG...")
            initial_adj = torch.eye(num_labels).to(device)
            self.coteg_model = CoTEGModel(num_labels, initial_adj).to(device)
            coteg_state = coteg_ckpt.get('state', coteg_ckpt.get('state_dict'))
            self.coteg_model.load_state_dict(coteg_state, strict=False)
            self.coteg_model.eval()

            print("SUCCESS: All models loaded!")

        except Exception as e:
            print(f"CRITICAL ERROR initializing models: {e}")