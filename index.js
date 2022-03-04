if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype) && 'getVideoPlaybackQuality' in HTMLVideoElement.prototype) {
  HTMLVideoElement.prototype._rvfcpolyfillmap = {}
  HTMLVideoElement.prototype.requestVideoFrameCallback = function (callback) {
    const quality = this.getVideoPlaybackQuality()
    const baseline = quality.totalVideoFrames - quality.droppedVideoFrames

    const check = () => {
      const newquality = this.getVideoPlaybackQuality()
      const current = newquality.totalVideoFrames - newquality.droppedVideoFrames
      if (current > baseline) {
        const now = performance.now()
        callback(now, {
          presentationTime: now,
          expectedDisplayTime: now + (this.mozFrameDelay || 0),
          width: this.videoWidth,
          height: this.videoHeight,
          mediaTime: this.currentTime,
          presentedFrames: current,
          processingDuration: this.mozFrameDelay || (newquality.totalFrameDelay - quality.totalFrameDelay) || 0
        })
        delete this._rvfcpolyfillmap[handle]
      } else {
        this._rvfcpolyfillmap[handle] = requestAnimationFrame(check)
      }
    }

    const handle = Date.now()
    this._rvfcpolyfillmap[handle] = requestAnimationFrame(check)
    return handle
  }

  HTMLVideoElement.prototype.cancelVideoFrameCallback = function (handle) {
    cancelAnimationFrame(this._rvfcpolyfillmap[handle])
    delete this._rvfcpolyfillmap[handle]
  }
}
