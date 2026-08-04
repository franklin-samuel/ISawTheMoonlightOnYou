import { useEffect, useRef } from 'react'
import type { LyricLine } from '../types'
import './LyricsView.css'

interface Props {
  lyrics: LyricLine[]
  currentTime: number
}

function getActiveIndex(lyrics: LyricLine[], time: number): number {
  let active = -1
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= time) active = i
    else break
  }
  return active
}

export default function LyricsView({ lyrics, currentTime }: Props) {
  const activeIndex = getActiveIndex(lyrics, currentTime)
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([])

  useEffect(() => {
    const el = lineRefs.current[activeIndex]
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  return (
    <div className="lyrics">
      <div className="lyrics__fade lyrics__fade--top" />
      <div className="lyrics__list">
        {lyrics.map((line, i) => {
          const distance = Math.abs(i - activeIndex)
          const state =
            i === activeIndex ? 'active' : distance === 1 ? 'near' : 'far'
          return (
            <p
              key={`${line.time}-${i}`}
              ref={(el) => (lineRefs.current[i] = el)}
              className={`lyrics__line lyrics__line--${state}`}
            >
              {line.text}
            </p>
          )
        })}
      </div>
      <div className="lyrics__fade lyrics__fade--bottom" />
    </div>
  )
}
