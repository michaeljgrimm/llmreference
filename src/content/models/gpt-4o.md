---
name: GPT-4o
provider: openai
family: GPT-4
status: available
releaseDate: 2024-05-13
knowledgeCutoff: 2023-10-01
modality:
  input: [text, image, audio]
  output: [text, audio]
contextWindow: 128000
maxOutputTokens: 16384
license: proprietary
openWeights: false
apiId: gpt-4o-2024-08-06
pricing:
  inputPerMTok: 2.5
  outputPerMTok: 10
  currency: USD
tags: [multimodal, flagship]
benchmarks:
  - benchmark: mmlu
    score: 88.7
    notes: self-reported
dataUpdated: 2026-06-29
sources:
  - title: Hello GPT-4o
    url: https://openai.com/index/hello-gpt-4o/
---

GPT-4o ("omni") is OpenAI's natively multimodal flagship handling text, image,
and audio in and out.

> Seed example record. Figures are illustrative and will be verified/maintained
> by the data-update workflow (LLM-5).
