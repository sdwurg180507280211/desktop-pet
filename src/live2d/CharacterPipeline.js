const EMOTIONS = [
  { keys: ['哈哈', '开心', '高兴', '快乐', '棒', '😊', '😄'], names: ['happy', 'smile'] },
  { keys: ['难过', '伤心', '哭', '悲伤', '😢', '😭'], names: ['sad'] },
  { keys: ['生气', '讨厌', '可恶', '😠', '😡'], names: ['angry'] },
  { keys: ['惊讶', '震惊', '居然', '😲', '😱'], names: ['surprised'] }
]

export class CharacterPipeline {
  constructor(controller) { this.controller = controller }

  async speak(text, endpoint) {
    this.applyEmotion(text)
    return this.controller.voice.speak(text, endpoint)
  }

  applyEmotion(text) {
    const expressions = this.controller.getExpressions()
    const group = EMOTIONS.find((item) => item.keys.some((key) => text.includes(key)))
    if (!group) return false
    const match = expressions.find((item) => group.names.some((name) => String(item?.Name || item?.name || '').toLowerCase().includes(name)))
    if (!match) return false
    this.controller.model?.expression?.(match.Name || match.name)
    return true
  }
}
