#!/usr/bin/env python3
"""
Create enhanced 1-minute MIM Portal promo video with:
- Dynamic motion effects (pan, zoom, parallax) on each image
- Voiceover in Bahasa Malaysia (TTS)
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
VOICEOVER_FILE = OUTPUT_DIR / "voiceover.wav"
MUSIC_FILE = OUTPUT_DIR / "bgmusic.wav"

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

WIDTH = 1280
HEIGHT = 720
FPS = 30

# Voiceover script (Bahasa Malaysia) - split into chunks under 1024 chars
VOICEOVER_SCRIPT = [
    "Selamat datang ke MIM Portal. Maid In Malaysia. Platform pembantu rumah profesional untuk keluarga Malaysia.",
    "Cari pembantu rumah, pengasuh, atau penjaga orang tua yang profesional dan terpercaya. Semua pembantu melalui saringan ketat dan latihan wajib.",
    "AI Matchmaker kami akan score keserasian antara anda dan pembantu dari kosong ke seratus, berdasarkan keperluan, kawasan, dan bajet anda.",
    "Langkah satu. Daftar sebagai majikan. Isi borang online dan terima kredensial secara automatik melalui WhatsApp.",
    "Langkah dua. Cari dan pilih pembantu. Tapis mengikut kriteria dan lihat profil lengkap setiap pembantu.",
    "Langkah tiga. Temuduga online. Sesi Google Meet tiga pihak, anda, pembantu, dan admin MIM.",
    "Langkah empat. Tandatangan kontrak. Tiga jenis kontrak dijana secara automatik dan sah undang-undang.",
    "Langkah lima. Pembantu mula bekerja mengikut jadual yang dipersetujui.",
    "Langkah enam. Sokongan berterusan. Tiga belas AI agents mengautomate sepenuhnya proses dari padanan sehingga pembayaran.",
    "Daftar sekarang di MIM Portal. Maid In Malaysia. Oleh Kino Studios.",
]

# Scenes with motion effects: (image, title, subtitle, duration, effect)
# Effects: 'zoom_in', 'zoom_out', 'pan_right', 'pan_left', 'pan_up', 'pan_down'
scenes = [
    (str(LOGO), "MIM Portal", "Maid In Malaysia", 5, 'zoom_in'),
    (str(IMG_DIR / "hero.png"), "Cari Pembantu Rumah", "Profesional & Terpercaya", 5, 'pan_right'),
    (str(IMG_DIR / "why-safety.png"), "Selamat & Terjamin", "Saringan ketat, kontrak sah", 4, 'zoom_in'),
    (str(IMG_DIR / "why-matchmaker.png"), "AI Matchmaker", "Score keserasian 0-100", 4, 'pan_left'),
    (str(STEPS_DIR / "step1-register-wide.png"), "Langkah 1: Daftar", "Borang online, auto WhatsApp", 4, 'zoom_in'),
    (str(STEPS_DIR / "step2-find-wide.png"), "Langkah 2: Cari", "Tapis & pilih pembantu", 4, 'pan_right'),
    (str(STEPS_DIR / "step3-interview-wide.png"), "Langkah 3: Temuduga", "Google Meet 3 pihak", 4, 'pan_left'),
    (str(STEPS_DIR / "step4-contract-wide.png"), "Langkah 4: Kontrak", "3 kontrak auto-dijana", 4, 'zoom_in'),
    (str(STEPS_DIR / "step5-start-wide.png"), "Langkah 5: Mula Kerja", "Pembantu mula bekerja", 4, 'pan_right'),
    (str(STEPS_DIR / "step6-support-wide.png"), "Langkah 6: Sokongan", "AI 24/7 + admin MIM", 4, 'zoom_out'),
    (str(IMG_DIR / "ai-agents.png"), "13 AI Agents", "Automate sepenuhnya", 4, 'pan_left'),
    (str(IMG_DIR / "why-training.png"), "Latihan Percuma", "6 modul video wajib", 4, 'zoom_in'),
    (str(IMG_DIR / "why-payment.png"), "Pembayaran Teratur", "Auto-invois & reminder", 4, 'pan_right'),
    (str(IMG_DIR / "why-support.png"), "Sokongan 24/7", "Aida AI sentiasa membantu", 4, 'zoom_out'),
    (str(LOGO), "Daftar Sekarang", "mim-portal.vercel.app", 5, 'zoom_in'),
]

def generate_voiceover():
    """Generate voiceover using z-ai TTS CLI."""
    print("\n=== Generating Voiceover (TTS) ===")
    
    # Combine all script chunks
    full_text = " ".join(VOICEOVER_SCRIPT)
    # TTS max is 1024 chars, split if needed
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
    
    print(f"  Script split into {len(chunks)} chunks")
    
    chunk_files = []
    for i, chunk in enumerate(chunks):
        chunk_file = OUTPUT_DIR / f"voice_{i:02d}.wav"
        print(f"  Generating chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...")
        
        cmd = [
            "z-ai", "tts",
            "-i", chunk,
            "-o", str(chunk_file),
            "--voice", "tongtong",
            "--speed", "0.9",
            "--format", "wav",
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0 and chunk_file.exists():
            chunk_files.append(str(chunk_file))
            print(f"    OK ({chunk_file.stat().st_size / 1024:.0f} KB)")
        else:
            print(f"    FAILED: {result.stderr[:200]}")
    
    # Concatenate voice chunks
    if chunk_files:
        list_file = OUTPUT_DIR / "voice_list.txt"
        with open(list_file, "w") as f:
            for cf in chunk_files:
                f.write(f"file '{cf}'\n")
        
        result = subprocess.run([
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0",
            "-i", str(list_file),
            "-c", "copy",
            str(VOICEOVER_FILE),
        ], capture_output=True, text=True)
        
        # Cleanup chunks
        for cf in chunk_files:
            Path(cf).unlink(missing_ok=True)
        list_file.unlink(missing_ok=True)
        
        if VOICEOVER_FILE.exists():
            print(f"  Voiceover created: {VOICEOVER_FILE.stat().st_size / 1024 / 1024:.1f} MB")
            return True
    
    return False

def generate_background_music():
    """Generate ambient background music using FFmpeg."""
    print("\n=== Generating Background Music ===")
    
    # Generate a gentle ambient pad sound (60 seconds)
    # Using FFmpeg's lavfi source with multiple sine waves + reverb
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "sine=frequency=220:duration=60,volume=0.08",
        "-f", "lavfi",
        "-i", "sine=frequency=330:duration=60,volume=0.05",
        "-f", "lavfi",
        "-i", "sine=frequency=440:duration=60,volume=0.03",
        "-filter_complex",
        "[0:a][1:a][2:a]amix=inputs=3:duration=longest,aecho=0.8:0.9:1000|1800:0.3|0.2,lowpass=f=800,volume=0.5",
        "-t", "60",
        "-ar", "44100",
        "-ac", "2",
        str(MUSIC_FILE),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if MUSIC_FILE.exists():
        print(f"  Music created: {MUSIC_FILE.stat().st_size / 1024:.0f} KB")
        return True
    else:
        print(f"  Music generation failed: {result.stderr[-200:]}")
        return False

def create_scene_with_motion(input_image, title, subtitle, duration, effect, output_file):
    """Create a scene with dynamic motion effect."""
    
    frames = duration * FPS
    
    # Build motion filter based on effect type
    if effect == 'zoom_in':
        # Slow zoom in from 1.0 to 1.15
        motion = f"scale={WIDTH*2}:{HEIGHT*2}:force_original_aspect_ratio=increase,crop={WIDTH*2}:{HEIGHT*2},zoompan=z='min(zoom+0.0008,1.15)':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}"
    elif effect == 'zoom_out':
        # Slow zoom out from 1.15 to 1.0
        motion = f"scale={WIDTH*2}:{HEIGHT*2}:force_original_aspect_ratio=increase,crop={WIDTH*2}:{HEIGHT*2},zoompan=z='if(lte(zoom,1.0),1.15,max(1.0,zoom-0.0008))':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}"
    elif effect == 'pan_right':
        # Pan from left to right with slight zoom
        motion = f"scale={WIDTH*1.5}:{HEIGHT*1.5}:force_original_aspect_ratio=increase,crop={WIDTH*1.3}:{HEIGHT*1.3},zoompan=z='1.05':d={frames}:x='(iw-iw/zoom)*on/{frames}':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}"
    elif effect == 'pan_left':
        motion = f"scale={WIDTH*1.5}:{HEIGHT*1.5}:force_original_aspect_ratio=increase,crop={WIDTH*1.3}:{HEIGHT*1.3},zoompan=z='1.05':d={frames}:x='(iw-iw/zoom)*(1-on/{frames})':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}"
    else:
        # Default: gentle zoom in
        motion = f"scale={WIDTH*2}:{HEIGHT*2}:force_original_aspect_ratio=increase,crop={WIDTH*2}:{HEIGHT*2},zoompan=z='min(zoom+0.0008,1.12)':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}"
    
    # Text overlays
    title_escaped = title.replace(":", "\\:").replace("'", "\\'")
    subtitle_escaped = subtitle.replace(":", "\\:").replace("'", "\\'")
    
    drawtext_title = (
        f"drawtext=fontfile={FONT}:text='{title_escaped}':"
        f"fontcolor=white:fontsize=52:x=(w-text_w)/2:y=h*0.12:"
        f"shadowcolor=black@0.9:shadowx=3:shadowy=3:"
        f"box=1:boxcolor=#0d1f33@0.7:boxborderw=25"
    )
    
    drawtext_subtitle = (
        f"drawtext=fontfile={FONT}:text='{subtitle_escaped}':"
        f"fontcolor=#00bcd4:fontsize=34:x=(w-text_w)/2:y=h*0.83:"
        f"shadowcolor=black@0.9:shadowx=2:shadowy=2:"
        f"box=1:boxcolor=#0d1f33@0.5:boxborderw=15"
    )
    
    # Logo badge (small MIM logo bottom-right)
    # Fades
    fade_in = f"fade=t=in:st=0:d=0.4"
    fade_out = f"fade=t=out:st={duration-0.4}:d=0.4"
    
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", input_image,
        "-vf", f"{motion},{drawtext_title},{drawtext_subtitle},{fade_in},{fade_out}",
        "-c:v", "libx264",
        "-preset", "fast",
        "-tune", "stillimage",
        "-pix_fmt", "yuv420p",
        "-r", str(FPS),
        "-t", str(duration),
        "-b:v", "2M",
        str(output_file),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        print(f"  Error: {result.stderr[-200:]}")
        return False
    return True

def main():
    print("=" * 60)
    print(" Creating ENHANCED MIM Portal Promo Video")
    print(" Features: Dynamic motion, Voiceover, Music")
    print("=" * 60)
    
    # Step 1: Generate voiceover
    has_voiceover = generate_voiceover()
    
    # Step 2: Generate background music
    has_music = generate_background_music()
    
    # Step 3: Create scenes with motion effects
    print("\n=== Creating Scenes with Motion Effects ===")
    scene_files = []
    total_duration = 0
    
    for i, (image, title, subtitle, duration, effect) in enumerate(scenes):
        scene_file = OUTPUT_DIR / f"scene_{i:02d}.mp4"
        print(f"  Scene {i+1}/{len(scenes)}: {title} [{effect}] ({duration}s)")
        
        if create_scene_with_motion(image, title, subtitle, duration, effect, str(scene_file)):
            scene_files.append(str(scene_file))
            total_duration += duration
        else:
            print(f"  FAILED, skipping")
    
    print(f"\nTotal video duration: {total_duration}s")
    
    # Step 4: Concatenate scenes
    print("\n=== Concatenating Scenes ===")
    video_no_audio = OUTPUT_DIR / "video_no_audio.mp4"
    list_file = OUTPUT_DIR / "concat_list.txt"
    with open(list_file, "w") as f:
        for sf in scene_files:
            f.write(f"file '{sf}'\n")
    
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(list_file),
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-b:v", "2M",
        str(video_no_audio),
    ], capture_output=True, text=True, timeout=120)
    
    # Cleanup scenes
    for sf in scene_files:
        Path(sf).unlink(missing_ok=True)
    list_file.unlink(missing_ok=True)
    
    # Step 5: Mix video + voiceover + music
    print("\n=== Mixing Video + Voiceover + Music ===")
    
    inputs = ["-i", str(video_no_audio)]
    filter_parts = []
    audio_inputs = []
    
    if has_voiceover:
        inputs.extend(["-i", str(VOICEOVER_FILE)])
        audio_inputs.append(f"[{len(audio_inputs)+1}:a]volume=1.0[voice]")
    
    if has_music:
        inputs.extend(["-i", str(MUSIC_FILE)])
        music_idx = len(audio_inputs) + 1
        audio_inputs.append(f"[{music_idx}:a]volume=0.15[music]")
    
    if has_voiceover and has_music:
        filter_complex = ";".join(audio_inputs) + ";[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]"
    elif has_voiceover:
        filter_complex = ";".join(audio_inputs) + ";[voice]volume=1.0[aout]"
    elif has_music:
        filter_complex = ";".join(audio_inputs) + ";[music]volume=0.2[aout]"
    else:
        # No audio
        subprocess.run(["cp", str(video_no_audio), str(OUTPUT_VIDEO)])
        video_no_audio.unlink(missing_ok=True)
        print("\n✅ Video created (no audio - TTS/music failed)")
        return
    
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-b:v", "2M",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        str(OUTPUT_VIDEO),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        print(f"  Mix error: {result.stderr[-300:]}")
        # Fallback: just copy video without audio
        subprocess.run(["cp", str(video_no_audio), str(OUTPUT_VIDEO)])
    
    # Cleanup
    video_no_audio.unlink(missing_ok=True)
    if VOICEOVER_FILE.exists():
        VOICEOVER_FILE.unlink(missing_ok=True)
    if MUSIC_FILE.exists():
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
            stream = info.get("streams", [{}])[0]
            fmt = info.get("format", {})
            print(f"\n✅ Enhanced video created: {OUTPUT_VIDEO}")
            print(f"   Duration: {float(fmt.get('duration', 0)):.1f}s")
            print(f"   Resolution: {stream.get('width')}x{stream.get('height')}")
            print(f"   Size: {OUTPUT_VIDEO.stat().st_size / 1024 / 1024:.1f} MB")
            
            # Check for audio
            streams = info.get("streams", [])
            has_audio = any(s.get("codec_type") == "audio" for s in streams)
            print(f"   Audio: {'YES' if has_audio else 'NO'}")
    else:
        print("\n❌ Failed to create video")

if __name__ == "__main__":
    main()
