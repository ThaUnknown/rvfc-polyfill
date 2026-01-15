const VidProto = typeof HTMLVideoElement !== 'undefined' ? HTMLVideoElement.prototype : {}

const hasQuality = 'getVideoPlaybackQuality' in VidProto || 'webkitDecodedFrameCount' in VidProto || 'mozPresentedFrames' in VidProto || 'mozPaintedFrames' in VidProto

if (!('requestVideoFrameCallback' in VidProto) && hasQuality && typeof requestAnimationFrame === 'function') {
  VidProto._rvfcpolyfillmap = {}

  const getPlaybackQuality =  'getVideoPlaybackQuality' in VidProto
    ? video => {
      const { totalFrameDelay, totalVideoFrames, droppedVideoFrames } = video.getVideoPlaybackQuality()
      return {
        presentedFrames: totalVideoFrames - droppedVideoFrames,
        totalFrameDelay
      }
    }
    : video => {
      return {
        presentedFrames: video.mozPresentedFrames || video.mozPaintedFrames || video.webkitDecodedFrameCount - (video.webkitDroppedFrameCount || 0),
        totalFrameDelay: video.mozFrameDelay || 0
      }
    }

  VidProto.requestVideoFrameCallback = function (callback) {
    const handle = performance.now()
    const quality = getPlaybackQuality(this)
    const baseline = quality.presentedFrames

    const check = (old, now) => {
      const newquality = getPlaybackQuality(this)
      const presentedFrames = newquality.presentedFrames
      if (presentedFrames > baseline) {
        const processingDuration = newquality.totalFrameDelay - quality.totalFrameDelay || 0
        const timediff = now - old // HighRes diff
        callback(now, {
          presentationTime: now + processingDuration * 1000,
          expectedDisplayTime: now + timediff,
          width: this.videoWidth,
          height: this.videoHeight,
          mediaTime: Math.max(0, this.currentTime || 0) + timediff / 1000,
          presentedFrames,
          processingDuration
        })
        delete this._rvfcpolyfillmap[handle]
      } else {
        this._rvfcpolyfillmap[handle] = requestAnimationFrame(newer => check(now, newer))
      }
    }
    this._rvfcpolyfillmap[handle] = requestAnimationFrame(newer => check(handle, newer))
    return handle
  }

  VidProto.cancelVideoFrameCallback = function (handle) {
    cancelAnimationFrame(this._rvfcpolyfillmap[handle])
    delete this._rvfcpolyfillmap[handle]
  }
}
