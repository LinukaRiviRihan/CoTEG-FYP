# CoTEG: A Hybrid T-GCN Model for Multi-Label Emotion Detection with Emotion Correlation Modeling

CoTEG is a deep learning–based multi-label emotion detection model designed to identify 28 fine-grained emotions from textual input. The project introduces a hybrid Transformer + Graph Convolutional Network (GCN) architecture and evaluates it against a strong RoBERTa baseline, enabling more nuanced and context-aware emotion understanding.

The system is implemented as a full-stack application consisting of a Django-based backend API (deployed on Hugging Face Spaces) and a React-based frontend interface (deployed on Vercel).

---

## 🚀 Live Demo

* **Frontend (User Interface):** [https://coteg-fyp.vercel.app/](https://coteg-fyp.vercel.app/)
* **Backend (Prediction API):** [https://linukarivirihan-backend.hf.space/api/predict/](https://linukarivirihan-backend.hf.space/api/predict/)

---

## ✨ Key Features

### 1. Dual Model Architecture

* **CoTEG Model**
  Integrates **RoBERTa embeddings** with a **Graph Convolutional Network (GCN)** to model dependencies and correlations between emotion labels, improving multi-label prediction quality.

* **Baseline Model**
  A standard **fine-tuned RoBERTa-base** model used for benchmarking and comparative evaluation.

### 2. Fine-Grained Emotion Detection

* Supports **28 distinct emotion categories** (e.g., admiration, grief, remorse, joy) derived from the **GoEmotions taxonomy**.
* Enables multi-label predictions, allowing multiple emotions to be detected simultaneously.

### 3. Smart Inference Strategy

* Implements a **Divide-and-Conquer** inference mechanism.
* Complex or compound sentences are split using conjunctions such as *but* and *however*, allowing the system to capture **conflicting or contrasting emotions** within a single input.

### 4. Real-Time Visualization

* Interactive **React-based UI** displays:

  * Predicted emotions
  * Confidence scores
  * Side-by-side comparison between **CoTEG** and **baseline** models

---

## 🛠️ Tech Stack

### Backend

* **Framework:** Django 4.x (Python 3.10+)
* **Machine Learning:** PyTorch, Hugging Face Transformers
* **Models:** RoBERTa-base, Custom GCN
* **Application Servers:** Gunicorn, Uvicorn
* **Deployment Platform:** Docker, Hugging Face Spaces

### Frontend

* **Framework:** React.js
* **HTTP Client:** Axios
* **Deployment Platform:** Vercel

---

## 📂 Project Structure

```bash
CoTEG-FYP/
├── backend/                 # Django API
│   ├── api/                 # Application logic (views, serializers)
│   ├── config/              # Django project settings and URLs
│   ├── dl_models/           # PyTorch model definitions & checkpoints (.pth)
│   ├── Dockerfile           # Hugging Face Spaces container configuration
│   ├── manage.py            # Django entry point
│   └── requirements.txt     # Backend dependencies
│
└── frontend/                # React application
    ├── public/              # Static assets
    ├── src/                 # React components and pages
    └── package.json         # Frontend dependencies
```

---

## 🔧 Local Setup & Installation

### Backend Setup

**Prerequisites:** Python 3.9+

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend API will be available at:

```
http://127.0.0.1:8000/api/predict/
```

---

### Frontend Setup

**Prerequisites:** Node.js

```bash
cd frontend
npm install
npm start
```

The frontend application will be available at:

```
http://localhost:3000
```

---

## 📡 API Documentation

### Prediction Endpoint

```
POST /api/predict/
Content-Type: application/json
```

### Example Request

```json
{
  "text": "I was really nervous about the interview, but I am so happy it went well!"
}
```

### Example Response

```json
{
  "coteg": {
    "predicted": ["nervousness", "joy", "relief"],
    "scores": {
      "nervousness": 0.85,
      "joy": 0.92,
      "relief": 0.78
    },
    "metrics": {
      "accuracy": 0.52,
      "f1_macro": 0.48
    }
  },
  "baseline": {
    "predicted": ["joy"],
    "scores": {
      "nervousness": 0.40,
      "joy": 0.88
    },
    "metrics": {
      "accuracy": 0.49,
      "f1_macro": 0.45
    }
  }
}
```

---

## 🐋 Deployment

### Backend Deployment (Hugging Face Spaces)

The backend is containerized using **Docker** and deployed on Hugging Face Spaces.

```bash
cd backend
huggingface-cli upload linukarivirihan/backend . . --repo-type space
```

### Frontend Deployment (Vercel)

1. Connect the GitHub repository to **Vercel**
2. Set the project root directory to `frontend/`
3. Trigger deployment

---

## 👥 Author

* **Linuka Ravirihan** – Developer & Researcher

---

## 📄 License

This project is licensed under the **MIT License**.
