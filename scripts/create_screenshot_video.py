#!/usr/bin/env python3
"""
Create step-by-step video using website screenshots.
Shows actual website pages with clear narration of employer flow.
"""
import subprocess
import os
from pathlib import Path

SCREENSHOTS_DIR = Path("/home/z/my-project/public/videos/screenshots")
OUTPUT_VIDEO = Path("/home/z/my-project/public/videos/mim-promo-enhanced.mp4")
TEMP_DIR = Path("/home/z/my-project/public/videos/temp")
TEMP_DIR.mkdir(parents=True, exist_ok=True)

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
WIDTH = 1280
HEIGHT = 720
FPS = 30

# Video scenes: (screenshot, title, subtitle, duration, narration_text)
scenes = [
    # 1. Intro - Landing page (5s)
    ("01-landing.png", "MIM Portal", "Maid In Malaysia - Professional Helper Platform", 5,
     "Welcome to MIM Portal. Maid In Malaysia. The professional house helper platform for Malaysian families."),
    
    # 2. Register page (5s)
    ("02-register.png", "Step 1: Register", "Fill the online form - get WhatsApp credentials", 5,
     "Step one. Register as an employer. Fill out the online form and receive your login credentials automatically via WhatsApp."),
    
    # 3. Login page (4s)
    ("05-login.png", "Step 2: Login", "Access your employer dashboard", 4,
     "Step two. Login to your account using the credentials sent to your WhatsApp."),
    
    # 4. Dashboard (5s)
    ("06-dashboard.png", "Step 3: Dashboard", "Overview of your account, bookings, and payments", 5,
     "Step three. Your dashboard shows everything - your bookings, payment history, and contract status."),
    
    # 5. Find helper (5s)
    ("07-find-helper-logged.png", "Step 4: Find Helper", "Browse 371+ verified helpers with filters", 5,
     "Step four. Search and choose your helper. Browse over three hundred seventy one verified helpers. Filter by service type, location, religion, and preferences."),
    
    # 6. Pricing (4s)
    ("04-pricing.png", "Pricing Plans", "Free, Basic (RM49), and Premium (RM99)", 4,
     "Choose from three plans. Free to try, Basic at forty nine ringgit, or Premium at ninety nine ringgit per month."),
    
    # 7. Bookings (5s)
    ("08-bookings.png", "Step 5: Book Interview", "Select helper and schedule Google Meet", 5,
     "Step five. Book your preferred helper. Schedule a Google Meet interview with three parties - you, the helper, and MIM admin."),
    
    # 8. Contract (5s)
    ("10-contract.png", "Step 6: Sign Contract", "3 auto-generated legal contracts", 5,
     "Step six. Sign the contract. Three types of contracts are automatically generated - agency to helper, agency to employer, and employer to helper. All legally binding."),
    
    # 9. Payments (4s)
    ("09-payments.png", "Step 7: Payments", "Auto-invoice and payment tracking", 4,
     "Step seven. Payments are fully automated. Monthly invoices, payment reminders, and complete payment history."),
    
    # 10. AI Agents (5s)
    ("12-ai-agents.png", "13 AI Agents", "Fully automated platform management", 5,
     "Thirteen AI agents work around the clock. They find leads, match helpers, generate contracts, send reminders, and provide twenty four seven support."),
    
    # 11. Admin dashboard (4s)
    ("13-admin-dashboard.png", "Admin Oversight", "Complete platform management", 4,
     "Our admin team monitors everything - helper applications, bookings, contracts, and payments. All in real time."),
    
    # 12. For maids (4s)
    ("11-for-maids.png", "For Helpers", "Free training and career support", 4,
     "Helpers get free training, fair wages from fifteen hundred to thirty five hundred ringgit, and continuous support."),
    
    # 13. Outro - landing (5s)
    ("01-landing.png", "Register Now", "mim-portal.vercel.app", 5,
     "Register now at MIM Portal. Maid In Malaysia. By Kino Studios. The smart way to find your perfect helper."),
]

def create_scene(screenshot, title, subtitle, duration, narration, output_file):
    """Create a scene from screenshot with title overlay and smooth scroll/zoom."""
    img_path = str(SCREENSHOTS_DIR / screenshot)
    
    if not os.path.exists(img_path):
        print(f"  Screenshot not found: {img_path}")
        return False
    
    frames = duration * FPS
    
    # Cinematic zoom in on screenshot
    motion = (
        f"scale={WIDTH*2}:{HEIGHT*2}:force_original_aspect_ratio=increase,"
        f"crop={WIDTH*2}:{HEIGHT*2},"
        f"zoompan=z='min(zoom+0.0003,1.08)':d={frames}:"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        f"s={WIDTH}x{HEIGHT}"
    )
    
    # Title bar at top
    title_escaped = title.replace(":", "\\:").replace("'", "\\'")
    subtitle_escaped = subtitle.replace(":", "\\:").replace("'", "\\'")
    
    # Title background bar
    drawtext_title = (
        f"drawtext=fontfile={FONT}:text='{title_escaped}':"
        f"fontcolor=white:fontsize=44:x=40:y=30:"
        f"shadowcolor=black@0.9:shadowx=2:shadowy=2:"
        f"box=1:boxcolor=#0d1f33@0.85:boxborderw=20"
    )
    
    # Subtitle below title
    drawtext_subtitle = (
        f"drawtext=fontfile={FONT}:text='{subtitle_escaped}':"
        f"fontcolor=#00bcd4:fontsize=28:x=42:y=85:"
        f"shadowcolor=black@0.9:shadowx=1:shadowy=1"
    )
    
    # Step number badge (bottom right)
    fade_in = f"fade=t=in:st=0:d=0.5"
    fade_out = f"fade=t=out:st={duration-0.5}:d=0.5"
    
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", img_path,
        "-vf", f"{motion},{drawtext_title},{drawtext_subtitle},{fade_in},{fade_out}",
        "-c:v", "libx264", "-preset", "fast", "-tune", "stillimage",
        "-pix_fmt", "yuv420p", "-r", str(FPS), "-t", str(duration),
        "-b:v", "3M",
        str(output_file),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    return result.returncode == 0

