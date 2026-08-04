import { useMemo } from 'react'
import Player from './components/Player'
import SyncTool from './components/SyncTool'
import { songMeta, lyrics } from './data/lyrics'
import './App.css'

export default function App() {
  const isSyncMode = useMemo(() => {
    return new URLSearchParams(window.location.search).has('sync')
  }, [])

  if (isSyncMode) {
    return <SyncTool audioSrc={songMeta.audioSrc} initialLyrics={lyrics} />
  }

  return <Player meta={songMeta} lyrics={lyrics} />
}
