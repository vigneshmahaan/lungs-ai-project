from __future__ import annotations

import os
from typing import Any, Dict

# Silence TensorFlow GPU warnings on CPU-only machines (must be set before TF import).
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from ml.config import AudioConfig, FeatureConfig, ModelConfig
from ml.predict import predict_from_audio_bytes


APP_TITLE = "Machine Learning–Based Respiratory Disease Classification Using Lung Sound Analysis"

app = FastAPI(title=APP_TITLE, version="1.0.0")

# Configure CORS with environment variables
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

audio_cfg = AudioConfig()
feat_cfg = FeatureConfig()
model_cfg = ModelConfig()

MODEL_PATH = os.path.join("model", "model.h5")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")
    if file.content_type not in ("audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/wave"):
        # some browsers send application/octet-stream; allow by extension fallback
        ext = os.path.splitext(file.filename.lower())[1]
        if ext not in (".wav", ".mp3"):
            raise HTTPException(status_code=400, detail="Only WAV or MP3 files are supported.")

    try:
        data = await file.read()
        label, confidence, probs, viz = predict_from_audio_bytes(
            file_bytes=data,
            model_path=MODEL_PATH,
            audio_cfg=audio_cfg,
            feat_cfg=feat_cfg,
            model_cfg=model_cfg,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

    return {
        "predicted_disease": label,
        "confidence": round(confidence, 2),
        "probabilities": {k: round(v, 4) for k, v in probs.items()},
        "visualizations": viz,
    }

