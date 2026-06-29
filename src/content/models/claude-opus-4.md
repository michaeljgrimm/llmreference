---
name: Claude Opus 4
provider: anthropic
family: Claude 4
version: "4"
status: available
releaseDate: 2025-05-22
modality:
  input: [text, image]
  output: [text]
contextWindow: 200000
maxOutputTokens: 32000
license: proprietary
openWeights: false
apiId: claude-opus-4-20250514
pricing:
  inputPerMTok: 15
  outputPerMTok: 75
  currency: USD
tags: [frontier, reasoning, coding]
benchmarks:
  - benchmark: swe-bench-verified
    score: 72.5
    notes: self-reported
  - benchmark: gpqa-diamond
    score: 79.6
    notes: self-reported
dataUpdated: 2026-06-29
sources:
  - title: Introducing Claude 4
    url: https://www.anthropic.com/news/claude-4
---

Claude Opus 4 is Anthropic's most capable Claude 4 model, aimed at frontier
reasoning, long-horizon agentic tasks, and coding.

> Seed example record. Figures are illustrative and will be verified/maintained
> by the data-update workflow (LLM-5).
