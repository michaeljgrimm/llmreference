---
name: Claude Sonnet 4.6
provider: anthropic
family: Claude Sonnet
version: "4.6"
status: available
knowledgeCutoff: 2025-08-31
modality:
  input:
    - text
    - image
  output:
    - text
contextWindow: 1000000
maxOutputTokens: 128000
parameters: undisclosed
pricing:
  inputPerMTok: 3
  outputPerMTok: 15
  currency: USD
license: proprietary
openWeights: false
apiId: claude-sonnet-4-6
tags:
  - reasoning
  - coding
dataUpdated: 2026-06-29
sources:
  - title: Models overview — Anthropic
    url: https://platform.claude.com/docs/en/about-claude/models/overview
    date: 2026-06-29
---

Anthropic's best balance of speed and intelligence, supporting adaptive and extended thinking over a 1M-token context.
