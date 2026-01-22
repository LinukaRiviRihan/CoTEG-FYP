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

    # Store models and metadata globally
    coteg_model = None
    baseline_model = None
    tokenizer = None
    labels = None

    # Thresholds & Metrics
    coteg_thresholds = None
    coteg_metrics = None
    base_thresholds = None
    base_metrics = None

    def ready(self):
        if 'runserver' in sys.argv and os.environ.get('RUN_MAIN') != 'true':
            return

        print("APPLICATION STARTING: Attempting to load DL Models...")

        hf_logging.set_verbosity_error()

        try:
            if self.coteg_model is not None: return

            device = torch.device("cpu")
            base_dir = settings.BASE_DIR

            # Paths to your saved models
            coteg_path = os.path.join(base_dir, 'dl_models', 'coteg_model (1).pth')
            base_path = os.path.join(base_dir, 'dl_models', 'baseline_model (1).pth')

            if not os.path.exists(coteg_path) or not os.path.exists(base_path):
                print(f"ERROR: Model files missing in dl_models/")
                return

            print("... Files found. Loading checkpoints ...")

            # Load Checkpoints
            coteg_ckpt = torch.load(coteg_path, map_location=device, weights_only=False)
            base_ckpt = torch.load(base_path, map_location=device, weights_only=False)

            # 1. Load Labels
            print("1. Loading Labels...")
            GO_EMOTIONS = [
                'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring',
                'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval',
                'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude', 'grief',
                'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization',
                'relief', 'remorse', 'sadness', 'surprise', 'neutral'
            ]
            self.labels = coteg_ckpt.get('labels', GO_EMOTIONS)
            num_labels = len(self.labels)

            # 2. Load Thresholds & Metrics
            print("2. Loading Thresholds & Metrics...")
            default_thr = [0.3] * num_labels
            self.coteg_thresholds = coteg_ckpt.get('thr', default_thr)
            self.coteg_metrics = coteg_ckpt.get('metrics', {})  # Load Metrics

            self.base_thresholds = base_ckpt.get('thr', default_thr)
            self.base_metrics = base_ckpt.get('metrics', {})  # Load Metrics

            # 3. Load Tokenizer
            print("3. Loading Tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained("roberta-base")

            # 4. Load Baseline Model
            print("4. Constructing Baseline Model...")
            self.baseline_model = BaselineModel(num_labels).to(device)
            base_state_key = 'state' if 'state' in base_ckpt else 'state_dict'
            self.baseline_model.load_state_dict(base_ckpt[base_state_key], strict=False)
            self.baseline_model.eval()

            # 5. Load CoTEG Model
            print("5. Constructing CoTEG Model...")
            initial_adj = torch.eye(num_labels).to(device)
            self.coteg_model = CoTEGModel(num_labels, initial_adj).to(device)
            state_key = 'state' if 'state' in coteg_ckpt else 'state_dict'
            self.coteg_model.load_state_dict(coteg_ckpt[state_key], strict=False)
            self.coteg_model.eval()

            print("SUCCESS: Models, Thresholds & Metrics Loaded!")

        except Exception as e:
            print(f"CRITICAL ERROR initializing models: {e}")