import os
import sys
import torch
from django.apps import AppConfig
from django.conf import settings
from transformers import AutoTokenizer
# Ensure this import works based on your file structure
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
        # 1. [CHANGED] Only skip if we are running a migration or build script.
        # This allows Gunicorn to proceed.
        if 'migrate' in sys.argv or 'collectstatic' in sys.argv:
            return

        # Avoid double loading if already loaded
        if self.coteg_model is not None:
            return

        print("🚀 APPLICATION STARTING: Loading DL Models...")
        hf_logging.set_verbosity_error()

        try:
            device = torch.device("cpu")

            # Path setup
            model_dir = os.path.join(settings.BASE_DIR, 'dl_models')
            coteg_path = os.path.join(model_dir, 'coteg_model.pth')
            base_path = os.path.join(model_dir, 'baseline_model.pth')

            if not os.path.exists(coteg_path):
                print(f"❌ ERROR: Model not found at {coteg_path}")
                print(f"   Files in dir: {os.listdir(model_dir) if os.path.exists(model_dir) else 'Dir not found'}")
                return

            print(f"📂 Found models at: {model_dir}")

            # Load Checkpoints
            coteg_ckpt = torch.load(coteg_path, map_location=device, weights_only=False)
            base_ckpt = torch.load(base_path, map_location=device, weights_only=False)

            # 1. Labels & Thresholds
            GO_EMOTIONS = ['admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion',
                           'curiosity', 'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment',
                           'excitement', 'fear', 'gratitude', 'grief', 'joy', 'love', 'nervousness', 'optimism',
                           'pride', 'realization', 'relief', 'remorse', 'sadness', 'surprise', 'neutral']

            self.labels = coteg_ckpt.get('labels', GO_EMOTIONS)
            num_labels = len(self.labels)

            default_thr = [0.3] * num_labels
            self.coteg_thresholds = coteg_ckpt.get('thr', default_thr)
            self.coteg_metrics = coteg_ckpt.get('metrics', {})
            self.base_thresholds = base_ckpt.get('thr', default_thr)
            self.base_metrics = base_ckpt.get('metrics', {})

            # 2. Tokenizer
            # This will download 'roberta-base' the first time it runs
            self.tokenizer = AutoTokenizer.from_pretrained("roberta-base")

            # 3. Models
            print("⏳ Constructing Baseline (Downloading base weights if needed)...")
            self.baseline_model = BaselineModel(num_labels).to(device)
            base_state = base_ckpt.get('state', base_ckpt.get('state_dict'))
            self.baseline_model.load_state_dict(base_state, strict=False)
            self.baseline_model.eval()

            print("⏳ Constructing CoTEG...")
            initial_adj = torch.eye(num_labels).to(device)
            self.coteg_model = CoTEGModel(num_labels, initial_adj).to(device)
            coteg_state = coteg_ckpt.get('state', coteg_ckpt.get('state_dict'))
            self.coteg_model.load_state_dict(coteg_state, strict=False)
            self.coteg_model.eval()

            print("✅ SUCCESS: All models loaded globally!")

        except Exception as e:
            print(f"🔥 CRITICAL ERROR initializing models: {e}")