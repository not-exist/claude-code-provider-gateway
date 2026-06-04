import assert from "node:assert/strict";
import test from "node:test";
import { anthropicToOpenAIWithWarnings } from "./conversion.js";
import type { MessagesRequest } from "./types.js";

test("anthropicToOpenAIWithWarnings reports dropped and translated Anthropic-only fields", () => {
  const req: MessagesRequest = {
    model: "claude-haiku",
    max_tokens: 100,
    system: [
      {
        type: "text",
        text: "system",
        cache_control: { type: "ephemeral" },
      } as unknown as { type: "text"; text: string },
    ],
    messages: [
      {
        role: "assistant",
        content: [
          { type: "text", text: "previous" },
          { type: "thinking", thinking: "hidden chain" },
        ],
      },
    ],
    tools: [{ name: "lookup", input_schema: { type: "object", properties: {} } }],
    tool_choice: { type: "any" },
    top_k: 25,
    thinking: { type: "enabled", budget_tokens: 1024 },
    metadata: { user_id: "user-1" },
  };

  const { request, warnings } = anthropicToOpenAIWithWarnings(req, "gpt-test");
  const codes = warnings.map((warning) => warning.code);

  assert.equal(request.model, "gpt-test");
  assert.equal(request.tool_choice, "required");
  assert.equal(
    request.messages.some((message) => JSON.stringify(message.content).includes("hidden")),
    false,
  );
  assert.ok(codes.includes("top_k_dropped"));
  assert.ok(codes.includes("metadata_dropped"));
  assert.ok(codes.includes("thinking_request_dropped"));
  assert.ok(codes.includes("thinking_block_dropped"));
  assert.ok(codes.includes("cache_control_metadata_dropped"));
  assert.ok(codes.includes("tool_choice_any_translated"));
});

test("anthropicToOpenAIWithWarnings keeps tool results immediately after tool calls", () => {
  const req: MessagesRequest = {
    model: "claude-haiku",
    max_tokens: 100,
    messages: [
      {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            name: "Read",
            input: { file_path: "README.md" },
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "toolu_123",
            content: "file contents",
          },
          {
            type: "text",
            text: "Please continue.",
          },
        ],
      },
    ],
  };

  const { request } = anthropicToOpenAIWithWarnings(req, "gpt-test");

  assert.equal(request.messages[0]?.role, "assistant");
  assert.equal(request.messages[1]?.role, "tool");
  assert.equal(request.messages[1]?.tool_call_id, "toolu_123");
  assert.equal(request.messages[2]?.role, "user");
});
