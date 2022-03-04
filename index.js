if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype) && 'getVideoPlaybackQuality' in HTMLVideoElement.prototype) {
  HTMLVideoElement.prototype._rvfcpolyfillmap = {}
  HTMLVideoElement.prototype.requestVideoFrameCallback = function (callback) {
    const quality = this.getVideoPlaybackQuality()
    const current = quality.totalVideoFrames - quality.droppedVideoFrames
    let raf = null

    const check = () => {
      const newquality = this.getVideoPlaybackQuality()
      const next = newquality.totalVideoFrames - newquality.droppedVideoFrames
      if (next > current) {
        const now = performance.now()
        callback(now, {
          presentationTime: now,
          expectedDisplayTime: now + (this.mozFrameDelay || 0),
          width: this.videoWidth,
          height: this.videoHeight,
          mediaTime: this.currentTime,
          presentedFrames: next,
          processingDuration: this.mozFrameDelay || (newquality.totalFrameDelay - quality.totalFrameDelay) || 0
        })
        cleanup()
      } else {
        if (!this.paused) raf = requestAnimationFrame(() => check())
      }
    }

    const handle = Date.now()
    const cleanup = () => {
      this.removeEventListener('play', check)
      this.removeEventListener('paused', paused)
      cancelAnimationFrame(raf)
      delete this._rvfcpolyfillmap[handle]
    }
    this._rvfcpolyfillmap[handle] = cleanup
    const paused = () => cancelAnimationFrame(raf)
    this.addEventListener('play', check)
    this.addEventListener('paused', paused)

    check()

    return handle
  }

  HTMLVideoElement.prototype.cancelVideoFrameCallback = function (handle) {
    if (this._rvfcpolyfillmap[handle]) this._rvfcpolyfillmap[handle]()
  }
}
