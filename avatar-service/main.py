
import os
import base64
import time
import shutil
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

# Allow Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AvatarRequest(BaseModel):
    audio_data: str  # Base64 WAV
    image_path: str  # Relative path to source image

@app.post("/generate-avatar")
async def generate_avatar(request: AvatarRequest):
    # 1. Setup temp workspace
    session_id = str(int(time.time()))
    temp_dir = f"temp/{session_id}"
    os.makedirs(temp_dir, exist_ok=True)
    
    audio_path = f"{temp_dir}/input_audio.wav"
    output_video_path = f"{temp_dir}/output_video" # SadTalker creates a subfolder
    
    try:
        # 2. Decode audio
        with open(audio_path, "wb") as f:
            f.write(base64.b64decode(request.audio_data))
        
        # 3. RUN SADTALKER INFERENCE
        # Assuming SadTalker is cloned in the current directory
        # python inference.py --driven_audio <audio> --source_image <image> --result_dir <dir> --still
        cmd = [
            "python", "inference.py",
            "--driven_audio", audio_path,
            "--source_image", f"../{request.image_path}",
            "--result_dir", output_video_path,
            "--still", # Less head movement for professional look
            "--preprocess", "full",
            "--enhancer", "gfpgan"
        ]
        
        print(f"Executing: {' '.join(cmd)}")
        process = subprocess.run(cmd, capture_output=True, text=True)
        
        if process.returncode != 0:
            print(f"SadTalker Error: {process.stderr}")
            raise HTTPException(status_code=500, detail="Inference failed")

        # 4. Find generated video (SadTalker names it with timestamp)
        video_file = None
        for root, dirs, files in os.walk(output_video_path):
            for file in files:
                if file.endsWith(".mp4"):
                    video_file = os.path.join(root, file)
                    break
        
        if not video_file:
             raise HTTPException(status_code=500, detail="Video not generated")

        # 5. Encode and Return
        with open(video_file, "rb") as v:
            encoded_video = base64.b64encode(v.read()).decode("utf-8")
            
        return {"video_data": encoded_video}

    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.get("/health")
async def health():
    return {"status": "operational", "gpu_detected": os.system("nvidia-smi") == 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
