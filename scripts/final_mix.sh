#!/bin/bash
# Create final video mix
cd /home/z/my-project/public/videos

# Re-generate voiceover (3 chunks)
z-ai tts -i "Welcome to MIM Portal. Maid In Malaysia. The professional house helper platform for Malaysian families. Find professional and trusted house helpers, babysitters, and elderly caregivers. Every helper goes through strict screening and mandatory training." -o voice_01.wav --voice jam --speed 1.0 --format wav

z-ai tts -i "Our AI Matchmaker scores compatibility from zero to one hundred. Step one, register online. Step two, search and choose. Step three, interview via Google Meet. Step four, sign contracts. Step five, helper starts work. Step six, continuous support." -o voice_02.wav --voice jam --speed 1.0 --format wav

z-ai tts -i "Thirteen AI agents fully automate everything. Register now at MIM Portal. Maid In Malaysia. By Kino Studios." -o voice_03.wav --voice jam --speed 1.0 --format wav

# Concat voiceover
echo "file 'voice_01.wav'" > voice_list.txt
echo "file 'voice_02.wav'" >> voice_list.txt
echo "file 'voice_03.wav'" >> voice_list.txt
ffmpeg -y -f concat -safe 0 -i voice_list.txt -c copy voiceover_final.wav

# Generate music
ffmpeg -y \
  -f lavfi -i "sine=frequency=110:duration=65,volume=0.05" \
  -f lavfi -i "sine=frequency=220:duration=65,volume=0.03" \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest,lowpass=f=500,volume=0.3" \
  -t 65 -ar 44100 -ac 2 music_final.wav

# Re-create video scenes
python3 /home/z/my-project/scripts/create_enhanced_video_en.py > /dev/null 2>&1

# Check if video_no_audio.mp4 exists
if [ ! -f video_no_audio.mp4 ]; then
    echo "ERROR: video_no_audio.mp4 not found"
    exit 1
fi

# Trim voiceover to video duration (63s)
VIDEO_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 video_no_audio.mp4)
echo "Video duration: $VIDEO_DUR"

ffmpeg -y -i voiceover_final.wav -t $VIDEO_DUR -c copy voice_trimmed.wav

# Final mix
ffmpeg -y \
  -i video_no_audio.mp4 \
  -i voice_trimmed.wav \
  -i music_final.wav \
  -filter_complex "[1:a]volume=1.0[voice];[2:a]volume=0.10[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map 0:v -map "[aout]" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -b:v 2M \
  -c:a aac -b:a 128k -shortest \
  mim-promo-enhanced.mp4

# Verify
ffprobe -v quiet -print_format json -show_format -show_streams mim-promo-enhanced.mp4 | python3 -c "
import sys, json
d = json.load(sys.stdin)
fmt = d.get('format', {})
streams = d.get('streams', [])
has_audio = any(s.get('codec_type') == 'audio' for s in streams)
print(f'Duration: {float(fmt.get(\"duration\", 0)):.1f}s')
print(f'Size: {int(fmt.get(\"size\", 0)) / 1024 / 1024:.1f} MB')
print(f'Audio: {\"YES\" if has_audio else \"NO\"}')
"

# Cleanup
rm -f video_no_audio.mp4 voiceover_final.wav voice_trimmed.wav music_final.wav voice_*.wav voice_list.txt

echo "DONE"
