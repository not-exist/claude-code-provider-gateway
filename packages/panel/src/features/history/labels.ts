const PROVIDER_LABELS: Record<string, string> = {
  openai_account: "OpenAI Account",
  copilot: "GitHub Copilot",
  nvidia_nim: "NVIDIA NIM",
  openrouter: "OpenRouter",
  deepseek: "DeepSeek",
  kimi: "Kimi",
  ollama: "Ollama",
  lmstudio: "LM Studio",
  llamacpp: "llama.cpp",
  local: "Local",
  anthropic_native: "Anthropic (native)",
};

export function providerLabel(id: string): string {
  return PROVIDER_LABELS[id] ?? id;
}
