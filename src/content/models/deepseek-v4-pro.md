---
name: DeepSeek V4 Pro
provider: deepseek
family: DeepSeek V4
version: 4 Pro
status: available
releaseDate: 2026-04-24
modality:
  input:
    - text
  output:
    - text
contextWindow: 1000000
maxOutputTokens: 384000
parameters: 1.6T total / 49B active (MoE)
pricing:
  inputPerMTok: 0.435
  outputPerMTok: 0.87
  cachedInputPerMTok: 0.004
  currency: USD
license: MIT
openWeights: true
apiId: deepseek-chat
huggingFaceId: deepseek-ai/DeepSeek-V4-Pro
tags:
  - open-weights
  - reasoning
  - cost-efficient
benchmarks:
  - benchmark: swe-bench-verified
    score: 80.6
    notes: vendor-reported
dataUpdated: 2026-06-29
sources:
  - title: Models & Pricing — DeepSeek API Docs
    url: https://api-docs.deepseek.com/quick_start/pricing
    date: 2026-06-29
---

DeepSeek's open-weight (MIT) flagship Mixture-of-Experts model, with a 1M-token context and thinking / non-thinking modes.
