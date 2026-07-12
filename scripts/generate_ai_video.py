#!/usr/bin/env python3
"""
Generate multiple AI video clips using Zeroscope (text-to-video) on Hugging Face.
Then combine into a 1-minute promotional video with English voiceover.
"""
from gradio_client import Client
import os, shutil, subprocess, time
from pathlib import Path

HF_TOKEN = "os.environ.get("HF_TOKEN", "")"
OUTPUT_DIR = Path("/home/z/my-project/public/videos/svd_clips")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FINAL_VIDEO = Path("/home/z/my-project/public/videos/mim-promo-enhanced.mp4")

print("Connecting to Zeroscope...")
client = Client("https://hysts-zeroscope-v2.hf.space", token=HF_TOKEN)
print("Connected!\n")

# Video prompts (text-to-video, 3 seconds each, 20 clips = 60 seconds)
prompts = [
    ("01_intro", "MIM Portal logo on dark blue background with cyan glow, professional intro animation"),
    ("02_hero", "A happy Malaysian family standing in front of their beautiful modern home with a professional female maid in uniform, Pixar 3D cartoon style"),
    ("03_safety", "A shield icon glowing with blue light protecting a happy family, security concept, 3D cartoon style"),
    ("04_matchmaker", "AI robot connecting two people with glowing lines, matchmaking concept, futuristic 3D cartoon style"),
    ("05_register", "A person filling out an online form on a tablet, WhatsApp notification appearing, 3D cartoon style"),
    ("06_search", "A person browsing helper profiles on a laptop screen, multiple cards floating, 3D cartoon style"),
    ("07_interview", "Three people in a video call on a laptop screen, smiling and talking, 3D cartoon style"),
    ("08_contract", "A contract document being signed with a pen, checkmark stamps appearing, 3D cartoon style"),
    ("09_start", "A cheerful maid in uniform starting to clean a beautiful home, 3D cartoon style"),
    ("10_support", "A friendly AI robot with headphones helping a happy family, chat bubbles, 3D cartoon style"),
    ("11_agents", "Multiple small cute AI robots working on different tasks, connected by glowing lines, 3D cartoon"),
    ("12_training", "A cheerful woman watching an educational video on a screen with a graduation cap, 3D cartoon"),
    ("13_payment", "A happy person paying with a credit card, invoice and receipt appearing, 3D cartoon style"),
    ("14_support2", "An AI assistant robot with a friendly face chatting with a happy family, 3D cartoon style"),
    ("15_outro", "MIM Portal logo with text Register Now, website URL, dark blue background, 3D cartoon style"),
    ("16_maid", "A professional female maid cleaning a modern kitchen, smiling, Pixar 3D cartoon style"),
    ("17_babysitter", "A caring babysitter playing with happy children, toys around, Pixar 3D cartoon style"),
    ("18_caregiver", "A kind caregiver helping an elderly person, warm atmosphere, Pixar 3D cartoon style"),
    ("19_team", "A diverse team collaborating in a modern office, laptops and documents, 3D cartoon style"),
    ("20_celebration", "A happy family and maid celebrating together, confetti, Pixar 3D cartoon style"),
]

clips = []

for name, prompt in prompts:
    clip_path = OUTPUT_DIR / f"{name}.mp4"
    
    if clip_path.exists():
        print(f"  {name}: Exists ({clip_path.stat().st_size/1024:.0f} KB)")
        clips.append(str(clip_path))
        continue
    
    print(f"  {name}: Generating...")
    try:
        result = client.predict(
            prompt=prompt,
            seed=42,
            num_frames=24,
            num_inference_steps=25,
            api_name="/run"
        )
        
        if isinstance(result, str) and os.path.exists(result):
            shutil.copy(result, str(clip_path))
            size = clip_path.stat().st_size / 1024
            print(f"    OK ({size:.0f} KB)")
            clips.append(str(clip_path))
        else:
            print(f"    Failed: {str(result)[:100]}")
    except Exception as e:
        print(f"    Error: {str(e)[:150]}")
    
    time.sleep(3)  # Rate limit

print(f"\n{'='*60}")
print(f"Generated {len(clips)}/{len(prompts)} clips")
print(f"{'='*60}")

