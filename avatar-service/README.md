
# Nexvoro AI Local Avatar Service (SadTalker)

This service handles the generation of talking-head videos from audio input using the open-source SadTalker model.

## Local Setup Requirements

### 1. Prerequisites
- **Python 3.10.x** (Required for stable PyTorch/SadTalker compatibility)
- **FFmpeg** installed and added to PATH
- **NVIDIA GPU** (8GB+ VRAM recommended) with CUDA 11.7+

### 2. Installation
```bash
# 1. Clone SadTalker (Inside this avatar-service directory)
git clone https://github.com/OpenTalker/SadTalker.git
cd SadTalker

# 2. Create Virtual Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install Requirements
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu117
pip install -r requirements.txt
pip install fastapi uvicorn pydantic
```

### 3. Models/Checkpoints
Download the required pre-trained models into the `checkpoints` directory inside `SadTalker/`:
- `sad_talker` model files
- `gfpgan` (for face enhancement)

Refer to the [SadTalker Scripts](https://github.com/OpenTalker/SadTalker/blob/main/docs/download_models.md) for automated download commands.

### 4. Running the Service
Move `main.py` into the `SadTalker` root and run:
```bash
python main.py
```
The service will start on `http://localhost:8000`.

## Next.js Integration
The frontend automatically detects this service. If it's offline, the app falls back to the original static holographic HUD with browser text-to-speech.