def main():
    print("=" * 60)
    print(" Creating Step-by-Step Website Flow Video")
    print("=" * 60)
    
    # 1. Create scenes from screenshots
    print("\n=== Creating video scenes ===")
    scene_files = []
    
    for i, (screenshot, title, subtitle, duration, narration) in enumerate(scenes):
        scene_file = TEMP_DIR / f"scene_{i:02d}.mp4"
        print(f"  {i+1}/{len(scenes)}: {title} ({duration}s)")
        
        if create_scene(screenshot, title, subtitle, duration, narration, str(scene_file)):
            scene_files.append(str(scene_file))
    
    total_duration = len(scene_files) * 5  # approximate
    print(f"\nTotal scenes: {len(scene_files)}")
    
    # 2. Concatenate scenes
    print("\n=== Concatenating scenes ===")
    list_file = TEMP_DIR / "concat_list.txt"
    with open(list_file, "w") as f:
        for sf in scene_files:
            f.write(f"file '{sf}'\n")
    
    video_no_audio = TEMP_DIR / "video_no_audio.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_file),
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p", "-b:v", "3M",
        str(video_no_audio),
    ], capture_output=True, text=True, timeout=120)
    
    # Get video duration
    dur_result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(video_no_audio)],
        capture_output=True, text=True
    )
    video_dur = float(dur_result.stdout.strip())
    print(f"Video duration: {video_dur:.1f}s")
    
    # 3. Generate voiceover (English)
    print("\n=== Generating English voiceover ===")
    voice_chunks = []
    for i, (screenshot, title, subtitle, duration, narration) in enumerate(scenes):
        vfile = TEMP_DIR / f"voice_{i:02d}.wav"
        r = subprocess.run([
            "z-ai", "tts", "-i", narration, "-o", str(vfile),
            "--voice", "jam", "--speed", "1.0", "--format", "wav"
        ], capture_output=True, text=True, timeout=60)
        if vfile.exists():
            voice_chunks.append(str(vfile))
            print(f"  {i+1}: OK ({vfile.stat().st_size/1024:.0f} KB)")
    
    # Concat voiceover
    vlist = TEMP_DIR / "vlist.txt"
    with open(vlist, "w") as f:
        for vc in voice_chunks:
            f.write(f"file '{vc}'\n")
    
    voiceover = TEMP_DIR / "voiceover.wav"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(vlist), "-c", "copy", str(voiceover)
    ], capture_output=True, text=True)
    
    # Trim voiceover to video duration
    voice_trimmed = TEMP_DIR / "voice_trimmed.wav"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(voiceover), "-t", str(video_dur), "-c", "copy", str(voice_trimmed)
    ], capture_output=True, text=True)
    
    # 4. Generate background music
    print("\n=== Generating music ===")
    music = TEMP_DIR / "music.wav"
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"sine=frequency=110:duration={video_dur},volume=0.04",
        "-f", "lavfi", "-i", f"sine=frequency=220:duration={video_dur},volume=0.02",
        "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=longest,lowpass=f=400,volume=0.25",
        "-t", str(video_dur), "-ar", "44100", "-ac", "2", str(music)
    ], capture_output=True, text=True)
    
    # 5. Final mix
    print("\n=== Final mix ===")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(video_no_audio),
        "-i", str(voice_trimmed),
        "-i", str(music),
        "-filter_complex",
        "[1:a]volume=1.0[voice];[2:a]volume=0.08[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]",
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p", "-b:v", "3M",
        "-c:a", "aac", "-b:a", "128k", "-shortest",
        str(OUTPUT_VIDEO)
    ], capture_output=True, text=True, timeout=120)
    
    # 6. Cleanup
    import shutil
    shutil.rmtree(TEMP_DIR, ignore_errors=True)
    
    # 7. Verify
    if OUTPUT_VIDEO.exists():
        r = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUTPUT_VIDEO)],
            capture_output=True, text=True
        )
        final_dur = float(r.stdout.strip())
        size_mb = OUTPUT_VIDEO.stat().st_size / 1024 / 1024
        
        r2 = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_streams", "-of", "csv=p=0", str(OUTPUT_VIDEO)],
            capture_output=True, text=True
        )
        has_audio = "audio" in r2.stdout.lower()
        
        print(f"\n{'='*60}")
        print(f"✅ VIDEO CREATED SUCCESSFULLY")
        print(f"{'='*60}")
        print(f"   File: {OUTPUT_VIDEO}")
        print(f"   Duration: {final_dur:.1f}s ({final_dur/60:.1f} min)")
        print(f"   Size: {size_mb:.1f} MB")
        print(f"   Audio: {'YES (English voiceover + music)' if has_audio else 'NO'}")
        print(f"   Scenes: {len(scenes)} (website screenshots)")
    else:
        print("\n❌ Failed to create video")

if __name__ == "__main__":
    main()
