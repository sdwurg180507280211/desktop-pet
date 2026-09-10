let runtimePromise = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-desktop-pet-src="${src}"]`)
    if (existing) {
      if (window.Live2DCubismCore) resolve()
      else existing.addEventListener('load', resolve, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.desktopPetSrc = src
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', () => reject(new Error(`无法加载 Cubism Core: ${src}`)), { once: true })
    document.head.appendChild(script)
  })
}

export async function loadLive2DRuntime() {
  if (runtimePromise) return runtimePromise

  runtimePromise = (async () => {
    if (!window.Live2DCubismCore) {
      const coreUrl = `${import.meta.env.BASE_URL}live2d/live2dcubismcore.min.js`
      await loadScript(coreUrl)
    }

    const PIXI = await import('pixi.js')
    window.PIXI = PIXI
    const { Live2DModel } = await import('pixi-live2d-display/cubism4')
    return { PIXI, Live2DModel }
  })()

  return runtimePromise
}
