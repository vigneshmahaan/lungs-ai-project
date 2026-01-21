# Machine Learning–Based Respiratory Disease Classification Using Lung Sound Analysis

End-to-end, software-only AI application that classifies respiratory diseases from lung sound audio (cough/breathing).  
**Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Recharts  
**Backend**: FastAPI + TensorFlow (Keras) + Librosa + Scikit-learn  
**Deployment**: Docker & Docker Compose ready

## 🚀 Quick Start (Choose One)

### Option 1: One-Click Start (Windows)
```bash
start.bat
```

### Option 2: Shell Script (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```

### Option 3: Docker
```bash
docker-compose up --build
```

### Option 4: Manual Setup
See [SETUP.md](SETUP.md) for detailed instructions.

**Then open:** http://localhost:3000

---

## 📋 Features

✅ **Upload WAV/MP3 files** - Drag-and-drop or click to upload  
✅ **Real-time audio processing**:
- Resampling to 16kHz
- Noise reduction via spectral gating
- Normalization and padding/trimming

✅ **Advanced feature extraction**:
- MFCC (Mel-Frequency Cepstral Coefficients)
- Mel-spectrogram

✅ **CNN inference** - TensorFlow/Keras model  
✅ **Beautiful visualizations**:
- Prediction card with animated confidence
- Waveform plot
- Mel-spectrogram heatmap
- Probability bar chart

✅ **PDF report export** - Download full analysis  
✅ **Responsive UI** - Desktop, tablet, mobile  
✅ **Medical-grade design** - Professional interface  

## 🔬 Supported Diseases

- **Normal** - Healthy respiratory sounds
- **Asthma** - Asthmatic breathing patterns
- **Pneumonia** - Pneumonia-related sounds
- **Bronchitis** - Bronchitis indicators
- **COPD** - Chronic Obstructive Pulmonary Disease

## 📁 Project Structure

```
lungs2/
├── backend/                    # Python/FastAPI backend
│   ├── main.py                # API server
│   ├── requirements.txt        # Dependencies
│   ├── Dockerfile             # Docker container
│   ├── .env                   # Configuration
│   ├── ml/                    # ML pipeline
│   │   ├── config.py          # Feature configs
│   │   ├── preprocess.py      # Audio processing
│   │   ├── features.py        # MFCC & Mel extraction
│   │   ├── modeling.py        # CNN architecture
│   │   ├── predict.py         # Inference
│   │   ├── train.py           # Training pipeline
│   │   └── make_metadata.py   # Dataset prep
│   └── model/
│       └── model.h5           # Trained CNN
│
├── frontend/                   # Next.js frontend
│   ├── package.json           # Dependencies
│   ├── Dockerfile             # Docker container
│   ├── next.config.ts         # Next.js config
│   ├── .env.local            # Environment setup
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   ├── upload/page.tsx    # Upload page
│   │   └── analysis/page.tsx  # Results page
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui
│   │   └── visual/            # Custom charts
│   └── lib/api.ts             # API client
│
├── docker-compose.yml         # Docker orchestration
├── SETUP.md                   # Detailed setup guide
├── start.bat                  # Windows launcher
├── start.sh                   # Unix launcher
├── start-docker.sh            # Docker launcher
├── test_api.py               # API test script
└── .gitignore                # Git ignore rules
```

## 🔧 API Reference

### Health Check
```http
GET /health
```

### Predict Disease
```http
POST /predict
Content-Type: multipart/form-data
file: <audio.wav or audio.mp3>
```

**Response:**
```json
{
  "predicted_disease": "Pneumonia",
  "confidence": 89.45,
  "probabilities": {
    "Pneumonia": 89.45,
    "COPD": 7.23,
    "Normal": 2.15,
    "Asthma": 1.12,
    "Bronchitis": 0.05
  },
  "visualizations": {
    "sample_rate": 16000,
    "waveform": [...],
    "mel_spectrogram": [...]
  }
}
```

**API Documentation:** http://localhost:8000/docs (Swagger UI)

## 📊 Training Your Own Model

### 1. Prepare Dataset
Organize audio files by disease class:
```
backend/dataset/icbhi_2017/audio/
├── Asthma/
├── Bronchitis/
├── COPD/
├── Normal/
└── Pneumonia/
```

### 2. Generate Metadata
```bash
cd backend
python -m ml.make_metadata
```

### 3. Train Model
```bash
python -m ml.train
```

Model will be saved to `backend/model/model.h5`

## ✅ Testing

### Test Backend Health
```bash
python test_api.py
```

This will:
- Check if backend is running
- Verify model loads correctly
- Test API predictions with sample audio

## 🐳 Docker Deployment

### Build and Run
```bash
docker-compose up --build
```

### Production URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Stop Services
```bash
docker-compose down
```

## 🔌 Environment Configuration

### Backend (.env)
```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Change `localhost:8000` to your backend URL for production.

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **TensorFlow/Keras** - Deep learning
- **Librosa** - Audio processing
- **NumPy/Pandas** - Data manipulation
- **Scikit-learn** - ML utilities

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **html2canvas & jsPDF** - PDF export

## 📦 Installation Requirements

- **Python 3.8.3+**
- **Node.js 18+**
- **npm or yarn**
- **Docker & Docker Compose** (optional, for containerization)

## 🚀 Deployment Options

1. **Local Development** - Use `start.bat` or `start.sh`
2. **Docker** - Use `docker-compose up`
3. **Cloud** - Deploy using provided Docker images
4. **Production** - Use Gunicorn + PM2 (see SETUP.md)

## 📖 Documentation

For comprehensive setup instructions, configuration options, troubleshooting, and advanced topics, see [SETUP.md](SETUP.md).

## 🐛 Troubleshooting

**Backend won't connect?**
- Ensure backend is running: `uvicorn main:app --reload`
- Check `.env.local`: `NEXT_PUBLIC_API_BASE=http://localhost:8000`

**Model errors?**
- Verify Python 3.8.3+: `python --version`
- Reinstall deps: `pip install -r requirements.txt`

**Docker issues?**
- Rebuild images: `docker-compose build --no-cache`
- View logs: `docker-compose logs -f`

See [SETUP.md](SETUP.md) for more troubleshooting.

## 📝 Project Status

✅ **Complete & Production-Ready**
- Full frontend-backend integration
- Docker containerization
- Comprehensive documentation
- Automated setup scripts
- API testing utilities

3) Run the API:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Health check: `http://localhost:8000/health`

3) (Optional but recommended) Put the ICBHI 2017 dataset in:

`backend/dataset/icbhi_2017/`

This repo provides a training pipeline that expects audio + metadata (see `backend/ml/train.py`).

4) Predict (from UI or curl):

```bash
curl -X POST "http://localhost:8000/predict" -F "file=@path/to/audio.wav"
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000`

Set backend URL (optional):

- Windows PowerShell:

```bash
setx NEXT_PUBLIC_API_BASE "http://localhost:8000"
```

Or create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## Train the model (ICBHI 2017)

After placing the dataset in `backend/dataset/icbhi_2017/`, run:

```bash
cd backend
python -m ml.train
```

It will:
- build features (MFCC + Mel-spectrogram)
- apply augmentation + class balancing
- train a CNN
- save: `backend/model/model.h5`

## Notes for college demo / viva

- This repository ships with a **baseline model file** in `backend/model/model.h5` so `/predict` works out-of-the-box.
- For **high accuracy**, you must train on the real ICBHI 2017 dataset using `backend/ml/train.py` (proper split + balancing + augmentation are included).

