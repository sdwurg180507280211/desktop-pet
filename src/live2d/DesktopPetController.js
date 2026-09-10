import { loadLive2DRuntime } from './runtime.js'
import { VoiceService } from './voice.js'
import { EyeAnimationSystem } from './EyeAnimationSystem.js'
import { CharacterPipeline } from './CharacterPipeline.js'

const STATE_KEY = 'desktop-pet-state-v1'

export class DesktopPetController {
  constructor(container, models) {
    this.container = container
    this.models = models
    this.app = null
    this.model = null
    this.runtime = null
    this.modelId = null
    this.baseScale = 1
    this.userScale = 1
    this.dragging = false
    this.dragOrigin = null
    this.modelOrigin = null
    this.voice = new VoiceService((level) => this.setMouth(level))
    this.eyeAnimation = new EyeAnimationSystem()
    this.pipeline = new CharacterPipeline(this)
    this.listeners = []
    this.animationFrame = 0
    this.lastFrame = 0
  }

  async init(modelId) {
    this.runtime = await loadLive2DRuntime()
    this.app = new this.runtime.PIXI.Application({
      resizeTo: this.container,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(devicePixelRatio || 1, 2)
    })
    this.app.view.className = 'pet-canvas'
    this.container.appendChild(this.app.view)
    this.bindCanvasInteractions()
    await this.switchModel(modelId)
    this.startAnimationLoop()
  }

  async switchModel(modelId) {
    const config = this.models[modelId]
    if (!config) throw new Error(`未知模型: ${modelId}`)

    const next = await this.runtime.Live2DModel.from(config.path, { autoInteract: false })
    next.anchor.set(0.5, 0.5)

    if (this.model) {
      this.app.stage.removeChild(this.model)
      this.model.destroy({ children: true })
    }

    this.model = next
    this.modelId = modelId
    this.baseScale = config.scale
    this.userScale = this.readState(modelId).scale || 1
    this.app.stage.addChild(next)
    this.eyeAnimation.attach(next)
    this.applyLayout(config)
    this.saveState()
  }

  applyLayout(config = this.models[this.modelId]) {
    if (!this.model || !config) return
    const state = this.readState(this.modelId)
    const x = Number.isFinite(state.x) ? state.x : this.container.clientWidth * config.x
    const y = Number.isFinite(state.y) ? state.y : this.container.clientHeight * config.y
    this.model.position.set(x, y)
    this.model.scale.set(this.baseScale * this.userScale)
  }

  bindCanvasInteractions() {
    const canvas = this.app.view

    const onPointerDown = (event) => {
      this.dragging = true
      this.dragOrigin = { x: event.clientX, y: event.clientY }
      this.modelOrigin = { x: this.model?.x || 0, y: this.model?.y || 0 }
      canvas.setPointerCapture?.(event.pointerId)
    }
    const onPointerMove = (event) => {
      if (!this.dragging || !this.model) return
      this.model.position.set(
        this.modelOrigin.x + event.clientX - this.dragOrigin.x,
        this.modelOrigin.y + event.clientY - this.dragOrigin.y
      )
    }
    const onPointerUp = (event) => {
      if (!this.dragging) return
      this.dragging = false
      canvas.releasePointerCapture?.(event.pointerId)
      this.saveState()
    }
    const onWheel = (event) => {
      if (!this.model) return
      event.preventDefault()
      this.userScale = Math.min(2.4, Math.max(0.35, this.userScale * (event.deltaY < 0 ? 1.08 : 0.92)))
      this.model.scale.set(this.baseScale * this.userScale)
      this.saveState()
    }
    const onDblClick = () => this.playRandomMotion()

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('dblclick', onDblClick)

    this.listeners.push(
      [canvas, 'pointerdown', onPointerDown],
      [canvas, 'pointermove', onPointerMove],
      [canvas, 'pointerup', onPointerUp],
      [canvas, 'pointercancel', onPointerUp],
      [canvas, 'wheel', onWheel],
      [canvas, 'dblclick', onDblClick]
    )
  }

  playRandomMotion() {
    const motions = this.model?.internalModel?.settings?.motions || {}
    const groups = Object.keys(motions).filter((group) => motions[group]?.length)
    if (!groups.length) return false
    const group = groups[Math.floor(Math.random() * groups.length)]
    this.model.motion(group)
    return true
  }

  getExpressions() {
    return this.model?.internalModel?.settings?.expressions || []
  }

  playRandomExpression() {
    const expressions = this.getExpressions()
    if (!expressions.length) return false
    const item = expressions[Math.floor(Math.random() * expressions.length)]
    this.model.expression(item?.Name || item?.name || undefined)
    return true
  }

  setMouth(level) {
    const core = this.model?.internalModel?.coreModel
    if (!core) return
    const value = Math.max(0, Math.min(1, Number(level) || 0))
    for (const id of ['ParamMouthOpenY', 'PARAM_MOUTH_OPEN_Y']) {
      try {
        core.setParameterValueById(id, value)
      } catch {}
    }
  }

  speak(text, endpoint) {
    return this.pipeline.speak(text, endpoint)
  }

  startAnimationLoop() {
    const tick = (now) => {
      const delta = this.lastFrame ? Math.min(100, now - this.lastFrame) : 16
      this.lastFrame = now
      this.eyeAnimation.update(delta, now)
      this.animationFrame = requestAnimationFrame(tick)
    }
    this.animationFrame = requestAnimationFrame(tick)
  }

  reset() {
    localStorage.removeItem(STATE_KEY)
    this.userScale = 1
    this.applyLayout()
  }

  readState(modelId) {
    try {
      const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{}')
      return state[modelId] || {}
    } catch {
      return {}
    }
  }

  saveState() {
    if (!this.modelId || !this.model) return
    let state = {}
    try { state = JSON.parse(localStorage.getItem(STATE_KEY) || '{}') } catch {}
    state[this.modelId] = { x: this.model.x, y: this.model.y, scale: this.userScale }
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame)
    this.eyeAnimation.destroy()
    this.voice.stop()
    for (const [target, event, handler] of this.listeners) target.removeEventListener(event, handler)
    this.listeners = []
    this.model?.destroy?.({ children: true })
    this.app?.destroy?.(true, { children: true })
    this.model = null
    this.app = null
  }
}
