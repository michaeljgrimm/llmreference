---
name: DeepSeek V4 Flash
provider: deepseek
family: DeepSeek V4
version: 4 Flash
status: available
releaseDate: 2026-04-24
modality:
  input:
    - text
  output:
    - text
contextWindow: 1000000
maxOutputTokens: 384000
parameters: 284B total / 13B active (MoE)
pricing:
  inputPerMTok: 0.14
  outputPerMTok: 0.28
  cachedInputPerMTok: 0.003
  currency: USD
license: MIT
openWeights: true
apiId: deepseek-chat
huggingFaceId: deepseek-ai/DeepSeek-V4-Flash
tags:
  - open-weights
  - cost-efficient
dataUpdated: 2026-06-29
sources:
  - title: Models & Pricing — DeepSeek API Docs
    url: https://api-docs.deepseek.com/quick_start/pricing
    date: 2026-06-29
---

DeepSeek's smaller, cheaper open-weight V4 MoE variant, with a 1M-token context.
