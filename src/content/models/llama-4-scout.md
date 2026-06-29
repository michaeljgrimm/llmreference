---
name: Llama 4 Scout
provider: meta-ai
family: Llama 4
version: 4 Scout
status: available
releaseDate: 2025-04-05
modality:
  input:
    - text
    - image
  output:
    - text
contextWindow: 10000000
parameters: 109B total / 17B active (16 experts, MoE)
license: Llama-4-Community
openWeights: true
apiId: llama-4-scout
huggingFaceId: meta-llama/Llama-4-Scout-17B-16E-Instruct
tags:
  - open-weights
  - multimodal
  - long-context
dataUpdated: 2026-06-29
sources:
  - title: The Llama 4 herd — Meta AI
    url: https://ai.meta.com/blog/llama-4-multimodal-intelligence/
    date: 2026-06-29
---

Meta's efficient open-weight Llama 4 variant with a 10M-token context window that fits on a single H100.
