import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  const viewportRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const [offset, setOffset] = useState(0)

  // Centraliza a linha ativa deslocando a lista com transform, em vez de
  // scrollIntoView — que no mobile "vazava" o scroll para a página inteira
  // e brigava com a mudança de font-size da linha ativa.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const line = lineRefs.current[activeIndex]
    if (!viewport || !line) return

    const recompute = () => {
      const target =
        line.offsetTop + line.offsetHeight / 2 - viewport.clientHeight / 2
      setOffset(target)
    }

    recompute()

    // Reagir a mudanças de tamanho (rotação de tela, resize do teclado no
    // mobile, etc.) sem depender de scroll nativo.
    const ro = new ResizeObserver(recompute)
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [activeIndex])

  useEffect(() => {
    const onResize = () => {
      const viewport = viewportRef.current
      const line = lineRefs.current[activeIndex]
      if (!viewport || !line) return
      setOffset(line.offsetTop + line.offsetHeight / 2 - viewport.clientHeight / 2)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex])

  return (
    <div className="lyrics">
      <div className="lyrics__fade lyrics__fade--top" />
      <div className="lyrics__viewport" ref={viewportRef}>
        <div className="lyrics__list" style={{ transform: `translateY(${-offset}px)` }}>
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
      </div>
      <div className="lyrics__fade lyrics__fade--bottom" />
    </div>
  )
}
