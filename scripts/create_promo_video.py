#!/usr/bin/env python3
"""
Create a 1-minute promotional video for MIM Portal using FFmpeg.
Uses Pixar 3D images with text overlays, transitions, and Ken Burns effect.
"""
import subprocess
import os
import sys
from pathlib import Path

PROJECT_DIR = Path("/home/z/my-project")
IMG_DIR = PROJECT_DIR / "public" / "images" / "pixar"
STEPS_DIR = PROJECT_DIR / "public" / "images" / "steps-pixar"
LOGO = PROJECT_DIR / "public" / "logo-mim.png"
OUTPUT_DIR = PROJECT_DIR / "public" / "videos"
OUTPUT_DIR.mkdir(exist_ok=True)

OUTPUT_VIDEO = OUTPUT_DIR / "mim-promo.mp4"

# Font for text overlays
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Video specs: 1280x720, 30fps, 60 seconds
WIDTH = 1280
HEIGHT = 720
FPS = 30
DURATION = 60  # seconds

# Scenes: (image_path, title_text, subtitle_text, duration_seconds)
scenes = [
    # Scene 1: Intro with logo (3s)
    (str(LOGO), "MIM Portal", "Maid In Malaysia", 3),
    
    # Scene 2: Hero - Cari Pembantu Profesional (5s)
    (str(IMG_DIR / "hero.png"), "Cari Pembantu Rumah", "Profesional & Terpercaya", 5),
    
    # Scene 3: Why - Safety (4s)
    (str(IMG_DIR / "why-safety.png"), "Selamat & Terjamin", "Kontrak sah, saringan ketat", 4),
    
    # Scene 4: Why - AI Matchmaker (4s)
    (str(IMG_DIR / "why-matchmaker.png"), "AI Matchmaker", "Score keserasian 0-100", 4),
    
    # Scene 5: Step 1 - Register (4s)
    (str(STEPS_DIR / "step1-register-wide.png"), "Langkah 1: Daftar", "Borang online, auto WhatsApp", 4),
    
    # Scene 6: Step 2 - Find Helper (4s)
    (str(STEPS_DIR / "step2-find-wide.png"), "Langkah 2: Cari", "Tapis & pilih pembantu", 4),
    
    # Scene 7: Step 3 - Interview (4s)
    (str(STEPS_DIR / "step3-interview-wide.png"), "Langkah 3: Temuduga", "Google Meet 3 pihak", 4),
    
    # Scene 8: Step 4 - Contract (4s)
    (str(STEPS_DIR / "step4-contract-wide.png"), "Langkah 4: Kontrak", "3 kontrak auto-dijana", 4),
    
    # Scene 9: Step 5 - Start Work (4s)
    (str(STEPS_DIR / "step5-start-wide.png"), "Langkah 5: Mula Kerja", "Pembantu mula bekerja", 4),
    
    # Scene 10: Step 6 - Support (4s)
    (str(STEPS_DIR / "step6-support-wide.png"), "Langkah 6: Sokongan", "AI 24/7 + admin MIM", 4),
    
    # Scene 11: AI Agents (5s)
    (str(IMG_DIR / "ai-agents.png"), "13 AI Agents", "Automate sepenuhnya", 5),
    
    # Scene 12: Why - Training (4s)
    (str(IMG_DIR / "why-training.png"), "Latihan Percuma", "6 modul video wajib", 4),
    
    # Scene 13: Why - Payment (4s)
    (str(IMG_DIR / "why-payment.png"), "Pembayaran Teratur", "Auto-invois & reminder", 4),
    
    # Scene 14: Why - Support (4s)
    (str(IMG_DIR / "why-support.png"), "Sokongan 24/7", "Aida AI sentiasa membantu", 4),
    
    # Scene 15: Outro with logo (3s)
    (str(LOGO), "Daftar Sekarang", "mim-portal.vercel.app", 3),
]

