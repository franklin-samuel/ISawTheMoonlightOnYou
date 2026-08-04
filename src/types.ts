export interface LyricLine {
  /** tempo em segundos a partir do início da música */
  time: number
  text: string
}

export interface SongMeta {
  title: string
  artist: string
  dedication?: string
  audioSrc: string
  coverSrc: string
}
