#!/usr/bin/env python3
"""
Test script to verify backend API is working and models are loaded.
Run this after starting the backend: python test_api.py
"""

import os
import sys
import requests
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

API_BASE = "http://localhost:8000"
HEALTH_URL = f"{API_BASE}/health"


def test_health():
    """Test if backend is running and healthy."""
    print("\n" + "="*50)
    print("Testing Backend Health")
    print("="*50)
    
    try:
        response = requests.get(HEALTH_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy: {data}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend at {API_BASE}")
        print("   Make sure backend is running: uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_model_loading():
    """Test if ML model loads correctly."""
    print("\n" + "="*50)
    print("Testing Model Loading")
    print("="*50)
    
    try:
        from ml.config import AudioConfig, FeatureConfig, ModelConfig
        from ml.predict import _ensure_model
        
        audio_cfg = AudioConfig()
        feat_cfg = FeatureConfig()
        model_cfg = ModelConfig()
        
        model_path = os.path.join("backend", "model", "model.h5")
        input_shape = (128, 157, 2)  # (height, width, channels)
        
        print(f"Loading model from: {model_path}")
        model = _ensure_model(model_path, input_shape)
        print(f"✅ Model loaded successfully!")
        print(f"   Classes: {model_cfg.classes}")
        print(f"   Input shape: {input_shape}")
        print(f"   Model parameters: {model.count_params():,}")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_prediction():
    """Test prediction endpoint with a dummy audio file."""
    print("\n" + "="*50)
    print("Testing Prediction Endpoint")
    print("="*50)
    
    # Generate a simple test audio file
    try:
        import numpy as np
        import soundfile as sf
        
        # Create 3 seconds of silence at 16kHz
        sr = 16000
        duration = 3
        samples = np.random.normal(0, 0.01, int(sr * duration)).astype(np.float32)
        
        test_file_path = "test_audio.wav"
        sf.write(test_file_path, samples, sr)
        print(f"✅ Generated test audio file: {test_file_path}")
        
        # Send to API
        predict_url = f"{API_BASE}/predict"
        with open(test_file_path, "rb") as f:
            files = {"file": f}
            print(f"Sending prediction request to {predict_url}...")
            response = requests.post(predict_url, files=files, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful!")
            print(f"   Predicted disease: {result['predicted_disease']}")
            print(f"   Confidence: {result['confidence']}%")
            print(f"   Probabilities: {json.dumps(result['probabilities'], indent=2)}")
            return True
        else:
            print(f"❌ Prediction failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    except ImportError as e:
        print(f"⚠️  Cannot run prediction test - missing dependency: {e}")
        print("   Install with: pip install soundfile")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Cleanup
        if os.path.exists("test_audio.wav"):
            os.remove("test_audio.wav")


def main():
    """Run all tests."""
    print("\n")
    print("╔" + "="*48 + "╗")
    print("║" + " LUNGS AI - API & MODEL TEST ".center(48) + "║")
    print("╚" + "="*48 + "╝")
    
    results = {
        "Health Check": test_health(),
        "Model Loading": test_model_loading(),
        "Prediction": test_api_prediction(),
    }
    
    print("\n" + "="*50)
    print("Test Summary")
    print("="*50)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL" if result is False else "⚠️  SKIP"
        print(f"{test_name:.<40} {status}")
    
    all_passed = all(v for v in results.values() if v is not None)
    
    print("\n" + "="*50)
    if all_passed:
        print("✅ All tests passed! API is ready.")
        print("\n📱 Access the frontend at: http://localhost:3000")
        print("📡 Access the API at: http://localhost:8000")
        print("📚 API docs: http://localhost:8000/docs")
    else:
        print("❌ Some tests failed. Check the output above.")
    print("="*50 + "\n")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
