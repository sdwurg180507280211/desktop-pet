# Desktop Pet

A standalone Live2D desktop pet extracted from the `desktop` branch of `sdwurg180507280211/metersphere-control-panel`.

The extraction keeps the Live2D interaction layer independent from MeterSphere: rendering, model switching, drag/scale persistence, random motions and expressions, lip sync, browser TTS, optional HTTP TTS, speech recognition, and a transparent Electron desktop window.

Source baseline: `ee177a49ec484d13ca70126fa0842ef65b6547a8`.

## Run

```bash
npm install
npm run dev
```

For the desktop window:

```bash
npm run electron:dev
```

Build the web bundle:

```bash
npm run build
```

Package Windows installers:

```bash
npm run dist:win
```

## Live2D assets

The Live2D runtime and the character assets from the source `desktop` snapshot are imported into `public/live2d/`.

Included models:

- Rice
- 符玄
- 藿藿
- 简
- 镜流
- 卡芙卡
- 妮可
- 知更鸟
- 秧秧

Cubism Core is stored at `public/live2d/live2dcubismcore.min.js`. Model paths are defined in `src/live2d/models.js`.

The asset import is pinned to source commit `ee177a49ec484d13ca70126fa0842ef65b6547a8` so the standalone repository has a reproducible snapshot.

## Optional HTTP TTS

Browser SpeechSynthesis is the default fallback. To use a server TTS endpoint:

```bash
VITE_TTS_ENDPOINT=http://127.0.0.1:3000/api/chat/tts npm run dev
```

The endpoint must accept JSON `{ "text": "..." }` and return audio bytes.

## Controls

- Drag the character to reposition it inside the pet window.
- Mouse wheel changes character scale.
- Double-click plays a random motion.
- Hover near the bottom to show model, motion, expression, speech, reset, pin and close controls.
- Drag the thin top zone to move the Electron window.

See `docs/MIGRATION.md` for extraction boundaries and source mapping.
