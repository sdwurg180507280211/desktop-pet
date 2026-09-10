const LIVE2D_BASE = `${import.meta.env.BASE_URL}live2d/`
const asset = (path) => `${LIVE2D_BASE}${path}`

export const MODELS = {
  rice: { id: 'rice', name: 'Rice', path: asset('rice/Rice.model3.json'), scale: 0.33, x: 0.5, y: 0.58 },
  fuxuan: { id: 'fuxuan', name: '符玄', path: asset('fuxuan/符玄.model3.json'), scale: 0.11, x: 0.5, y: 0.62 },
  huohuo: { id: 'huohuo', name: '藿藿', path: asset('huohuo/藿藿.model3.json'), scale: 0.12, x: 0.5, y: 0.66 },
  jian: { id: 'jian', name: '简', path: asset('jian/简.model3.json'), scale: 0.12, x: 0.5, y: 0.66 },
  yangyang: { id: 'yangyang', name: '秧秧', path: asset('yangyang/秧秧.model3.json'), scale: 0.12, x: 0.5, y: 0.62 },
  jingliu: { id: 'jingliu', name: '镜流', path: asset('jingliu/镜流.model3.json'), scale: 0.33, x: 0.5, y: 0.73 },
  kafka: { id: 'kafka', name: '卡芙卡', path: asset('kafka/kafuka1.model3.json'), scale: 0.21, x: 0.5, y: 0.72 },
  robin: { id: 'robin', name: '知更鸟', path: asset('robin/知更鸟.model3.json'), scale: 0.13, x: 0.5, y: 0.68 },
  nicole: { id: 'nicole', name: '妮可', path: asset('nicole/Nicole.model3.json'), scale: 0.17, x: 0.5, y: 0.7 }
}

export const DEFAULT_MODEL_ID = 'rice'
