#!/usr/bin/env python3
"""
Fast approach: Generate 5 key AI video clips, combine with FFmpeg clips.
"""
from gradio_client import Client
import os, shutil, subprocess, time
from pathlib import Path

HF_TOKEN = "os.environ.get("HF_TOKEN", "")"
OUTPUT_DIR = Path("/home/z/my-project/public/videos/svd_clips")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FINAL_VIDEO = Path("/home/z/my-project/public/videos/mim-promo-enhanced.mp4")

IMG_DIR = Path("/home/z/my-project/public/images/pixar")
STEPS_DIR = Path("/home/z/my-project/public/images/steps-pixar")
LOGO = Path("/home/z/my-project/public/logo-mim.png")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

print("Connecting to Zeroscope (text-to-video)...")
client = Client("https://hysts-zeroscope-v2.hf.space", token=HF_TOKEN)
print("Connected!\n")

# Generate 5 key AI clips (most impactful scenes)
ai_prompts = [
    ("ai_hero", "A happy Malaysian family with a professional female maid in uniform cleaning a beautiful modern home, Pixar Disney 3D cartoon style, bright colors"),
    ("ai_matchmaker", "AI robot connecting two people with glowing cyan lines, matchmaking concept, futuristic 3D cartoon style, dark blue background"),
    ("ai_interview", "Three people in a video call on laptop screen, smiling, Google Meet interview, 3D cartoon style"),
    ("ai_agents", "Multiple small cute AI robots working on different tasks, connected by glowing cyan lines, dark blue background, 3D cartoon"),
    ("ai_celebration", "A happy family and maid celebrating together, confetti falling, Pixar 3D cartoon style, bright cheerful atmosphere"),
]

print("=== Generating 5 AI video clips ===")
ai_clips = []
for name, prompt in ai_prompts:
    clip = OUTPUT_DIR / f"{name}.mp4"
    if clip.exists():
        print(f"  {name}: Exists ({clip.stat().st_size/1024:.0f} KB)")
        ai_clips.append(str(clip))
        continue
    
    print(f"  {name}: Generating...")
    try:
        result = client.predict(
            prompt=prompt, seed=42, num_frames=24, num_inference_steps=25, api_name="/run"
        )
        if isinstance(result, str) and os.path.exists(result):
            shutil.copy(result, str(clip))
            print(f"    OK ({clip.stat().st_size/1024:.0f} KB)")
            ai_clips.append(str(clip))
        else:
            print(f"    Failed")
    except Exception as e:
        print(f"    Error: {str(e)[:100]}")
    time.sleep(2)

print(f"\nAI clips: {len(ai_clips)}/5")

# Create FFmpeg clips for remaining scenes (3s each, cinematic motion)
print("\n=== Creating FFmpeg clips for remaining scenes ===")

ffmpeg_scenes = [
    ("ff_intro", str(LOGO), "zoom_in"),
    ("ff_safety", str(IMG_DIR / "why-safety.png"), "zoom_in"),
    ("ff_register", str(STEPS_DIR / "step1-register-wide.png"), "pan_right"),
    ("ff_search", str(STEPS_DIR / "step2-find-wide.png"), "pan_right"),
    ("ff_contract", str(STEPS_DIR / "step4-contract-wide.png"), "zoom_in"),
    ("ff_start", str(STEPS_DIR / "step5-start-wide.png"), "pan_right"),
    ("ff_support", str(STEPS_DIR / "step6-support-wide.png"), "zoom_out"),
    ("ff_training", str(IMG_DIR / "why-training.png"), "zoom_in"),
    ("ff_payment", str(IMG_DIR / "why-payment.png"), "pan_right"),
    ("ff_support2", str(IMG_DIR / "why-support.png"), "zoom_out"),
    ("ff_maid", str(IMG_DIR / "maid.png"), "zoom_in"),
    ("ff_outro", str(LOGO), "zoom_in"),
]

FPS = 8
ffmpeg_clips = []

for name, image, effect in ffmpeg_scenes:
    clip = OUTPUT_DIR / f"{name}.mp4"
    if clip.exists():
        ffmpeg_clips.append(str(clip))
        continue
    
    if effect == "zoom_in":
        vf = f"scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d={FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15"
    elif effect == "zoom_out":
        vf = f"scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='if(lte(zoom,1.0),1.1,max(1.0,zoom-0.001))':d={FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15"
    elif effect == "pan_right":
        vf = f"scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='1.05':x='(iw-iw/zoom)*on/{FPS*3}':y='ih/2-(ih/zoom/2)':d={FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15"
    else:
        vf = f"scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d={FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15"
    
    subprocess.run([
        "ffmpeg", "-y", "-loop", "1", "-i", image,
        "-vf", vf, "-c:v", "libx264", "-preset", "fast",
        "-pix_fmt", "yuv420p", "-t", "3", "-b:v", "2M", "-r", str(FPS),
        str(clip)
    ], capture_output=True, text=True, timeout=30)
    
    if clip.exists():
        print(f"  {name}: OK")
        ffmpeg_clips.append(str(clip))

