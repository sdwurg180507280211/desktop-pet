export class EyeAnimationSystem {
  constructor() {
    this.model = null
    this.lastMouseMoveTime = 0
    this.blinkPhase = 'idle'
    this.blinkTimer = 0
    this.nextBlink = this.randomBlinkInterval()
    this.saccadeTimer = 0
    this.onMouseMove = () => { this.lastMouseMoveTime = performance.now() }
    this.onMouseLeave = () => { this.lastMouseMoveTime = 0 }
  }

  attach(model) {
    this.detach()
    this.model = model
    this.lastMouseMoveTime = performance.now()
    window.addEventListener('mousemove', this.onMouseMove, { passive: true })
    document.addEventListener('mouseleave', this.onMouseLeave)
  }

  update(delta, now) {
    if (!this.model) return
    this.updateBlink(delta)
    if (now - this.lastMouseMoveTime > 1500) this.updateSaccade(delta)
    else this.saccadeTimer = 0
  }

  updateBlink(delta) {
    if (this.model?.internalModel?.eyeBlink) return
    this.blinkTimer += delta
    if (this.blinkPhase === 'idle' && this.blinkTimer >= this.nextBlink) {
      this.blinkPhase = 'closing'; this.blinkTimer = 0
    } else if (this.blinkPhase === 'closing') {
      const t = Math.min(1, this.blinkTimer / 150); this.setEyes(1 - t)
      if (t === 1) { this.blinkPhase = 'closed'; this.blinkTimer = 0 }
    } else if (this.blinkPhase === 'closed' && this.blinkTimer >= 60) {
      this.blinkPhase = 'opening'; this.blinkTimer = 0
    } else if (this.blinkPhase === 'opening') {
      const t = Math.min(1, this.blinkTimer / 150); this.setEyes(t)
      if (t === 1) { this.blinkPhase = 'idle'; this.blinkTimer = 0; this.nextBlink = this.randomBlinkInterval() }
    }
  }

  updateSaccade(delta) {
    this.saccadeTimer += delta
    if (this.saccadeTimer < 700) return
    this.saccadeTimer = 0
    const focus = this.model?.internalModel?.focusController
    focus?.focus?.((Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1.2 + 0.1, false)
  }

  setEyes(value) {
    const core = this.model?.internalModel?.coreModel
    if (!core) return
    for (const id of ['ParamEyeLOpen', 'ParamEyeROpen']) {
      try { core.setParameterValueById(id, value) } catch {}
    }
  }

  randomBlinkInterval() { return 3000 + Math.random() * 5000 }

  detach() {
    window.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseleave', this.onMouseLeave)
    this.model = null
  }

  destroy() { this.detach() }
}
