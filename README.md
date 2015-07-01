On the iPhone 6 it is not possible to play videos inline, playing a video always triggers fullscreen mode.

One way to go around this limitation is to, rather than play the video, advance the `currentTime` parameter using JavaScript. One limitation of this technique is that the sound will not play, but that can be solved by extracting the audio channel and playing it with an `audio` element.