#!/bin/bash
# Combine AI-generated clips with FFmpeg clips for remaining scenes
cd /home/z/my-project/public/videos

echo "=== Combining AI clips + FFmpeg clips ==="

# We have 7 AI clips (3s each = 21s), need ~42s more
# Use FFmpeg to create remaining clips from images

CLIPS_DIR="svd_clips"
IMG_DIR="../images/pixar"
STEPS_DIR="../images/steps-pixar"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FPS=8

# List all clips in order (AI clips + FFmpeg clips)
# AI clips available: 01_intro, 02_hero, 03_safety, 04_matchmaker, 05_register, 06_search, 07_interview
# Need to create: contract, start, support, agents, training, payment, support2, outro

# Create remaining FFmpeg clips (3 seconds each, cinematic zoom)
echo "Creating FFmpeg clips for remaining scenes..."

# 08_contract
ffmpeg -y -loop 1 -i "$STEPS_DIR/step4-contract-wide.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/08_contract.mp4" 2>/dev/null
echo "  08_contract: done"

# 09_start
ffmpeg -y -loop 1 -i "$STEPS_DIR/step5-start-wide.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='1.05':x='(iw-iw/zoom)*on/24':y='ih/2-(ih/zoom/2)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/09_start.mp4" 2>/dev/null
echo "  09_start: done"

# 10_support
ffmpeg -y -loop 1 -i "$STEPS_DIR/step6-support-wide.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/10_support.mp4" 2>/dev/null
echo "  10_support: done"

# 11_agents
ffmpeg -y -loop 1 -i "$IMG_DIR/ai-agents.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='1.05':x='(iw-iw/zoom)*(1-on/24)':y='ih/2-(ih/zoom/2)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/11_agents.mp4" 2>/dev/null
echo "  11_agents: done"

# 12_training
ffmpeg -y -loop 1 -i "$IMG_DIR/why-training.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/12_training.mp4" 2>/dev/null
echo "  12_training: done"

# 13_payment
ffmpeg -y -loop 1 -i "$IMG_DIR/why-payment.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='1.05':x='(iw-iw/zoom)*on/24':y='ih/2-(ih/zoom/2)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/13_payment.mp4" 2>/dev/null
echo "  13_payment: done"

# 14_support2
ffmpeg -y -loop 1 -i "$IMG_DIR/why-support.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='if(lte(zoom,1.0),1.1,max(1.0,zoom-0.001))':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/14_support2.mp4" 2>/dev/null
echo "  14_support2: done"

# 15_outro - logo
ffmpeg -y -loop 1 -i "../logo-mim.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/15_outro.mp4" 2>/dev/null
echo "  15_outro: done"

# 16_maid
ffmpeg -y -loop 1 -i "$IMG_DIR/maid.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='1.05':x='(iw-iw/zoom)*on/24':y='ih/2-(ih/zoom/2)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/16_maid.mp4" 2>/dev/null
echo "  16_maid: done"

# 17_babysitter
ffmpeg -y -loop 1 -i "$IMG_DIR/babysitter.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/17_babysitter.mp4" 2>/dev/null
echo "  17_babysitter: done"

# 18_caregiver
ffmpeg -y -loop 1 -i "$IMG_DIR/caregiver.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='1.05':x='(iw-iw/zoom)*(1-on/24)':y='ih/2-(ih/zoom/2)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/18_caregiver.mp4" 2>/dev/null
echo "  18_caregiver: done"

# 19_team
ffmpeg -y -loop 1 -i "$IMG_DIR/team.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='min(zoom+0.001,1.1)':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/19_team.mp4" 2>/dev/null
echo "  19_team: done"

# 20_celebration (reuse hero)
ffmpeg -y -loop 1 -i "$IMG_DIR/hero.png" \
  -vf "scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='if(lte(zoom,1.0),1.1,max(1.0,zoom-0.001))':d=${FPS}*3:s=1280x720,fade=in:0:15,fade=out:60:15" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -t 3 -b:v 2M -r $FPS \
  "$CLIPS_DIR/20_celebration.mp4" 2>/dev/null
