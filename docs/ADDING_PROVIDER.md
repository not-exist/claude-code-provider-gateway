# Adding a Provider

> Checklist for adding a new LLM provider to CCPG.

Providers are daemon-owned. The panel should consume provider metadata through
the daemon API instead of hardcoding provider behavior wherever possible.

## Before You Start

Decide which transport shape the provider uses:

| Provider API | Base class |
| --- | --- |
| Anthropic Messages compatible | `AnthropicMessagesTransport` |
| OpenAI Chat Completions compatible | `OpenAIChatTransport` |
| Custom auth, catalog, or streaming format | `BaseProvider` |

Prefer an existing transport unless the provider truly needs custom auth,
custom catalog handling, or a non-standard stream format.

If the provider supports **multiple protocols depending on the model** (e.g.,
native Anthropic for first-party models, OpenAI Chat for everything else),
extend `BaseProvider` and dispatch inside `streamResponse()` — see
`copilot.ts` + `copilot-native-anthropic.ts` + `copilot-chat-stream.ts` as a
reference.

## Implementation Checklist

1. Add the provider implementation in `packages/daemon/src/proxy/providers/<provider>.ts`.
2. Register the provider constructor in `packages/daemon/src/proxy/providers/registry.ts`.
3. Add the provider id to `PROVIDER_IDS` in `packages/daemon/src/config/schema.ts`.
4. Add provider defaults in `PROVIDER_DEFAULTS`.
5. Add the display label in `PROVIDER_LABELS`.
6. Add a CLI flag in `CLI_FLAGS` when the provider should be launchable with `ccpg --ProviderName`.
7. Add or update panel provider metadata only when the daemon API cannot derive it.
8. Add tests before opening the PR.

## Required Tests

At minimum, add daemon tests for:

- Provider auth behavior: missing credentials should return a clear provider error.
- Model catalog mapping: provider model ids should become gateway model ids.
- Stream behavior: provider stream chunks should become Anthropic-compatible SSE.
- Routing behavior when the provider can be selected through model prefixes.

Use existing tests as patterns:

- `packages/daemon/src/proxy/providers/api-client.test.ts`
- `packages/daemon/src/proxy/services/model-service.test.ts`
- `packages/daemon/src/proxy/services/message-service.test.ts`
- `packages/daemon/src/proxy/routes/anthropic-routes.test.ts`

For custom OAuth/device flows, add focused tests around pure parsing, expiry,
refresh, and error classification code. Avoid tests that require live provider
accounts.

## Provider Implementation Pattern

```ts
import { OpenAIChatTransport } from './transport-openai.js'

export class ExampleProvider extends OpenAIChatTransport {
  get id() { return 'example' }
  get label() { return 'Example' }

  protected resolveModel(requestedModel: string): string {
    return requestedModel
  }
}
```

### Handling gateway model prefixes

If your provider is listed under the `all` model mode, Claude Code will send
requests with gateway-prefixed model names such as `anthropic/example/model-id`
or `example/model-id`. Strip these before forwarding:

```ts
import { stripGatewayProviderPrefix } from './model-prefix.js'

protected resolveModel(requestedModel: string): string {
  return stripGatewayProviderPrefix(requestedModel, this.id)
}
```

### Wrapping the response stream

Use the helpers in `proxy/services/stream-result.ts` to package your stream
into the `MessageServiceResult` type expected by the message service:

```ts
import { streamResult, streamResultWithCapture } from '../services/stream-result.js'

// Without response capture (simple case):
return streamResult(myReadableStream)

// With response capture for session logging (preferred):
return streamResultWithCapture(myReadableStream, logEntryId)
```

`streamResultWithCapture` tees the stream, stores a 4 KB response preview in
the session log entry, and does not affect delivery to the client.

### Dual-transport pattern

When a provider exposes both an Anthropic-native endpoint and an OpenAI Chat
endpoint, dispatch on the resolved model name inside `streamResponse()`:

```ts
async streamResponse(req: MessagesRequest, inputTokens: number): Promise<StreamResult> {
  const providerModel = this.resolveModel(req.model)

  if (providerModel.startsWith('claude-')) {
    // Native Anthropic protocol — preserves tool_use / thinking blocks
    return streamMyProviderNativeAnthropic({ req, providerModel, ... })
  }

  // Fallback to OpenAI Chat Completions
  const openaiReq = anthropicToOpenAI(req, providerModel)
  const result = await postProviderStream({ url: '...', body: openaiReq, ... })
  if ('error' in result) return { error: result.error }
  return { stream: transformMyChatStream(result.body, ...) }
}
```

For providers with a static or filtered model list, keep that logic inside the
provider class. For provider-wide HTTP concerns, prefer extending the shared
client or transport instead of duplicating fetch code.

## Local Verification

Run the same checks used by the PR quality gate:

```bash
npm test
npm run typecheck
npm run build

cd packages/desktop/src-tauri
cargo fmt --check
cargo check
cargo test
cargo clippy --all-targets -- -D warnings
```

## PR Notes

Every provider PR should include:

- Provider name and API protocol.
- Auth type: API key, OAuth, local unauthenticated, or custom.
- Example model id used during manual testing.
- Which tests were added.
- Whether the provider supports streaming tool calls.
- Whether the provider uses a single transport or dual-transport dispatch.
