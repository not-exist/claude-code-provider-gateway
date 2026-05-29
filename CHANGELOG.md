# Changelog

All notable changes to Claude Code Provider Gateway will be documented here.

Release notes track the local desktop gateway, daemon, panel, providers, and documentation changes.

## v0.2.3

### Added
- **OpenAI-compatible gateway** — new `/v1/chat/completions` and `/v1/models` endpoints on the proxy port. Any OpenAI SDK, LangChain, or `curl` client can now point at the gateway and send standard OpenAI requests; the gateway converts them to Anthropic format internally and streams back proper OpenAI SSE responses.
- **Request/response conversion layer** — bidirectional conversion between OpenAI `ChatCompletionRequest` / `ChatCompletionResponse` and the Anthropic Messages API: system/developer role messages, image URLs (data URIs and remote URLs), tool/function calling, `tool_choice` semantics, temperature, top_p, stop sequences, and max tokens.
- **Model aliasing** — bidirectional model ID translation so OpenAI clients see clean aliases (`commandcode/deepseek-r1`, etc.) while the daemon routes to internal IDs transparently.
- **OpenAI Gateway panel page** — new page in the local panel with connection details (base URL, API key), a live searchable model explorer filtered by provider, and pre-built curl examples for listing models, chat completions, and streaming.
- **OpenAI Bearer token auth** — `requireOpenAIAuth()` middleware that validates tokens and returns OpenAI-format error objects (`authentication_error`) rather than the proxy's native format.
- **Session compaction** — sessions are now compacted before writing to disk: request log trimmed to the last 200 entries, prompt/response fields capped at 20 000 chars, and raw request preview bodies capped at 50 000 chars (truncation is annotated so it's auditable).
- **Efficient archive reads** — the archive file is no longer fully loaded into memory. Files ≤ 10 MB are read normally; larger files use a low-level tail-read (last 10 MB) that handles partial JSON frames at the read boundary.
- **MIT license metadata** — `license`, `repository`, and `keywords` fields added to all `package.json` files and to `Cargo.toml` / `tauri.conf.json`.

### Changed
- **CommandCode provider refactored** — removed the hardcoded 21-model list, the custom stream transformer (`commandCodeStreamToAnthropic`), and the custom request converter (`anthropicToCommandCode`). The provider now delegates to `AnthropicMessagesTransport` for Claude models and `OpenAIChatTransport` for everything else, and discovers its model list dynamically from the `/models` endpoint at runtime.
- **Legacy CommandCode URL auto-migrated** — the old endpoint `https://api.commandcode.ai/alpha/generate` is silently rewritten to `https://api.commandcode.ai/provider/v1` on load; custom overrides are preserved.
- **CommandCode manual model config hidden** — the model-picker UI is suppressed for the CommandCode provider since models are now discovered dynamically.
- **Archive trimming uses size gate** — after entry-count trimming, if the archive file still exceeds 10 MB the daemon rewrites it in compressed form.
- **Sidebar navigation** — OpenAI Gateway added as a top-level link in the panel sidebar.

### Documentation
- `docs/API_REFERENCE.md` — new entries for `POST /v1/chat/completions` and `GET /v1/models`.
- `docs/PANEL_FEATURES.md` — OpenAI Gateway setup walkthrough with curl examples.
- `docs/TROUBLESHOOTING.md` — OpenAI Gateway troubleshooting section.
- `docs/GETTING-STARTED.md` — OpenAI Gateway quickstart steps.
- `docs/ARCHITECTURE.md` — updated to reflect new `core/openai/` module and removed CommandCode files.
- `README.md` — OpenAI gateway highlighted in feature list.

## v0.1.3

### Added
- **Outbound proxy support** — new Outbound Proxy card in Settings to configure an HTTP/HTTPS proxy URL. When enabled, all daemon outbound requests (OpenAI OAuth token exchange, token refresh, provider API calls, model catalog fetches) are routed through the proxy. Local services (panel, Ollama, LM Studio, llama.cpp) always remain direct. Takes effect on next gateway restart.
- Actionable error message when OpenAI OAuth token exchange fails with `unsupported_country_region_territory`, guiding users to configure an outbound proxy.

### Changed
- Minimum Node.js version for development raised to **>=24** (end users are unaffected — the distributed app is a compiled Bun binary).

## 0.1.0 - Initial Release

- Desktop-first Tauri app with daemon sidecar.
- Local Anthropic-compatible proxy for Claude Code.
- Provider support for OpenAI Account, GitHub Copilot, OpenRouter, DeepSeek, NVIDIA NIM, Kimi, Google AI (Gemini), Ollama, LM Studio, and llama.cpp.
- Provider routing for single-provider mode and all-providers model discovery mode.
- Tier routing for Claude `opus`, `sonnet`, and `haiku` model classes.
- Local session history with request metadata, prompt capture, response preview, token counts, latency, and errors.
- Encrypted local secret store for API keys, OAuth tokens, and gateway auth token.
- Cross-platform desktop build workflow for macOS, Linux, and Windows.