echo "  20_celebration: done"

echo ""
echo "=== All clips ==="
ls -la $CLIPS_DIR/[0-9]*.mp4

# Concatenate all clips
echo ""
echo "=== Concatenating ==="
> $CLIPS_DIR/concat_list.txt
for f in $CLIPS_DIR/0[1-9]*.mp4 $CLIPS_DIR/1[0-9]*.mp4 $CLIPS_DIR/2[0-9]*.mp4; do
  echo "file '$f'" >> $CLIPS_DIR/concat_list.txt
done

ffmpeg -y -f concat -safe 0 -i $CLIPS_DIR/concat_list.txt \
  -c:v libx264 -preset fast -pix_fmt yuv420p -b:v 2M -r $FPS \
  $CLIPS_DIR/combined_raw.mp4 2>/dev/null

echo "Combined: $(ls -la $CLIPS_DIR/combined_raw.mp4 | awk '{print $5}') bytes"

# Generate voiceover
echo ""
echo "=== Voiceover ==="
z-ai tts -i "Welcome to MIM Portal. Maid In Malaysia. The professional house helper platform for Malaysian families. Find professional and trusted house helpers, babysitters, and elderly caregivers." -o $CLIPS_DIR/v1.wav --voice jam --speed 1.0 --format wav 2>/dev/null
z-ai tts -i "Our AI Matchmaker scores compatibility from zero to one hundred. Step one, register online. Step two, search and choose. Step three, interview via Google Meet. Step four, sign contracts. Step five, helper starts work. Step six, continuous support." -o $CLIPS_DIR/v2.wav --voice jam --speed 1.0 --format wav 2>/dev/null
z-ai tts -i "Thirteen AI agents fully automate everything. Register now at MIM Portal. Maid In Malaysia. By Kino Studios." -o $CLIPS_DIR/v3.wav --voice jam --speed 1.0 --format wav 2>/dev/null

echo "file '$CLIPS_DIR/v1.wav'" > $CLIPS_DIR/vlist.txt
echo "file '$CLIPS_DIR/v2.wav'" >> $CLIPS_DIR/vlist.txt
echo "file '$CLIPS_DIR/v3.wav'" >> $CLIPS_DIR/vlist.txt
ffmpeg -y -f concat -safe 0 -i $CLIPS_DIR/vlist.txt -c copy $CLIPS_DIR/voiceover.wav 2>/dev/null

# Generate music
ffmpeg -y \
  -f lavfi -i "sine=frequency=110:duration=65,volume=0.05" \
  -f lavfi -i "sine=frequency=220:duration=65,volume=0.03" \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest,lowpass=f=500,volume=0.3" \
  -t 65 -ar 44100 -ac 2 $CLIPS_DIR/music.wav 2>/dev/null

# Trim voiceover to video duration
VIDEO_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 $CLIPS_DIR/combined_raw.mp4)
echo "Video duration: $VIDEO_DUR"
ffmpeg -y -i $CLIPS_DIR/voiceover.wav -t $VIDEO_DUR -c copy $CLIPS_DIR/voice_trimmed.wav 2>/dev/null

# Final mix
echo ""
echo "=== Final mix ==="
ffmpeg -y \
  -i $CLIPS_DIR/combined_raw.mp4 \
  -i $CLIPS_DIR/voice_trimmed.wav \
  -i $CLIPS_DIR/music.wav \
  -filter_complex "[1:a]volume=1.0[voice];[2:a]volume=0.10[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map 0:v -map "[aout]" \
  -c:v libx264 -preset fast -pix_fmt yuv420p -b:v 2M \
  -c:a aac -b:a 128k -shortest \
  mim-promo-enhanced.mp4 2>/dev/null

# Verify
echo ""
echo "=== Result ==="
ffprobe mim-promo-enhanced.mp4 2>&1 | grep -E "Duration|Stream"
ls -la mim-promo-enhanced.mp4

# Cleanup
rm -rf svd_clips/

echo ""
echo "DONE"
