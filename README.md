# requestVideoFrameCallback polyfill

Warning: this polyfill is at BEST roughly accurate as it runs using RAF, which is bound to the window's framerate, unlike RVFC which is bound to the video's framerate.
Additionally this polyfill fires AFTER a video frame already has been painted, rather when it was decoded, which leads to a lot of inaccuracy in the timestamps reported by this polyfill.

Because this polyfill uses RAF, the timestamps reported are ones used by the DOM renderer, rather than video decoder.
Notable differences:
- presentationTime - time when a new painted frame was detected, this is the time of when a RAF was fulfilled
- expectedDisplayTime - time when the RAF was fulfilled + the time it took to paint a frame
- mediaTime - time of the video when the RAF was fulfilled, this ISNT the video time when a video frame was decoded!
- presentedFrames - if the video framerate is higher than the browser window framerate, this will omit frames
- processingDuration - time it took to paint a frame, firefox only

Notable examples:
Given a video with 50 fps and having the browser window limited to 60 fps the mediatime reported will be roughly in order:
By the original:
0.02
0.04
0.06
0.08
0.10

By this polyfill:
0.03333
0.05
0.06666
0.08333
0.10

which means the times arent inline with the video frames
