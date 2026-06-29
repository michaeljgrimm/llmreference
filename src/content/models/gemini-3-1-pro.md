---
name: Gemini 3.1 Pro
provider: google-deepmind
family: Gemini 3
version: 3.1 Pro
status: preview
releaseDate: 2026-02-19
knowledgeCutoff: 2025-01-31
modality:
  input:
    - text
    - image
    - audio
    - video
  output:
    - text
contextWindow: 1000000
maxOutputTokens: 65500
parameters: undisclosed
pricing:
  inputPerMTok: 2
  outputPerMTok: 12
  currency: USD
license: proprietary
openWeights: false
apiId: gemini-3.1-pro-preview
tags:
  - frontier
  - multimodal
  - reasoning
benchmarks:
  - benchmark: gpqa-diamond
    score: 94.3
    notes: vendor-reported at launch
  - benchmark: swe-bench-verified
    score: 80.6
    notes: vendor-reported at launch
dataUpdated: 2026-06-29
sources:
  - title: Gemini 3.1 Pro — Vertex AI docs
    url: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-1-pro
    date: 2026-06-29
---

Google DeepMind's flagship multimodal reasoning model, with a 1M-token context and native text/image/audio/video input.
