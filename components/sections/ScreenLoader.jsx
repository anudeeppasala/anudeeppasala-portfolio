'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import intro from '@/data/intro.json'
import { ASSETS } from '@/lib/assets'
import {
  hasRecordedVoice,
  saveRecordedVoice,
  clearRecordedVoice,
} from '@/lib/introVoiceStorage'
import styles from '@/styles/sections/ScreenLoader.module.css'

const MAX_RECORD_SEC = 12
const SHOW_VOICE_RECORDER = intro.loader?.showVoiceRecorder === true

export default function ScreenLoader({ onDismiss }) {
  const overlayRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const [voiceReady, setVoiceReady] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSec, setRecordSec] = useState(0)
  const [voiceError, setVoiceError] = useState('')

  useEffect(() => {
    if (!SHOW_VOICE_RECORDER) return
    hasRecordedVoice().then(setVoiceReady)
  }, [])

  async function startRecording() {
    setVoiceError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        clearInterval(timerRef.current)
        setRecording(false)
        setRecordSec(0)

        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (blob.size < 800) {
          setVoiceError('Recording too short — try again.')
          return
        }
        await saveRecordedVoice(blob)
        setVoiceReady(true)
      }

      recorder.start()
      setRecording(true)
      setRecordSec(0)
      timerRef.current = setInterval(() => {
        setRecordSec((s) => {
          if (s + 1 >= MAX_RECORD_SEC) stopRecording()
          return s + 1
        })
      }, 1000)
    } catch {
      setVoiceError('Microphone access needed to record your voice.')
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
  }

  async function handleClearVoice() {
    await clearRecordedVoice()
    setVoiceReady(false)
  }

  function handleStart() {
    window.dispatchEvent(new CustomEvent('loader-dismissed'))

    const overlay = overlayRef.current
    if (!overlay) return

    overlay.style.pointerEvents = 'none'

    const top = document.createElement('div')
    top.className = styles.splitTop

    const bottom = document.createElement('div')
    bottom.className = styles.splitBottom

    const line = document.createElement('div')
    line.className = styles.centerLine

    document.body.appendChild(top)
    document.body.appendChild(bottom)
    document.body.appendChild(line)

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
    })

    gsap.fromTo(
      line,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.25, ease: 'power2.out' }
    )

    gsap.to(top, {
      y: '-100%',
      duration: 1,
      ease: 'expo.inOut',
      force3D: true,
    })

    gsap.to(bottom, {
      y: '100%',
      duration: 1,
      ease: 'expo.inOut',
      force3D: true,
    })

    gsap.to(line, {
      opacity: 0,
      duration: 0.3,
      delay: 0.2,
    })

    setTimeout(() => {
      top.remove()
      bottom.remove()
      line.remove()
      window.dispatchEvent(new CustomEvent('loader-animation-done'))
      onDismiss()
    }, 1000)
  }

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div className={styles.liquidBg} aria-hidden />

      <div className={styles.avatarWrap}>
        <Image
          src={ASSETS.portrait}
          alt={intro.presenter?.label ?? profile.name.full}
          width={112}
          height={112}
          priority
          unoptimized
          className={styles.avatarImg}
        />
      </div>

      <p className={styles.monogram}>{profile.name.full.toUpperCase()}</p>

      {SHOW_VOICE_RECORDER ? (
        <div className={styles.voicePanel}>
          <p className={styles.voiceHint}>
            {voiceReady
              ? 'Your voice is saved — it plays on Start.'
              : 'Record a short welcome in your own voice (optional).'}
          </p>

          <div className={styles.voiceActions}>
            {!recording ? (
              <button
                type="button"
                className={styles.voiceBtn}
                onClick={startRecording}
              >
                {voiceReady ? 'Re-record voice' : 'Record my voice'}
              </button>
            ) : (
              <button
                type="button"
                className={`${styles.voiceBtn} ${styles.voiceBtnRecording}`}
                onClick={stopRecording}
              >
                Stop ({MAX_RECORD_SEC - recordSec}s)
              </button>
            )}

            {voiceReady && !recording && (
              <button
                type="button"
                className={styles.voiceBtnGhost}
                onClick={handleClearVoice}
              >
                Clear
              </button>
            )}
          </div>

          {voiceError && <p className={styles.voiceError}>{voiceError}</p>}
        </div>
      ) : (
        <p className={styles.voiceHint}>
          Tap Start to enter. Voice is optional — tap AI Anudeep on the intro.
        </p>
      )}

      <button className={styles.startBtn} onClick={handleStart}>
        Start
      </button>
    </div>
  )
}
