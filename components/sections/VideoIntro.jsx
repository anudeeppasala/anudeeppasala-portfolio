'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import content from '@/data/content.json'
import intro from '@/data/intro.json'
import { ASSETS } from '@/lib/assets'
import { playIntroNarration, cancelIntroNarration, isNarrationPlaying } from '@/lib/introNarration'
import styles from '@/styles/sections/VideoIntro.module.css'

const CinematicLayer = dynamic(() => import('@/components/three/CinematicLayer'), { ssr: false })

const isCinematic = intro.mode === 'cinematic'
const introPhoto  = intro.introPhotoSrc ?? ASSETS.introSuit
const characterSrc  = intro.characterSrc ?? ASSETS.aiCharacter

function scrollNext() {
  const main = document.querySelector('main')
  if (main) main.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

export default function VideoIntro() {
  const videoRef      = useRef(null)
  const photoRef      = useRef(null)
  const greetRef      = useRef(null)
  const nameRef       = useRef(null)
  const roleRef       = useRef(null)
  const scrollRef     = useRef(null)
  const hintRef       = useRef(null)
  const presenterRef  = useRef(null)

  const [voiceOn,     setVoiceOn]     = useState(false)
  const [speaking,    setSpeaking]    = useState(false)
  const [playing,     setPlaying]     = useState(!isCinematic)
  const [showHint,    setShowHint]    = useState(true)
  const [isMobile,    setIsMobile]    = useState(false)
  const [useVideo,    setUseVideo]    = useState(!isCinematic)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.4 })
    tl.fromTo(greetRef.current,  { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(nameRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .fromTo(roleRef.current,   { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo(scrollRef.current, { opacity: 0 },         { opacity: 1, duration: 0.5 }, '-=0.1')
    if (presenterRef.current) {
      tl.fromTo(presenterRef.current, { opacity: 0, y: 24, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.5')
    }
    return () => tl.kill()
  }, [])

  useEffect(() => {
    if (isCinematic && photoRef.current) {
      gsap.fromTo(
        photoRef.current,
        { scale: 1.05, opacity: 0 },
        { scale: 1.12, opacity: 1, duration: 14, ease: 'none', repeat: -1, yoyo: true }
      )
    }

    const v = videoRef.current
    if (!v || isCinematic) return
    v.muted = true
    const t = gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
    return () => t.kill()
  }, [useVideo])

  useEffect(() => {
    if (!isCinematic) return
    fetch(intro.videoSrc, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setUseVideo(true)
      })
      .catch(() => {})
  }, [])

  async function startNarration() {
    if (!intro.narration?.enabled) return
    const ok = await playIntroNarration(intro, {
      onStart: () => {
        setVoiceOn(true)
        setSpeaking(true)
      },
      onEnd: () => {
        setSpeaking(false)
      },
      onError: () => {
        setSpeaking(false)
      },
    })
    if (ok) dismissHint()
  }

  useEffect(() => {
    function onLoaderDismissed() {
      if (isCinematic) {
        return
      }
      const v = videoRef.current
      if (!v) return
      v.muted = false
      setVoiceOn(true)
      dismissHint()
    }
    window.addEventListener('loader-dismissed', onLoaderDismissed)
    return () => window.removeEventListener('loader-dismissed', onLoaderDismissed)
  }, [])

  useEffect(() => {
    function onAnimationDone() {
      const v = videoRef.current
      if (!v || isCinematic) return
      v.play().catch(() => {})
    }
    window.addEventListener('loader-animation-done', onAnimationDone)
    return () => window.removeEventListener('loader-animation-done', onAnimationDone)
  }, [])

  useEffect(() => {
    if (!showHint) return
    const id = setTimeout(() => dismissHint(), 6000)
    return () => clearTimeout(id)
  }, [showHint])

  useEffect(() => () => cancelIntroNarration(), [])

  function dismissHint() {
    if (!hintRef.current) return
    gsap.to(hintRef.current, {
      opacity: 0, y: -8, duration: 0.35,
      onComplete: () => setShowHint(false),
    })
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else         { v.play();  setPlaying(true)  }
  }

  function toggleVoice() {
    if (showHint) dismissHint()

    if (isCinematic) {
      if (isNarrationPlaying()) {
        cancelIntroNarration()
        setVoiceOn(false)
        setSpeaking(false)
      } else {
        startNarration()
      }
      return
    }

    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setVoiceOn(!v.muted)
  }

  function handleEnded() {
    const main = document.querySelector('main')
    if (main && main.scrollTop < window.innerHeight * 0.4) scrollNext()
  }

  const ambientSrc = isCinematic ? intro.ambientSrc : intro.videoSrc
  const mainSrc    = useVideo && !isCinematic ? intro.videoSrc : (useVideo ? intro.videoSrc : null)

  return (
    <section className={styles.section}>

      {isCinematic ? (
        <>
          <div className={styles.bgPhoto} aria-hidden>
            <Image
              src={intro.ambientSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className={styles.bgPhotoImg}
              unoptimized
            />
          </div>
          <div ref={photoRef} className={styles.mainPhoto}>
            <Image
              src={introPhoto}
              alt={profile.name.full}
              fill
              priority
              sizes="100vw"
              className={styles.mainPhotoImg}
              unoptimized
            />
          </div>
        </>
      ) : (
        <>
          <video
            src={ambientSrc}
            autoPlay muted playsInline loop
            aria-hidden="true"
            className={styles.bgVideo}
          />
          <video
            ref={videoRef}
            data-testid="intro-video"
            src={mainSrc || intro.videoSrc}
            muted playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={handleEnded}
            className={styles.mainVideo}
          />
        </>
      )}

      {useVideo && isCinematic && mainSrc && (
        <video
          ref={videoRef}
          data-testid="intro-video"
          src={mainSrc}
          muted playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
          className={styles.mainVideo}
        />
      )}

      <div className={styles.overlay} />

      {!isMobile && <CinematicLayer />}

      <div className={styles.heroContent}>
        <p ref={greetRef} className={styles.eyebrow}>{content.site.tagline}</p>
        <h1 ref={nameRef} className={styles.name}>
          {profile.name.first}<br />{profile.name.last}
        </h1>
        <p ref={roleRef} className={styles.role}>{profile.roles.detailed}</p>
      </div>

      {isCinematic && (
        <div
          ref={presenterRef}
          className={`${styles.presenter} ${speaking ? styles.presenterSpeaking : ''}`}
          aria-label={`${intro.presenter.label} — ${profile.name.full}`}
        >
          <div className={styles.presenterRing} aria-hidden />
          <div className={styles.presenterAvatar}>
            <Image
              src={characterSrc}
              alt={intro.presenter.label}
              fill
              sizes="160px"
              className={styles.presenterImg}
              unoptimized
            />
          </div>
          <div className={styles.presenterMeta}>
            <span className={styles.presenterLabel}>{intro.presenter.label}</span>
            <span className={styles.presenterCaption}>
              {speaking ? profile.name.first : intro.presenter.caption}
            </span>
          </div>
        </div>
      )}

      {!playing && !isCinematic && (
        <button className={styles.playOverlay} onClick={togglePlay} aria-label="Play video">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="35" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <polygon points="29,20 56,36 29,52" fill="white" />
          </svg>
        </button>
      )}

      {showHint && (
        <div ref={hintRef} className={styles.soundHint} onClick={toggleVoice} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
          <span className={styles.soundPulse} />
          <span>{isCinematic ? 'Tap for voice' : 'Tap for sound'}</span>
        </div>
      )}

      <div className={styles.controls}>
        {!isCinematic && (
          <button className={styles.ctrlBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing
              ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2" y="1" width="4" height="12" rx="1" />
                  <rect x="8" y="1" width="4" height="12" rx="1" />
                </svg>
              )
              : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <polygon points="2,1 13,7 2,13" />
                </svg>
              )}
          </button>
        )}

        <button
          className={styles.ctrlBtn}
          onClick={toggleVoice}
          aria-label={voiceOn || speaking ? 'Mute voice' : 'Play voice'}
        >
          {voiceOn || speaking
            ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
                <path d="M10.5 5.5C11.8 6.5 12.5 7.2 12.5 8s-.7 1.5-2 2.5" />
                <path d="M12 3.5C14 5 15 6.4 15 8s-1 3-3 4.5" />
              </svg>
            )
            : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
                <line x1="10" y1="5" x2="14" y2="11" />
                <line x1="14" y1="5" x2="10" y2="11" />
              </svg>
            )}
        </button>
      </div>

      <button
        ref={scrollRef}
        className={styles.scrollCue}
        onClick={scrollNext}
        aria-label="Scroll to next section"
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>

    </section>
  )
}
