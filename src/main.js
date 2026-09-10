import './style.css'
import { DesktopPetController } from './live2d/DesktopPetController.js'
import { DEFAULT_MODEL_ID, MODELS } from './live2d/models.js'
import { startSpeechRecognition } from './live2d/voice.js'

const root = document.querySelector('#app')
root.innerHTML = `
  <div class="window-drag-zone" title="拖动窗口"></div>
  <main class="pet-shell">
    <div id="stage" class="pet-stage"></div>
    <div id="status" class="status">正在加载桌面宠物…</div>
    <section class="toolbar" aria-label="Desktop Pet controls">
      <select id="model-select" title="模型"></select>
      <button id="motion" type="button">动作</button>
      <button id="expression" type="button">表情</button>
      <button id="speak" type="button">说话</button>
      <button id="mic" type="button">语音</button>
      <button id="reset" type="button">复位</button>
      <button id="pin" type="button">置顶</button>
      <button id="close" type="button">×</button>
    </section>
  </main>
`

const stage = document.querySelector('#stage')
const status = document.querySelector('#status')
const select = document.querySelector('#model-select')
const controller = new DesktopPetController(stage, MODELS)
const ttsEndpoint = import.meta.env.VITE_TTS_ENDPOINT || ''
let alwaysOnTop = true

for (const model of Object.values(MODELS)) {
  const option = document.createElement('option')
  option.value = model.id
  option.textContent = model.name
  select.appendChild(option)
}

const savedModel = localStorage.getItem('desktop-pet-model') || DEFAULT_MODEL_ID
select.value = MODELS[savedModel] ? savedModel : DEFAULT_MODEL_ID

function showStatus(message, error = false) {
  status.textContent = message
  status.classList.toggle('error', error)
  status.hidden = !message
}

async function loadModel(modelId) {
  showStatus(`正在加载 ${MODELS[modelId]?.name || modelId}…`)
  try {
    if (!controller.app) await controller.init(modelId)
    else await controller.switchModel(modelId)
    localStorage.setItem('desktop-pet-model', modelId)
    showStatus('')
    window.desktopPet?.reportReady(modelId)
  } catch (error) {
    console.error(error)
    showStatus(`模型加载失败：${error.message}。请检查 public/live2d 资源。`, true)
    window.desktopPet?.reportError(error?.message || error)
  }
}

select.addEventListener('change', () => loadModel(select.value))
document.querySelector('#motion').addEventListener('click', () => controller.playRandomMotion())
document.querySelector('#expression').addEventListener('click', () => controller.playRandomExpression())
document.querySelector('#reset').addEventListener('click', () => controller.reset())
document.querySelector('#speak').addEventListener('click', async () => {
  const text = prompt('让桌面宠物说什么？', '你好，今天也一起加油。')
  if (!text) return
  try { await controller.speak(text, ttsEndpoint) } catch (error) { showStatus(error.message, true) }
})
document.querySelector('#mic').addEventListener('click', () => {
  try {
    showStatus('正在听…')
    startSpeechRecognition(
      (text) => controller.speak(text, ttsEndpoint),
      () => showStatus('')
    )
  } catch (error) {
    showStatus(error.message, true)
  }
})
document.querySelector('#pin').addEventListener('click', (event) => {
  alwaysOnTop = !alwaysOnTop
  window.desktopPet?.setAlwaysOnTop(alwaysOnTop)
  event.currentTarget.classList.toggle('off', !alwaysOnTop)
})
document.querySelector('#close').addEventListener('click', () => window.desktopPet?.close())

window.addEventListener('resize', () => controller.applyLayout())
window.addEventListener('beforeunload', () => controller.destroy())

loadModel(select.value)
