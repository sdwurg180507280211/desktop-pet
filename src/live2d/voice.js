export class VoiceService {
  constructor(onLevel) {
    this.onLevel = onLevel
    this.audioContext = null
    this.source = null
    this.analyser = null
    this.rafId = 0
  }

  async speak(text, endpoint = '') {
    this.stop()
    if (!text?.trim()) return

    if (endpoint) {
      try {
        await this.speakRemote(text, endpoint)
        return
      } catch (error) {
        console.warn('[desktop-pet] remote TTS failed, falling back to browser TTS', error)
      }
    }

    await this.speakBrowser(text)
  }

  async speakRemote(text, endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!response.ok) throw new Error(`TTS HTTP ${response.status}`)

    const arrayBuffer = await response.arrayBuffer()
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    this.audioContext = new AudioContextClass()
    const buffer = await this.audioContext.decodeAudioData(arrayBuffer)
    this.source = this.audioContext.createBufferSource()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    this.source.buffer = buffer
    this.source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)
    this.source.start()
    this.trackLevel()

    await new Promise((resolve) => {
      this.source.addEventListener('ended', resolve, { once: true })
    })
    this.stop()
  }

  speakBrowser(text) {
    if (!('speechSynthesis' in window)) {
      return Promise.reject(new Error('当前系统不支持 SpeechSynthesis'))
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      const startedAt = performance.now()
      const tick = () => {
        const elapsed = (performance.now() - startedAt) / 1000
        this.onLevel?.(0.25 + Math.abs(Math.sin(elapsed * 11)) * 0.55)
        this.rafId = requestAnimationFrame(tick)
      }
      utterance.onstart = tick
      utterance.onend = () => {
        this.stopLevel()
        resolve()
      }
      utterance.onerror = (event) => {
        this.stopLevel()
        reject(event.error || new Error('SpeechSynthesis failed'))
      }
      window.speechSynthesis.speak(utterance)
    })
  }

  trackLevel() {
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    const tick = () => {
      this.analyser.getByteFrequencyData(data)
      const average = data.reduce((sum, value) => sum + value, 0) / Math.max(1, data.length)
      this.onLevel?.(Math.min(1, average / 90))
      this.rafId = requestAnimationFrame(tick)
    }
    tick()
  }

  stopLevel() {
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.onLevel?.(0)
  }

  stop() {
    this.stopLevel()
    window.speechSynthesis?.cancel?.()
    try { this.source?.stop?.() } catch {}
    this.source?.disconnect?.()
    this.analyser?.disconnect?.()
    this.audioContext?.close?.()
    this.source = null
    this.analyser = null
    this.audioContext = null
  }
}

export function startSpeechRecognition(onText, onEnd) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Recognition) throw new Error('当前浏览器不支持 Web Speech Recognition')

  const recognition = new Recognition()
  recognition.lang = 'zh-CN'
  recognition.interimResults = false
  recognition.continuous = false
  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript || ''
    onText?.(text)
  }
  recognition.onend = () => onEnd?.()
  recognition.start()
  return recognition
}
