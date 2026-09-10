# Extraction notes

Source repository: `sdwurg180507280211/metersphere-control-panel`

Source branch: `desktop`

Source baseline commit: `ee177a49ec484d13ca70126fa0842ef65b6547a8`

## Extracted responsibilities

- Live2D Cubism 4 + Pixi rendering
- model switching
- drag and wheel scaling with local persistence
- motion and expression triggering
- mouth parameter driving
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

## Asset policy

The original branch contains many large third-party character models. They are not copied automatically into this standalone public repository. Keep model packs separate unless their redistribution terms are confirmed.
