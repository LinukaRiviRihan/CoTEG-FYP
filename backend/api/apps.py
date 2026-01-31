import os
import torch
import gc
from django.apps import AppConfig
from django.conf import settings
from transformers import AutoTokenizer, logging as hf_logging


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    # Global holders for METADATA only (No heavy models here)
    tokenizer = None
    labels = None
    coteg_thresholds = None
    coteg_metrics = None
    base_thresholds = None
    base_metrics = None

    # Store paths to load later
    coteg_path = None
    base_path = None

    def ready(self):
        print("System Ready. Metadata will load on first request.")

    def load_metadata(self):
        """
        Loads lightweight metadata (labels, thresholds) and Tokenizer.
        Does NOT load the heavy model weights.
        """
        if self.tokenizer is not None:
            return

        print("⚡ Loading Metadata & Tokenizer...")
        hf_logging.set_verbosity_error()
        device = torch.device("cpu")

        # 1. Setup Paths
        model_dir = os.path.join(settings.BASE_DIR, 'dl_models')
        self.coteg_path = os.path.join(model_dir, 'coteg_model.pth')
        self.base_path = os.path.join(model_dir, 'baseline_model.pth')

        if not os.path.exists(self.coteg_path):
            print("CRITICAL ERROR: Models not found!")
            return

        try:
            # 2. Extract Metadata from CoTEG (Then delete immediately)
            print("Reading CoTEG metadata...")
            checkpoint = torch.load(self.coteg_path, map_location=device)

            # Extract Labels
            GO_EMOTIONS = ['admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion',
                           'curiosity', 'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment',
                           'excitement', 'fear', 'gratitude', 'grief', 'joy', 'love', 'nervousness', 'optimism',
                           'pride', 'realization', 'relief', 'remorse', 'sadness', 'surprise', 'neutral']
            self.labels = checkpoint.get('labels', GO_EMOTIONS)

            # Extract Thresholds
            self.coteg_thresholds = checkpoint.get('thr', [0.3] * len(self.labels))
            self.coteg_metrics = checkpoint.get('metrics', {})

            # CLEAR RAM
            del checkpoint
            gc.collect()

            # 3. Extract Metadata from Baseline (Then delete immediately)
            print("Reading Baseline metadata...")
            checkpoint = torch.load(self.base_path, map_location=device)
            self.base_thresholds = checkpoint.get('thr', [0.3] * len(self.labels))
            self.base_metrics = checkpoint.get('metrics', {})

            # CLEAR RAM
            del checkpoint
            gc.collect()

            # 4. Load Tokenizer (Keep this in RAM, it's small)
            print("Loading Tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained("roberta-base")

            print("✅ Metadata Loaded. Models will be loaded 'Just-In-Time' for predictions.")

        except Exception as e:
            print(f"Error loading metadata: {e}")