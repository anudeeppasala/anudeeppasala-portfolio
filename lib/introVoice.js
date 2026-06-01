/**
 * Browser speech for intro narration (replaces template AI-avatar video audio).
 * Swap to a custom .mp4 later via data/intro.json mode: "video".
 */

let activeUtterance = null

function pickVoice(preferredNames, lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const langPrefix = (lang || 'en-US').split('-')[0]
  const inLang = voices.filter((v) => v.lang.startsWith(langPrefix))

  for (const name of preferredNames || []) {
    const match = inLang.find((v) => v.name.includes(name))
    if (match) return match
  }

  const maleHint = inLang.find(
    (v) =>
      /male|daniel|alex|aaron|fred|david|james|mark|google us english/i.test(v.name) &&
      !/female|samantha|victoria|karen|zira/i.test(v.name)
  )
  if (maleHint) return maleHint

  return inLang[0] || voices[0]
}

export function cancelIntroSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  activeUtterance = null
}

export function speakIntro({ text, voiceConfig, onStart, onEnd, onError }) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text?.trim()) {
    onError?.()
    return false
  }

  cancelIntroSpeech()

  const utterance = new SpeechSynthesisUtterance(text.trim())
  const { lang = 'en-US', rate = 0.9, pitch = 0.92, preferredNames = [] } = voiceConfig || {}

  utterance.lang = lang
  utterance.rate = rate
  utterance.pitch = pitch

  const assignVoice = () => {
    const voice = pickVoice(preferredNames, lang)
    if (voice) utterance.voice = voice
  }

  assignVoice()
  if (!window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.onvoiceschanged = () => {
      assignVoice()
      window.speechSynthesis.onvoiceschanged = null
    }
  }

  utterance.onstart = () => onStart?.()
  utterance.onend = () => {
    activeUtterance = null
    onEnd?.()
  }
  utterance.onerror = () => {
    activeUtterance = null
    onError?.()
  }

  activeUtterance = utterance
  window.speechSynthesis.speak(utterance)
  return true
}

export function isIntroSpeaking() {
  return typeof window !== 'undefined' && window.speechSynthesis?.speaking
}
