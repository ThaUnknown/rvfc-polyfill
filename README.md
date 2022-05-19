# requestVideoFrameCallback polyfill

Usage: 
```bash
npm install rvfc-polyfill
```
```js
import 'rvfc-polyfill'
```

Warning: this polyfill is at BEST roughly accurate as it runs using RAF, which is bound to the window's framerate, unlike RVFC which is bound to the video's framerate [but still capped by the window's framerate].

Because this polyfill uses RAF, the timestamps reported are ones used by the DOM renderer, rather than video decoder.
Notable differences:
- presentationTime - time when a new painted frame was detected, this is the time of when a RAF was fulfilled + the time it took to paint the last frame [rough estimate]
- expectedDisplayTime - time when the RAF was fulfilled + the time it takes to render a frame on the browser
- mediaTime - time of the video when the RAF was fulfilled - processingTime [this ISNT the video time when a video frame was decoded, but is closely accurate]
- presentedFrames - if the video framerate is higher than the browser window framerate, this will omit frames
- processingDuration - time it took to paint a frame

Notable examples:
Given a video with 50 fps and having the browser window limited to 60 fps the mediaTime reported will be in order:

By the original:
- 0.001
- 0.021
- 0.043
- 0.064
- 0.084
- 0.106

By this polyfill:
- 0.001
- 0.027
- 0.041
- 0.066
- 0.081
- 0.108

[+- 5ms as the highrestimestamps reported by browsers are marginally inaccurate]
which means the times arent inline with the video frames
