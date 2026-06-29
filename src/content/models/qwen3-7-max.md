---
name: Qwen3.7 Max
provider: alibaba
family: Qwen3 Max
version: 3.7 Max
status: available
releaseDate: 2026-05-19
modality:
  input:
    - text
  output:
    - text
contextWindow: 1000000
maxOutputTokens: 65536
parameters: undisclosed
pricing:
  inputPerMTok: 2.5
  outputPerMTok: 7.5
  cachedInputPerMTok: 0.25
  currency: USD
license: proprietary
openWeights: false
apiId: qwen3-7-max
tags:
  - frontier
  - agentic
  - reasoning
benchmarks:
  - benchmark: swe-bench-verified
    score: 80.4
    notes: vendor-reported
  - benchmark: gpqa-diamond
    score: 92.4
    notes: vendor-reported
dataUpdated: 2026-06-29
sources:
  - title: Alibaba's Qwen3.7-Max — VentureBeat
    url: https://venturebeat.com/technology/alibabas-proprietary-qwen3-7-max-can-run-for-35-hours-autonomously-and-supports-external-harnesses-like-anthropics-claude-code
    date: 2026-06-29
---

Alibaba's proprietary text-focused reasoning flagship, built for long-horizon agentic workflows over a 1M-token context.