# Concatenate all clips into 1 video
if len(clips) >= 10:
    print("\n=== Concatenating clips ===")
    list_file = OUTPUT_DIR / "concat_list.txt"
    with open(list_file, "w") as f:
        for clip in clips:
            f.write(f"file '{clip}'\n")
    
    # Concat with re-encoding
    combined = OUTPUT_DIR / "combined_raw.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_file),
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
        "-b:v", "2M", "-r", "8",
        str(combined)
    ], capture_output=True, text=True, timeout=120)
    
    print(f"Combined video: {combined.stat().st_size/1024/1024:.1f} MB")
    
    # Generate English voiceover
    print("\n=== Generating voiceover ===")
    voice_parts = [
        ("voice_01", "Welcome to MIM Portal. Maid In Malaysia. The professional house helper platform for Malaysian families. Find professional and trusted house helpers, babysitters, and elderly caregivers."),
        ("voice_02", "Our AI Matchmaker scores compatibility from zero to one hundred. Step one, register online. Step two, search and choose. Step three, interview via Google Meet."),
        ("voice_03", "Step four, sign contracts. Step five, helper starts work. Step six, continuous support. Thirteen AI agents fully automate everything. Register now at MIM Portal."),
    ]
    
    voice_files = []
    for name, text in voice_parts:
        vfile = OUTPUT_DIR / f"{name}.wav"
        r = subprocess.run([
            "z-ai", "tts", "-i", text, "-o", str(vfile),
            "--voice", "jam", "--speed", "1.0", "--format", "wav"
        ], capture_output=True, text=True, timeout=60)
        if vfile.exists():
            voice_files.append(str(vfile))
            print(f"  {name}: OK ({vfile.stat().st_size/1024:.0f} KB)")
    
    # Concat voiceover
    if voice_files:
        vlist = OUTPUT_DIR / "voice_list.txt"
        with open(vlist, "w") as f:
            for vf in voice_files:
                f.write(f"file '{vf}'\n")
        
        voiceover = OUTPUT_DIR / "voiceover.wav"
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", str(vlist), "-c", "copy", str(voiceover)
        ], capture_output=True, text=True)
        print(f"  Voiceover: {voiceover.stat().st_size/1024/1024:.1f} MB")
    
    # Generate music
    print("\n=== Generating music ===")
    music = OUTPUT_DIR / "music.wav"
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "sine=frequency=110:duration=65,volume=0.05",
        "-f", "lavfi", "-i", "sine=frequency=220:duration=65,volume=0.03",
        "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=longest,lowpass=f=500,volume=0.3",
        "-t", "65", "-ar", "44100", "-ac", "2", str(music)
    ], capture_output=True, text=True)
    
    # Trim voiceover to match video duration
    video_dur = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(combined)],
        capture_output=True, text=True
    ).stdout.strip()
    print(f"Video duration: {video_dur}s")
    
    voice_trimmed = OUTPUT_DIR / "voice_trimmed.wav"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(voiceover), "-t", video_dur, "-c", "copy", str(voice_trimmed)
    ], capture_output=True, text=True)
    
    # Final mix
    print("\n=== Final mix: video + voiceover + music ===")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(combined),
        "-i", str(voice_trimmed),
        "-i", str(music),
        "-filter_complex",
        "[1:a]volume=1.0[voice];[2:a]volume=0.10[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]",
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p", "-b:v", "2M",
        "-c:a", "aac", "-b:a", "128k", "-shortest",
        str(FINAL_VIDEO)
    ], capture_output=True, text=True, timeout=120)
    
    # Cleanup
    combined.unlink(missing_ok=True)
    voiceover.unlink(missing_ok=True)
    voice_trimmed.unlink(missing_ok=True)
    music.unlink(missing_ok=True)
    list_file.unlink(missing_ok=True)
    vlist.unlink(missing_ok=True)
    for vf in voice_files:
        Path(vf).unlink(missing_ok=True)
    for clip in clips:
        Path(clip).unlink(missing_ok=True)
    
    # Verify
    if FINAL_VIDEO.exists():
        r = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(FINAL_VIDEO)],
            capture_output=True, text=True
        )
        dur = float(r.stdout.strip())
        size_mb = FINAL_VIDEO.stat().st_size / 1024 / 1024
        print(f"\n✅ FINAL VIDEO: {FINAL_VIDEO}")
        print(f"   Duration: {dur:.1f}s")
        print(f"   Size: {size_mb:.1f} MB")
        print(f"   Clips used: {len(clips)}")
else:
    print("Not enough clips generated for final video")
