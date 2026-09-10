# Extraction notes

Source repository: `sdwurg180507280211/metersphere-control-panel`

Source branch: `desktop`

Source baseline commit: `ee177a49ec484d13ca70126fa0842ef65b6547a8`

## Extracted responsibilities

- Live2D Cubism 4 + Pixi rendering
- model switching
- drag and wheel scaling with local persistence
- motion and expression triggering
- eye animation and idle gaze
- text/audio-driven mouth movement
- browser TTS and optional HTTP TTS
- browser speech recognition
- transparent always-on-top Electron window

## Removed coupling

- MeterSphere backend and service management
- plugin registry
- Zustand application stores
- WebSocket state
- control-panel routing and tabs
- hard-coded dependency on `/api/chat/tts`

HTTP TTS can be restored by setting `VITE_TTS_ENDPOINT`. The endpoint must accept `POST { "text": "..." }` and return playable audio bytes.

## Asset migration

The complete `frontend/public/live2d/` snapshot from the source baseline is imported into `public/live2d/`, including Cubism Core and the Rice, 符玄, 藿藿, 简, 镜流, 卡芙卡, 妮可, 知更鸟 and 秧秧 model packages. `waifu-tips.json` and `test-live2d.html` are copied from the same source snapshot.

The import is pinned to the exact source commit so later changes on the control-panel `desktop` branch cannot silently alter this standalone repository.
