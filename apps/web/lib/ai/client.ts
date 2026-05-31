import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "",
      baseURL: process.env.OPENAI_BASE_URL ?? undefined,
    });
  }
  return openaiClient;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

export async function chat(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  options: ChatOptions = {},
): Promise<string> {
  const client = getOpenAIClient();
  const {
    model = process.env.OPENAI_MODEL ?? "gpt-4o",
    temperature = 0.7,
    maxTokens = 4096,
    system,
  } = options;

  const fullMessages = system
    ? [{ role: "system" as const, content: system }, ...messages]
    : messages;

  const response = await client.chat.completions.create({
    model,
    messages: fullMessages,
    temperature,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function generateBuilderContent(
  prompt: string,
): Promise<string> {
  return chat(
    [{ role: "user", content: prompt }],
    {
      system:
        "You are a website builder AI assistant. Generate clean, semantic HTML and CSS. Respond only with the requested code or content.",
      temperature: 0.3,
    },
  );
}