# Combine all clips in order: mix AI and FFmpeg
print("\n=== Combining all clips ===")
all_clips = [
    ffmpeg_clips[0],  # intro
    ai_clips[0] if len(ai_clips) > 0 else ffmpeg_clips[1],  # hero (AI)
    ffmpeg_clips[1],  # safety
    ai_clips[1] if len(ai_clips) > 1 else ffmpeg_clips[2],  # matchmaker (AI)
    ffmpeg_clips[2],  # register
    ffmpeg_clips[3],  # search
    ai_clips[2] if len(ai_clips) > 2 else ffmpeg_clips[4],  # interview (AI)
    ffmpeg_clips[4],  # contract
    ffmpeg_clips[5],  # start
    ffmpeg_clips[6],  # support
    ai_clips[3] if len(ai_clips) > 3 else ffmpeg_clips[7],  # agents (AI)
    ffmpeg_clips[7],  # training
    ffmpeg_clips[8],  # payment
    ffmpeg_clips[9],  # support2
    ffmpeg_clips[10],  # maid
    ai_clips[4] if len(ai_clips) > 4 else ffmpeg_clips[11],  # celebration (AI)
    ffmpeg_clips[11],  # outro
]

# Write concat list
list_file = OUTPUT_DIR / "concat_list.txt"
with open(list_file, "w") as f:
    for clip in all_clips:
        if os.path.exists(clip):
            f.write(f"file '{clip}'\n")

# Concat
combined = OUTPUT_DIR / "combined_raw.mp4"
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", str(list_file),
    "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-b:v", "2M", "-r", str(FPS),
    str(combined)
], capture_output=True, text=True, timeout=120)

dur = subprocess.run(
    ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(combined)],
    capture_output=True, text=True
).stdout.strip()
print(f"Combined video: {dur}s")

# Generate voiceover
print("\n=== Generating English voiceover ===")
voice_scripts = [
    ("v1", "Welcome to MIM Portal. Maid In Malaysia. The professional house helper platform for Malaysian families. Find professional and trusted house helpers, babysitters, and elderly caregivers."),
    ("v2", "Our AI Matchmaker scores compatibility from zero to one hundred. Step one, register online. Step two, search and choose. Step three, interview via Google Meet. Step four, sign contracts. Step five, helper starts work. Step six, continuous support."),
    ("v3", "Thirteen AI agents fully automate everything. Register now at MIM Portal. Maid In Malaysia. By Kino Studios."),
]

voice_files = []
for name, text in voice_scripts:
    vfile = OUTPUT_DIR / f"{name}.wav"
    subprocess.run([
        "z-ai", "tts", "-i", text, "-o", str(vfile),
        "--voice", "jam", "--speed", "1.0", "--format", "wav"
    ], capture_output=True, text=True, timeout=60)
    if vfile.exists():
        voice_files.append(str(vfile))
        print(f"  {name}: OK")

# Concat voiceover
vlist = OUTPUT_DIR / "vlist.txt"
with open(vlist, "w") as f:
    for vf in voice_files:
        f.write(f"file '{vf}'\n")

voiceover = OUTPUT_DIR / "voiceover.wav"
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", str(vlist), "-c", "copy", str(voiceover)
], capture_output=True, text=True)

# Trim voiceover to video duration
voice_trimmed = OUTPUT_DIR / "voice_trimmed.wav"
subprocess.run([
    "ffmpeg", "-y", "-i", str(voiceover), "-t", dur, "-c", "copy", str(voice_trimmed)
], capture_output=True, text=True)

# Generate music
print("\n=== Generating music ===")
music = OUTPUT_DIR / "music.wav"
subprocess.run([
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", f"sine=frequency=110:duration={dur},volume=0.05",
    "-f", "lavfi", "-i", f"sine=frequency=220:duration={dur},volume=0.03",
    "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=longest,lowpass=f=500,volume=0.3",
    "-t", dur, "-ar", "44100", "-ac", "2", str(music)
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
import shutil as sh
sh.rmtree(OUTPUT_DIR, ignore_errors=True)

# Verify
if FINAL_VIDEO.exists():
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(FINAL_VIDEO)],
        capture_output=True, text=True
    )
    final_dur = float(r.stdout.strip())
    size_mb = FINAL_VIDEO.stat().st_size / 1024 / 1024
    
    # Check audio
    r2 = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_streams", "-of", "csv=p=0", str(FINAL_VIDEO)],
        capture_output=True, text=True
    )
    has_audio = "audio" in r2.stdout.lower()
    
    print(f"\n{'='*60}")
    print(f"✅ FINAL VIDEO CREATED")
    print(f"{'='*60}")
    print(f"   File: {FINAL_VIDEO}")
    print(f"   Duration: {final_dur:.1f}s")
    print(f"   Size: {size_mb:.1f} MB")
    print(f"   Audio: {'YES (English voiceover + music)' if has_audio else 'NO'}")
    print(f"   AI clips: {len(ai_clips)}")
    print(f"   FFmpeg clips: {len(ffmpeg_clips)}")
else:
    print("\n❌ Failed to create video")
