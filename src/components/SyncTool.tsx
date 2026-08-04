import { useEffect, useMemo, useRef, useState } from 'react'
import type { LyricLine } from '../types'
import './SyncTool.css'

interface Props {
  audioSrc: string
  initialLyrics: LyricLine[]
}

export default function SyncTool({ audioSrc, initialLyrics }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [rawText, setRawText] = useState(initialLyrics.map((l) => l.text).join('\n'))
  const [marks, setMarks] = useState<(number | null)[]>(initialLyrics.map(() => null))
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [copied, setCopied] = useState(false)

  const lines = useMemo(
    () => rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0),
    [rawText],
  )

  // se o texto mudar, realinha os marks ao novo número de linhas
  useEffect(() => {
    setMarks((prev) => {
      const next = lines.map((_, i) => prev[i] ?? null)
      return next
    })
  }, [lines.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const nextIndex = marks.findIndex((m) => m === null)

  const markCurrent = () => {
    const audio = audioRef.current
    if (!audio || nextIndex === -1) return
    setMarks((prev) => {
      const next = [...prev]
      next[nextIndex] = Math.round(audio.currentTime * 10) / 10
      return next
    })
  }

  const undoLast = () => {
    setMarks((prev) => {
      const lastMarked = [...prev].reverse().findIndex((m) => m !== null)
      if (lastMarked === -1) return prev
      const idx = prev.length - 1 - lastMarked
      const next = [...prev]
      next[idx] = null
      return next
    })
  }

  const resetMarks = () => setMarks(lines.map(() => null))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        markCurrent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // sem deps: sempre pega a versão mais recente de markCurrent via closure do render

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

  const generatedCode = useMemo(() => {
    const entries = lines
      .map((text, i) => {
        const t = marks[i]
        const timeStr = t === null ? '0 /* falta marcar */' : t
        return `  { time: ${timeStr}, text: '${text.replace(/'/g, "\\'")}' },`
      })
      .join('\n')
    return `export const lyrics: LyricLine[] = [\n${entries}\n]`
  }, [lines, marks])

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const allMarked = nextIndex === -1 && lines.length > 0

  return (
    <div className="sync">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />

      <h1>Modo sincronização</h1>
      <p className="sync__hint">
        Cole a letra completa (uma linha por linha) na caixa abaixo, dê play na
        música e aperte <kbd>espaço</kbd> (ou o botão "marcar linha") exatamente
        quando cada linha começa a ser cantada. No final, copie o código gerado
        e cole em <code>src/data/lyrics.ts</code>, substituindo o array{' '}
        <code>lyrics</code>.
      </p>

      <div className="sync__transport">
        <button onClick={togglePlay}>{isPlaying ? 'pausar' : 'tocar'}</button>
        <span>{currentTime.toFixed(1)}s</span>
        <button onClick={markCurrent} disabled={nextIndex === -1} className="sync__mark-btn">
          marcar linha atual (espaço)
        </button>
        <button onClick={undoLast}>desfazer última marca</button>
        <button onClick={resetMarks}>reiniciar marcas</button>
      </div>

      <label className="sync__label" htmlFor="raw">
        Letra (uma linha por linha)
      </label>
      <textarea
        id="raw"
        className="sync__textarea"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={8}
      />

      <ol className="sync__lines">
        {lines.map((text, i) => (
          <li
            key={i}
            className={
              marks[i] !== null ? 'done' : i === nextIndex ? 'current' : undefined
            }
          >
            <span className="sync__time">
              {marks[i] !== null ? `${marks[i]}s` : '—'}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ol>

      <div className="sync__output">
        <div className="sync__output-header">
          <strong>
            {allMarked
              ? 'Tudo marcado ✓'
              : `${marks.filter((m) => m !== null).length}/${lines.length} marcadas`}
          </strong>
          <button onClick={copyCode}>{copied ? 'copiado!' : 'copiar código'}</button>
        </div>
        <pre>{generatedCode}</pre>
      </div>
    </div>
  )
}
