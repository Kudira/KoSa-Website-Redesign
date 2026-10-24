// OpenRouter chat-completions client with model fallback chain.
// Streams in OpenAI/OpenRouter SSE format and yields incremental text deltas.

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterStreamOptions {
  messages: ChatMsg[];
  maxTokens?: number;
  temperature?: number;
  /** Override the default model chain. */
  models?: string[];
}

export class OpenRouterError extends Error {}

function defaultModels(): string[] {
  // User-preferred chain (free tier may rate-limit during peak hours)
  const preferred = [
    process.env.OPENROUTER_MAIN_MODEL || 'google/gemma-4-31b-it:free',
    process.env.OPENROUTER_FALLBACK_MODEL_1 || 'google/gemma-4-26b-a4b-it:free',
    process.env.OPENROUTER_FALLBACK_MODEL_2 || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  ];
  // Extra resilience diverse providers so we don't hit a wall when one provider is throttled.
  // Override with OPENROUTER_EXTRA_FALLBACKS=comma,separated,list if needed.
  const extra = (process.env.OPENROUTER_EXTRA_FALLBACKS || [
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'openai/gpt-oss-120b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'z-ai/glm-4.5-air:free',
  ].join(',')).split(',').map((s) => s.trim()).filter(Boolean);
  return [...preferred, ...extra].filter(Boolean);
}

/**
 * Stream chat completions through OpenRouter with automatic model fallback.
 * If a model returns an error or throws while streaming has not yet started,
 * the next model in the chain is tried. Once tokens have begun flowing, we
 * stick with that model and surface any mid-stream error to the caller.
 */
export async function* streamOpenRouter(opts: OpenRouterStreamOptions): AsyncGenerator<string, void, unknown> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new OpenRouterError('OPENROUTER_API_KEY not configured');

  const models = opts.models?.length ? opts.models : defaultModels();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let lastErr: unknown = null;

  for (const model of models) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          // OpenRouter attribution headers (recommended)
          'HTTP-Referer': siteUrl,
          'X-Title': 'KoSa Beach Resort',
        },
        body: JSON.stringify({
          model,
          messages: opts.messages,
          max_tokens: opts.maxTokens ?? 1024,
          temperature: opts.temperature ?? 0.7,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        lastErr = new OpenRouterError(`[${model}] ${res.status} ${text.slice(0, 200)}`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let yielded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events separated by \n\n
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const evt of events) {
          for (const line of evt.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string }; finish_reason?: string }[];
                error?: { message?: string };
              };
              if (json.error) {
                if (!yielded) {
                  // Pre-stream error → fall back
                  lastErr = new OpenRouterError(`[${model}] ${json.error.message ?? 'unknown'}`);
                  throw new OpenRouterError('fallback');
                }
                // Mid-stream error → surface
                yield `\n\n(Note: ${json.error.message ?? 'model error'})`;
                return;
              }
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                yielded = true;
                yield delta;
              }
            } catch (e) {
              if ((e as Error).message === 'fallback') throw e;
              // skip non-JSON lines
            }
          }
        }
      }

      if (yielded) return; // success path
      // No tokens emitted; try next model
      lastErr = new OpenRouterError(`[${model}] no tokens emitted`);
    } catch (e) {
      lastErr = e;
      // If we already streamed any text on this model, do not silently fall through
      // (we returned above when yielded === true).
      continue;
    }
  }

  throw (lastErr instanceof Error ? lastErr : new OpenRouterError('All OpenRouter models failed'));
}

/** Non-streaming convenience for short prompts. */
export async function completeOpenRouter(opts: OpenRouterStreamOptions): Promise<string> {
  let full = '';
  for await (const chunk of streamOpenRouter(opts)) full += chunk;
  return full;
}