def create_scene(input_image, title, subtitle, duration, output_file):
    """Create a single scene with Ken Burns zoom + text overlay."""
    
    # Calculate zoom (slow zoom in)
    zoom_filter = f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase,crop={WIDTH}:{HEIGHT},zoompan=z='min(zoom+0.0015,1.15)':d={duration*FPS}:s={WIDTH}x{HEIGHT}"
    
    # Text overlay: title (large, top) + subtitle (smaller, bottom)
    # Escape colons and special chars for FFmpeg
    title_escaped = title.replace(":", "\\:").replace("'", "\\'")
    subtitle_escaped = subtitle.replace(":", "\\:").replace("'", "\\'")
    
    drawtext_title = (
        f"drawtext=fontfile={FONT}:text='{title_escaped}':"
        f"fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h*0.15:"
        f"shadowcolor=black@0.8:shadowx=2:shadowy=2:"
        f"box=1:boxcolor=black@0.5:boxborderw=20"
    )
    
    drawtext_subtitle = (
        f"drawtext=fontfile={FONT}:text='{subtitle_escaped}':"
        f"fontcolor=#00bcd4:fontsize=32:x=(w-text_w)/2:y=h*0.82:"
        f"shadowcolor=black@0.8:shadowx=2:shadowy=2"
    )
    
    # Fade in/out
    fade_in = f"fade=t=in:st=0:d=0.5"
    fade_out = f"fade=t=out:st={duration-0.5}:d=0.5"
    
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", input_image,
        "-vf", f"{zoom_filter},{drawtext_title},{drawtext_subtitle},{fade_in},{fade_out}",
        "-c:v", "libx264",
        "-preset", "fast",
        "-tune", "stillimage",
        "-pix_fmt", "yuv420p",
        "-r", str(FPS),
        "-t", str(duration),
        "-b:v", "2M",
        str(output_file),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Error creating scene: {result.stderr[-300:]}")
        return False
    return True

def concat_scenes(scene_files, output_file):
    """Concatenate all scenes into final video."""
    # Create concat list file
    list_file = OUTPUT_DIR / "concat_list.txt"
    with open(list_file, "w") as f:
        for sf in scene_files:
            f.write(f"file '{sf}'\n")
    
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_file),
        "-c", "copy",
        str(output_file),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Concat error: {result.stderr[-300:]}")
        # Try re-encoding
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(list_file),
            "-c:v", "libx264",
            "-preset", "fast",
            "-pix_fmt", "yuv420p",
            "-b:v", "2M",
            str(output_file),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  Concat re-encode error: {result.stderr[-300:]}")
            return False
    return True

def main():
    print("=" * 60)
    print(" Creating MIM Portal Promotional Video (1 minute)")
    print("=" * 60)
    
    scene_files = []
    total_duration = 0
    
    for i, (image, title, subtitle, duration) in enumerate(scenes):
        scene_file = OUTPUT_DIR / f"scene_{i:02d}.mp4"
        print(f"  Scene {i+1}/{len(scenes)}: {title} ({duration}s)")
        
        if create_scene(image, title, subtitle, duration, str(scene_file)):
            scene_files.append(str(scene_file))
            total_duration += duration
        else:
            print(f"  FAILED, skipping")
    
    print(f"\nTotal duration: {total_duration}s")
    print(f"\nConcatenating {len(scene_files)} scenes...")
    
    if concat_scenes(scene_files, str(OUTPUT_VIDEO)):
        print(f"\n✅ Video created: {OUTPUT_VIDEO}")
        print(f"   Size: {OUTPUT_VIDEO.stat().st_size / 1024 / 1024:.1f} MB")
        
        # Get video info
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(OUTPUT_VIDEO)],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            import json
            info = json.loads(result.stdout)
            stream = info.get("streams", [{}])[0]
            fmt = info.get("format", {})
            print(f"   Duration: {float(fmt.get('duration', 0)):.1f}s")
            print(f"   Resolution: {stream.get('width')}x{stream.get('height')}")
            print(f"   Codec: {stream.get('codec_name')}")
    else:
        print(f"\n❌ Failed to create video")
        sys.exit(1)
    
    # Cleanup scene files
    for sf in scene_files:
        Path(sf).unlink(missing_ok=True)
    (OUTPUT_DIR / "concat_list.txt").unlink(missing_ok=True)

if __name__ == "__main__":
    main()
