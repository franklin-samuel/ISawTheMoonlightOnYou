# para você — player com letra sincronizada

Um mini site estilo Spotify: toca a música e mostra a letra em tempo real,
linha a linha.

## 1. Rodar o projeto

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## 2. Colocar sua música

Coloque o arquivo de áudio em `public/audio.mp4` (esse é o nome que o app já
espera — veja `src/data/lyrics.ts`, campo `audioSrc`). Se seu arquivo for
`.mp3`, funciona igual: só troque `audioSrc: '/audio.mp4'` para
`audioSrc: '/audio.mp3'` e coloque o `audio.mp3` na mesma pasta `public/`.

## 3. Editar título, dedicatória e letra

Tudo isso fica em **`src/data/lyrics.ts`**:

```ts
export const songMeta: SongMeta = {
  title: 'Nome da música',
  artist: 'Seu nome',
  dedication: 'pra você',
  audioSrc: '/audio.mp3',
}

export const lyrics: LyricLine[] = [
  { time: 0, text: '♪ instrumental' },
  { time: 4, text: 'primeira linha da letra' },
  // ...
]
```

`time` é em segundos — é o momento exato em que aquela linha começa a tocar.

## 4. Descobrir os tempos certos de cada linha (Modo Sincronização)

Como você ainda não tem os tempos marcados, o projeto já vem com uma
ferramenta pra isso. Com o projeto rodando, acesse:

```
http://localhost:5173/?sync
```

Nessa tela você:
1. Cola a letra inteira na caixa de texto (uma linha por linha).
2. Dá play na música.
3. Aperta a barra de **espaço** (ou o botão "marcar linha") exatamente no
   momento em que cada linha começa a ser cantada — vai marcando uma linha
   de cada vez, em ordem.
4. No final, clica em **"copiar código"** e cola o resultado em
   `src/data/lyrics.ts`, substituindo o array `lyrics` inteiro.

Essa tela é só uma ferramenta de trabalho — quem for abrir o link normal
(sem `?sync`) só vê o player bonito, nunca essa parte.

## 5. Capa (opcional)

Se quiser trocar o disco de vinil animado por uma foto, coloque a imagem em
`public/cover.jpg` e descomente a linha `coverSrc: '/cover.jpg'` em
`src/data/lyrics.ts`.

## 6. Publicar o site (pra mandar o link pra ela)

O jeito mais simples é a [Vercel](https://vercel.com) ou
[Netlify](https://netlify.com):

```bash
npm run build
```

Isso gera a pasta `dist/` — é só arrastar ela no painel da Netlify
("Deploy manually"), ou conectar o repositório na Vercel. Em minutos você
tem um link pra mandar pra ela.

## Estrutura do projeto

```
src/
  data/lyrics.ts        ← edite aqui: título, dedicatória, letra e tempos
  components/
    Player.tsx           ← player principal (o que ela vai ver)
    LyricsView.tsx        ← lista de letra com destaque da linha atual
    SyncTool.tsx          ← ferramenta de sincronização (rota ?sync)
  App.tsx                ← decide entre Player e SyncTool
public/
  audio.mp4               ← coloque sua música aqui
```
