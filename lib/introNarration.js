import { speakIntro, cancelIntroSpeech, isIntroSpeaking } from '@/lib/introVoice'
import { getRecordedVoiceBlob } from '@/lib/introVoiceStorage'

let activeAudio = null
let activeObjectUrl = null

function revokeObjectUrl() {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl)
    activeObjectUrl = null
  }
}

export function cancelIntroNarration() {
  cancelIntroSpeech()
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
    activeAudio = null
  }
  revokeObjectUrl()
}

export function isNarrationPlaying() {
  return isIntroSpeaking() || Boolean(activeAudio && !activeAudio.paused)
}

async function assetExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

function playAudioBlob(blob, { onStart, onEnd, onError }) {
  cancelIntroNarration()
  const url = URL.createObjectURL(blob)
  activeObjectUrl = url
  const audio = new Audio(url)
  activeAudio = audio
  audio.onplay = () => onStart?.()
  audio.onended = () => {
    activeAudio = null
    revokeObjectUrl()
    onEnd?.()
  }
  audio.onerror = () => {
    activeAudio = null
    revokeObjectUrl()
    onError?.()
  }
  audio.play().catch(() => onError?.())
}

function playAudioUrl(url, handlers) {
  cancelIntroNarration()
  const audio = new Audio(url)
  activeAudio = audio
  audio.onplay = () => handlers.onStart?.()
  audio.onended = () => {
    activeAudio = null
    handlers.onEnd?.()
  }
  audio.onerror = () => {
    activeAudio = null
    handlers.onError?.()
  }
  audio.play().catch(() => handlers.onError?.())
}

/**
 * Priority: your recorded voice (browser) → intro-voice file → browser TTS.
 */
export async function playIntroNarration(intro, handlers = {}) {
  if (!intro.narration?.enabled) return false

  const recorded = await getRecordedVoiceBlob()
  if (recorded?.size) {
    playAudioBlob(recorded, handlers)
    return true
  }

  const audioSrc = intro.audioSrc
  if (audioSrc && (await assetExists(audioSrc))) {
    playAudioUrl(audioSrc, handlers)
    return true
  }

  return speakIntro({
    text: intro.narration.text,
    voiceConfig: intro.voice,
    ...handlers,
  })
}
