import { useEffect, useRef, useState } from 'react'
import type { LyricLine, SongMeta } from '../types'
import LyricsView from './LyricsView'
import MoonBackdrop from './MoonBackdrop'
import './Player.css'

interface Props {
  meta: SongMeta
  lyrics: LyricLine[]
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Player({ meta, lyrics }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [started, setStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let raf = 0
    const tick = () => {
      setCurrentTime(audio.currentTime)
      raf = requestAnimationFrame(tick)
    }
    if (isPlaying) raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying])

  const handleBegin = async () => {
    setStarted(true)
    try {
      await audioRef.current?.play()
      setIsPlaying(true)
    } catch {
      // autoplay pode ser bloqueado; o botão de play normal resolve
    }
  }

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const seekTo = (fraction: number) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    audio.currentTime = fraction * duration
    setCurrentTime(audio.currentTime)
  }

  const progress = duration ? currentTime / duration : 0

  return (
    <div className="stage">
      <MoonBackdrop />
      <audio
        ref={audioRef}
        src={meta.audioSrc}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      {!started ? (
        <IntroCard meta={meta} onBegin={handleBegin} />
      ) : (
        <div className="card">
          <div className="card__art">
            <Disc spinning={isPlaying} coverSrc={meta.coverSrc} />
          </div>

          <div className="card__body">
            <header className="card__header">
              <p className="eyebrow">{meta.dedication ?? 'para você'}</p>
              <h1 className="title">{meta.title}</h1>
              <p className="artist">{meta.artist}</p>
            </header>

            <LyricsView lyrics={lyrics} currentTime={currentTime} />

            <div className="transport">
              <div
                className="progress"
                role="slider"
                aria-label="progresso da música"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                tabIndex={0}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  seekTo((e.clientX - rect.left) / rect.width)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') seekTo(Math.min(1, progress + 0.02))
                  if (e.key === 'ArrowLeft') seekTo(Math.max(0, progress - 0.02))
                }}
              >
                <div className="progress__fill" style={{ width: `${progress * 100}%` }} />
                <div className="progress__thumb" style={{ left: `${progress * 100}%` }} />
              </div>

              <div className="transport__row">
                <span className="time">{formatTime(currentTime)}</span>
                <button
                  className="play-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'pausar' : 'tocar'}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <span className="time">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IntroCard({ meta, onBegin }: { meta: SongMeta; onBegin: () => void }) {
  return (
    <div className="intro">
      <p className="intro__hand">{meta.dedication ?? 'pra você'}</p>
      <h1 className="intro__title">{meta.title}</h1>
      <button className="intro__btn" onClick={onBegin}>
        <PlayIcon />
        <span>ouvir</span>
      </button>
    </div>
  )
}

function Disc({ spinning, coverSrc }: { spinning: boolean; coverSrc?: string }) {
  return (
    <div className={`disc ${spinning ? 'disc--spin' : ''}`}>
      <div className="disc__glow" />
      <div className="disc__vinyl">
        {coverSrc ? (
          <img className="disc__cover" src={coverSrc} alt="" />
        ) : (
          <div className="disc__label" />
        )}
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}
