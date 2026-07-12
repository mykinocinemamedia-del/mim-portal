#!/usr/bin/env python3
"""
Generate videos from Pixar images using Hugging Face Stable Video Diffusion.
Each image becomes a short animated video clip.
"""
import os
import sys
import time
from pathlib import Path
from gradio_client import Client
import subprocess

PROJECT_DIR = Path("/home/z/my-project")
IMG_DIR = PROJECT_DIR / "public" / "images" / "pixar"
STEPS_DIR = PROJECT_DIR / "public" / "images" / "steps-pixar"
LOGO = PROJECT_DIR / "public" / "logo-mim.png"
OUTPUT_DIR = PROJECT_DIR / "public" / "videos" / "svd_clips"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Connect to SVD space
print("Connecting to Stable Video Diffusion space...")
client = Client("https://multimodalart-stable-video-diffusion.hf.space")
print("Connected!\n")

# Images to animate (most important ones)
images_to_animate = [
    (str(IMG_DIR / "hero.png"), "hero", 127),        # normal motion
    (str(IMG_DIR / "why-matchmaker.png"), "matchmaker", 140),  # more motion
    (str(IMG_DIR / "why-safety.png"), "safety", 110),  # less motion (subtle)
    (str(STEPS_DIR / "step1-register-wide.png"), "step1", 127),
    (str(STEPS_DIR / "step3-interview-wide.png"), "step3", 130),
    (str(STEPS_DIR / "step5-start-wide.png"), "step5", 135),
    (str(IMG_DIR / "ai-agents.png"), "ai-agents", 145),  # more motion
    (str(IMG_DIR / "why-support.png"), "support", 120),
]

def generate_video_clip(image_path, name, motion_bucket_id):
    """Generate a video clip from an image using SVD."""
    output_file = OUTPUT_DIR / f"{name}.mp4"
    if output_file.exists():
        print(f"  {name}: Already exists, skipping")
        return str(output_file)
    
    print(f"  {name}: Generating (motion={motion_bucket_id})...")
    try:
        # Step 1: Resize image
        resized = client.predict(
            image=image_path,
            api_name="/resize_image"
        )
        print(f"    Resized: {type(resized)}")
        
        # Step 2: Generate video
        result = client.predict(
            image=resized,
            seed=42,
            randomize_seed=True,
            motion_bucket_id=motion_bucket_id,
            fps_id=8,  # 8 fps for smooth motion
            api_name="/video"
        )
        
        # result is (video_path, seed)
        video_path = result[0] if isinstance(result, tuple) else result
        if isinstance(video_path, dict):
            video_path = video_path.get('video', video_path.get('path', ''))
        
        if video_path and os.path.exists(video_path):
            # Copy to output
            import shutil
            shutil.copy(video_path, output_file)
            print(f"    OK: {output_file.stat().st_size / 1024:.0f} KB")
            return str(output_file)
        else:
            print(f"    No video returned: {result}")
            return None
    except Exception as e:
        print(f"    Error: {e}")
        return None

def main():
    print("=" * 60)
    print(" Generating AI Videos from Pixar Images")
    print(" Using: Stable Video Diffusion (Hugging Face)")
    print("=" * 60)
    
    clips = []
    for image_path, name, motion in images_to_animate:
        clip = generate_video_clip(image_path, name, motion)
        if clip:
            clips.append(clip)
        time.sleep(2)  # Rate limit
    
    print(f"\n{'='*60}")
    print(f" Generated {len(clips)}/{len(images_to_animate)} video clips")
    print(f"{'='*60}")
    
    for clip in clips:
        name = Path(clip).stem
        size = Path(clip).stat().st_size / 1024
        print(f"  {name}: {size:.0f} KB")
    
    print(f"\nClips saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
