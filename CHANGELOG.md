# Changelog

All notable changes to Claude Code Provider Gateway will be documented here.

The first public release is planned as **v0.1.0** with desktop installers attached to GitHub Releases.

## 0.1.0 - Initial Release

- Desktop-first Tauri app with daemon sidecar.
- Local Anthropic-compatible proxy for Claude Code.
- Provider support for OpenAI Account, GitHub Copilot, OpenRouter, DeepSeek, NVIDIA NIM, Kimi, Google AI, Ollama, LM Studio, and llama.cpp.
- Provider routing for single-provider mode and all-providers model discovery mode.
- Tier routing for Claude `opus`, `sonnet`, and `haiku` model classes.
- Local session history with request metadata, prompt capture, response preview, token counts, latency, and errors.
- Encrypted local secret store for API keys, OAuth tokens, and gateway auth token.
- Cross-platform desktop build workflow for macOS, Linux, and Windows.
