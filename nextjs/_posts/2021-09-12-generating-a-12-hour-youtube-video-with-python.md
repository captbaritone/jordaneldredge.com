---
layout: post
title: "Generating a 12 Hour Youtube Video With Python"
summary: "Making a video that smoothly scrolls through 70k Winamp skins in 12 hours"
summary_image: /images/scrolling-through-70k-winamp-skins-youtube-thumbnail.png
---

After I launched the [Winamp Skin Museum](https://skins.webamp.org/), someone made an [11 hour Youtube video](https://www.youtube.com/watch?v=tZ4tTh7lBq4) that consisted of scrolling through all 65k skins. Honestly I loved the idea, but it it looked like they had done it by automating a browser to scroll by 100 pixels or so every second or so. This meant the result was not smooth and occasionally suffered from slow network responses causing some images appear late.

It made me think, "how could you do a really polished version of this?" and I began to imagine a programmatically-generated video constructed directly from the collection of screenshots.

::tweet{status=1395661105574420483}

Lucky for me [Pontus Alexander](https://www.youtube.com/c/MethMethMethod) suggested we take a look at it together.

After an hour of enjoyable remote pair programming, we had hammered out the broad strokes. Over the next few days I sorted out the remaining details and after a a day or so of rendering and several days(!) of waiting for YouTube to process the video, [12 Hours: Scrolling Through 70,000 Winamp Skins](https://www.youtube.com/watch?v=65tAgs1CW58) was born.

::youtube{token=65tAgs1CW58}

The code we wrote is, understandably, hacky and full of things like hard coded paths, but I’ve included it below on the off chance that it might be a useful reference for someone else tackling a similar project in the future.

```python
import json
import sys
import math
from functools import lru_cache
import moviepy.editor as mpy
from PIL import Image
from numpy import asarray
import time
import os
from moviepy.editor import *

SKIN_WIDTH = 275
SKIN_HEIGHT = 348

COLUMN_COUNT = 10

FRAME_WIDTH = SKIN_WIDTH * COLUMN_COUNT
FRAME_HEIGHT = round(FRAME_WIDTH * (9/16))

ROW_COUNT = math.ceil(FRAME_HEIGHT / SKIN_HEIGHT)

SCREENSHOT_DIR = "/Volumes/Mobile Backup/skins/screenshots"
AUDIO_PATH = "./input/soundtrack"

FPS = 60

class ScrollVideo:
    def __init__(self, sample):
        with open('./input/skins.json') as f:
            raw = json.load(f)["skins"]
            self.skins_data = [skin for skin in raw if skin_is_allowed(skin)]

        if sample:
            self.skins_data = self.skins_data[0:sample]

        self._validate_screenshots()

        row_count = len(self.skins_data) / COLUMN_COUNT
        total_pixel_height = SKIN_HEIGHT * math.ceil(row_count)
        scroll_distance = total_pixel_height - FRAME_HEIGHT

        # Assume one px scroll per frame
        frame_count = scroll_distance
        self.duration_seconds = frame_count / FPS


    @lru_cache()
    def _get_image(self, i):
        if len(self.skins_data) <= i:
            return None
        md5 = self.skins_data[i]["md5"]
        return Image.open(get_screenshot_path(md5))

    def _validate_screenshots(self):
        for skin in self.skins_data:
            if not os.path.exists(get_screenshot_path(skin["md5"])):
                raise Exception("Missing: %s" % skin["md5"])

    """Get frame for point in time"""
    def make_frame(self, time):
        if time > self.duration_seconds:
            return self.previous_frame

        scroll_offset = round(time * FPS)

        canvas = Image.new("RGB", (FRAME_WIDTH, FRAME_HEIGHT))

        pixel_offset = scroll_offset % SKIN_HEIGHT
        row_offset = math.floor(scroll_offset / SKIN_HEIGHT)
        for row in range(ROW_COUNT + 1):
            for column in range(COLUMN_COUNT):
                imageIndex = ((row_offset + row) * COLUMN_COUNT) + column
                image = self._get_image(imageIndex)
                if image is None:
                    continue # If we've indexed off the end, just leave it blank
                x = column * SKIN_WIDTH
                y = (row * SKIN_HEIGHT) - pixel_offset
                canvas.paste(image, (x, y))

        frame = asarray(canvas)
        self.previous_frame = frame
        return frame

def make_video():
    scroll_video = ScrollVideo(sample=None)
    print("Expected video duration: %s hours" % round(scroll_video.duration_seconds / 60 / 60, 2))

    audio = make_soundtrack(scroll_video.duration_seconds)

    start = time.time()
    videoclip = mpy.VideoClip(scroll_video.make_frame, duration=audio.duration)
    videoclip = videoclip.set_audio(audio)

    videoclip.write_videofile(sys.argv[1], fps=FPS, codec="libx264")
    end = time.time()

    duration = end - start
    print("Took %s seconds (%s hours)" % (round(duration, 2), round(duration / 60 / 60, 2)))

def skin_is_allowed(skin):
    if skin["nsfw"]:
        return False
    # We are missing this screenshot for some reason
    if skin["md5"] == "0e2460d98df5bd7ebc38279cd7ca618b":
        return False
    return True


def get_screenshot_path(md5):
    return "%s/%s.png" % (SCREENSHOT_DIR, md5)

def make_soundtrack(duration):
    tracks = []
    for filename in sorted(os.listdir(AUDIO_PATH)):
        if filename.startswith("."):
            continue
        track = mpy.AudioFileClip("%s/%s" % (AUDIO_PATH, filename))
        tracks.append(track)
    music = concatenate_audioclips(tracks)
    audio = mpy.afx.audio_loop(music, duration=duration)
    llama = mpy.AudioFileClip("./input/llama.mp3")
    return concatenate_audioclips([audio, llama])

if __name__ == "__main__":
    make_video()
```