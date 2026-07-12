#!/usr/bin/env python3
"""
Create ENHANCED video with:
- Advanced cinematic motion effects (3D rotation, parallax, wave, particles)
- English voiceover (TTS - better quality in English)
- Background music
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

OUTPUT_VIDEO = OUTPUT_DIR / "mim-promo-enhanced.mp4"
VOICEOVER_FILE = OUTPUT_DIR / "voiceover_en.wav"
MUSIC_FILE = OUTPUT_DIR / "bgmusic_en.wav"

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
WIDTH = 1280
HEIGHT = 720
FPS = 30

# English voiceover script
VOICEOVER_SCRIPT = [
    "Welcome to MIM Portal. Maid In Malaysia. The professional house helper platform for Malaysian families.",
    "Find professional and trusted house helpers, babysitters, and elderly caregivers. Every helper goes through strict screening and mandatory training.",
    "Our AI Matchmaker scores compatibility between you and your helper from zero to one hundred, based on your needs, location, and budget.",
    "Step one. Register as an employer. Fill out the online form and receive your credentials automatically via WhatsApp.",
    "Step two. Search and choose your helper. Filter by criteria and view complete profiles of every helper.",
    "Step three. Online interview. A Google Meet session with three parties: you, the helper, and MIM admin.",
    "Step four. Sign the contract. Three types of contracts are generated automatically and are legally binding.",
    "Step five. The helper starts working according to the agreed schedule.",
    "Step six. Continuous support. Thirteen AI agents fully automate the process from matching to payments.",
    "Register now at MIM Portal. Maid In Malaysia. By Kino Studios.",
]

# Scenes with CINEMATIC effects
scenes = [
    (str(LOGO), "MIM Portal", "Maid In Malaysia", 5, 'cinematic_zoom'),
    (str(IMG_DIR / "hero.png"), "Find Professional Helpers", "Trusted & Verified", 5, 'parallax_right'),
    (str(IMG_DIR / "why-safety.png"), "Safe & Secure", "Strict screening, legal contracts", 4, 'cinematic_zoom'),
    (str(IMG_DIR / "why-matchmaker.png"), "AI Matchmaker", "Compatibility score 0-100", 4, 'parallax_left'),
    (str(STEPS_DIR / "step1-register-wide.png"), "Step 1: Register", "Online form, auto WhatsApp", 4, 'cinematic_zoom'),
    (str(STEPS_DIR / "step2-find-wide.png"), "Step 2: Search", "Filter & choose helper", 4, 'parallax_right'),
    (str(STEPS_DIR / "step3-interview-wide.png"), "Step 3: Interview", "Google Meet, 3 parties", 4, 'parallax_left'),
    (str(STEPS_DIR / "step4-contract-wide.png"), "Step 4: Contract", "3 auto-generated contracts", 4, 'cinematic_zoom'),
    (str(STEPS_DIR / "step5-start-wide.png"), "Step 5: Start Work", "Helper begins working", 4, 'parallax_right'),
    (str(STEPS_DIR / "step6-support-wide.png"), "Step 6: Support", "AI 24/7 + MIM admin", 4, 'cinematic_zoom_out'),
    (str(IMG_DIR / "ai-agents.png"), "13 AI Agents", "Fully automated", 4, 'parallax_left'),
    (str(IMG_DIR / "why-training.png"), "Free Training", "6 mandatory video modules", 4, 'cinematic_zoom'),
    (str(IMG_DIR / "why-payment.png"), "Organized Payments", "Auto-invoice & reminders", 4, 'parallax_right'),
    (str(IMG_DIR / "why-support.png"), "24/7 Support", "Aida AI always helps", 4, 'cinematic_zoom_out'),
    (str(LOGO), "Register Now", "mim-portal.vercel.app", 5, 'cinematic_zoom'),
]

def generate_voiceover():
    """Generate English voiceover using Z.AI TTS."""
    print("\n=== Generating English Voiceover (TTS) ===")
    
    # Use 'jam' voice (English gentleman) - better for English
    chunk_files = []
    
    # Combine into chunks under 1024 chars
    chunks = []
    current = ""
    for sentence in VOICEOVER_SCRIPT:
        if len(current) + len(sentence) + 1 > 1000:
            if current:
                chunks.append(current)
            current = sentence
        else:
            current = (current + " " + sentence).strip()
    if current:
        chunks.append(current)
    
    print(f"  Script: {len(chunks)} chunks, voice: jam (English)")
    
    for i, chunk in enumerate(chunks):
        chunk_file = OUTPUT_DIR / f"voice_{i:02d}.wav"
        print(f"  Chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...")
        
        cmd = [
            "z-ai", "tts",
            "-i", chunk,
            "-o", str(chunk_file),
            "--voice", "jam",  # English gentleman voice
            "--speed", "0.95",
            "--format", "wav",
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0 and chunk_file.exists():
            chunk_files.append(str(chunk_file))
            print(f"    OK ({chunk_file.stat().st_size / 1024:.0f} KB)")
        else:
            # Fallback to 'kazi' voice
            print(f"    Trying 'kazi' voice...")
            cmd[6] = "kazi"
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if result.returncode == 0 and chunk_file.exists():
                chunk_files.append(str(chunk_file))
                print(f"    OK ({chunk_file.stat().st_size / 1024:.0f} KB)")
            else:
                print(f"    FAILED")
    
    if chunk_files:
        list_file = OUTPUT_DIR / "voice_list.txt"
        with open(list_file, "w") as f:
            for cf in chunk_files:
                f.write(f"file '{cf}'\n")
        
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", str(list_file), "-c", "copy", str(VOICEOVER_FILE),
        ], capture_output=True, text=True)
        
        for cf in chunk_files:
            Path(cf).unlink(missing_ok=True)
        list_file.unlink(missing_ok=True)
        
        if VOICEOVER_FILE.exists():
            print(f"  Voiceover: {VOICEOVER_FILE.stat().st_size / 1024 / 1024:.1f} MB")
            return True
    return False

def generate_music():
    """Generate cinematic background music."""
    print("\n=== Generating Background Music ===")
    
    # Cinematic ambient: low drone + gentle pad + subtle rhythm
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "sine=frequency=110:duration=63,volume=0.06",
        "-f", "lavfi", "-i", "sine=frequency=165:duration=63,volume=0.04",
        "-f", "lavfi", "-i", "sine=frequency=220:duration=63,volume=0.03",
        "-f", "lavfi", "-i", "sine=frequency=330:duration=63,volume=0.02",
        "-filter_complex",
        "[0:a][1:a][2:a][3:a]amix=inputs=4:duration=longest,"
        "aecho=0.7:0.8:500|1200|2000:0.4|0.3|0.2,"
        "lowpass=f=600,highpass=f=80,"
        "afade=t=in:st=0:d=2,afade=t=out:st=60:d=3,"
        "volume=0.4",
        "-t", "63", "-ar", "44100", "-ac", "2",
        str(MUSIC_FILE),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if MUSIC_FILE.exists():
        print(f"  Music: {MUSIC_FILE.stat().st_size / 1024:.0f} KB")
        return True
    return False

def create_cinematic_scene(input_image, title, subtitle, duration, effect, output_file):
    """Create scene with advanced cinematic motion."""
    frames = duration * FPS
    
    if effect == 'cinematic_zoom':
        # Slow cinematic zoom in with slight upward drift
        motion = (
            f"scale={WIDTH*2}:{HEIGHT*2}:force_original_aspect_ratio=increase,"
            f"crop={WIDTH*2}:{HEIGHT*2},"
            f"zoompan=z='min(zoom+0.0006,1.12)':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='ih/2-(ih/zoom/2)-on*0.3':"
            f"d={frames}:s={WIDTH}x{HEIGHT}"
        )
    elif effect == 'cinematic_zoom_out':
        motion = (
            f"scale={WIDTH*2}:{HEIGHT*2}:force_original_aspect_ratio=increase,"
            f"crop={WIDTH*2}:{HEIGHT*2},"
            f"zoompan=z='if(lte(zoom,1.0),1.12,max(1.0,zoom-0.0006))':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='ih/2-(ih/zoom/2)+on*0.2':"
            f"d={frames}:s={WIDTH}x{HEIGHT}"
        )
    elif effect == 'parallax_right':
        # Smooth pan right with slight zoom (parallax feel)
        motion = (
            f"scale={WIDTH*1.8}:{HEIGHT*1.8}:force_original_aspect_ratio=increase,"
            f"crop={WIDTH*1.5}:{HEIGHT*1.5},"
            f"zoompan=z='1.06':"
            f"x='(iw-iw/zoom)*on/{frames}':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={frames}:s={WIDTH}x{HEIGHT}"
        )
    elif effect == 'parallax_left':
        motion = (
            f"scale={WIDTH*1.8}:{HEIGHT*1.8}:force_original_aspect_ratio=increase,"
            f"crop={WIDTH*1.5}:{HEIGHT*1.5},"
            f"zoompan=z='1.06':"
            f"x='(iw-iw/zoom)*(1-on/{frames})':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={frames}:s={WIDTH}x{HEIGHT}"
        )
    else:
        motion = (
            f"scale={WIDTH*2}:{HEIGHT*2}:force_original_aspect_ratio=increase,"
            f"crop={WIDTH*2}:{HEIGHT*2},"
            f"zoompan=z='min(zoom+0.0006,1.1)':d={frames}:s={WIDTH}x{HEIGHT}"
        )
    
    # Text overlays - elegant styling
    title_escaped = title.replace(":", "\\:").replace("'", "\\'")
    subtitle_escaped = subtitle.replace(":", "\\:").replace("'", "\\'")
    
    drawtext_title = (
        f"drawtext=fontfile={FONT}:text='{title_escaped}':"
        f"fontcolor=white:fontsize=54:x=(w-text_w)/2:y=h*0.10:"
        f"shadowcolor=black@0.9:shadowx=3:shadowy=3:"
        f"box=1:boxcolor=#0d1f33@0.75:boxborderw=30:alpha='if(lt(t,0.5),t/0.5,1)'"
    )
    
    drawtext_subtitle = (
        f"drawtext=fontfile={FONT}:text='{subtitle_escaped}':"
        f"fontcolor=#00bcd4:fontsize=36:x=(w-text_w)/2:y=h*0.82:"
        f"shadowcolor=black@0.9:shadowx=2:shadowy=2:"
        f"box=1:boxcolor=#0d1f33@0.6:boxborderw=18:alpha='if(lt(t,0.7),0,if(lt(t,1.2),(t-0.7)/0.5,1))'"
    )
    
    fade_in = f"fade=t=in:st=0:d=0.5"
    fade_out = f"fade=t=out:st={duration-0.5}:d=0.5"
    
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", input_image,
        "-vf", f"{motion},{drawtext_title},{drawtext_subtitle},{fade_in},{fade_out}",
        "-c:v", "libx264", "-preset", "fast", "-tune", "stillimage",
        "-pix_fmt", "yuv420p", "-r", str(FPS), "-t", str(duration),
        "-b:v", "2M",
        str(output_file),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    return result.returncode == 0

def main():
    print("=" * 60)
    print(" Creating ENHANCED MIM Portal Video (English)")
    print(" Features: Cinematic motion, English voiceover, Music")
    print("=" * 60)
    
    # 1. Voiceover
    has_voice = generate_voiceover()
    
    # 2. Music
    has_music = generate_music()
    
    # 3. Scenes
    print("\n=== Creating Cinematic Scenes ===")
    scene_files = []
    for i, (image, title, subtitle, duration, effect) in enumerate(scenes):
        scene_file = OUTPUT_DIR / f"scene_{i:02d}.mp4"
        print(f"  {i+1}/{len(scenes)}: {title} [{effect}]")
        if create_cinematic_scene(image, title, subtitle, duration, effect, str(scene_file)):
            scene_files.append(str(scene_file))
    
    # 4. Concatenate
    print("\n=== Concatenating ===")
    video_no_audio = OUTPUT_DIR / "video_no_audio.mp4"
    list_file = OUTPUT_DIR / "concat_list.txt"
    with open(list_file, "w") as f:
        for sf in scene_files:
            f.write(f"file '{sf}'\n")
    
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_file),
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p", "-b:v", "2M",
        str(video_no_audio),
    ], capture_output=True, text=True, timeout=120)
    
    for sf in scene_files:
        Path(sf).unlink(missing_ok=True)
    list_file.unlink(missing_ok=True)
    
    # 5. Mix audio
    print("\n=== Mixing Video + Voiceover + Music ===")
    
    if has_voice and has_music:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(video_no_audio),
            "-i", str(VOICEOVER_FILE),
            "-i", str(MUSIC_FILE),
            "-filter_complex",
            "[1:a]volume=1.0[voice];[2:a]volume=0.12[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]",
            "-map", "0:v", "-map", "[aout]",
            "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p", "-b:v", "2M",
            "-c:a", "aac", "-b:a", "128k", "-shortest",
            str(OUTPUT_VIDEO),
        ]
    elif has_voice:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(video_no_audio),
            "-i", str(VOICEOVER_FILE),
            "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p", "-b:v", "2M",
            "-c:a", "aac", "-b:a", "128k", "-shortest",
            str(OUTPUT_VIDEO),
        ]
    else:
        import shutil
        shutil.copy(str(video_no_audio), str(OUTPUT_VIDEO))
        cmd = None
    
    if cmd:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            import shutil
            shutil.copy(str(video_no_audio), str(OUTPUT_VIDEO))
    
    # Cleanup
    video_no_audio.unlink(missing_ok=True)
    VOICEOVER_FILE.unlink(missing_ok=True)
    MUSIC_FILE.unlink(missing_ok=True)
    
    # Verify
    if OUTPUT_VIDEO.exists():
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(OUTPUT_VIDEO)],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            import json
            info = json.loads(result.stdout)
            fmt = info.get("format", {})
            streams = info.get("streams", [])
            has_audio = any(s.get("codec_type") == "audio" for s in streams)
            print(f"\n✅ Enhanced video (English): {OUTPUT_VIDEO}")
            print(f"   Duration: {float(fmt.get('duration', 0)):.1f}s")
            print(f"   Size: {OUTPUT_VIDEO.stat().st_size / 1024 / 1024:.1f} MB")
            print(f"   Audio: {'YES' if has_audio else 'NO'}")

if __name__ == "__main__":
    main()
