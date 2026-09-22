import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import {
  getKpis,
  getMethodBreakdown,
  getStatusBreakdown,
  getTopMerchants,
} from "@/lib/queries";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are PayPulse Assistant, an analytics co-pilot embedded in a payments dashboard.
You help finance and operations teams understand payments performance: revenue, transaction volume,
success rates, fees, payment methods, and merchant performance.

Rules:
- ALWAYS call the provided tools to fetch real numbers — never invent figures.
- Be concise and skimmable. Use short paragraphs or bullet points.
- Format money as USD (e.g. $12,345) and rates as percentages.
- If a question is unrelated to payments analytics, politely steer the user back.`;

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      "The AI Assistant is not configured yet. Add a GOOGLE_GENERATIVE_AI_API_KEY environment variable to enable it.",
      { status: 503 },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google("gemini-3.6-flash"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    stopWhen: stepCountIs(5),

    tools: {
      getPaymentsOverview: tool({
        description:
          "Get last-30-day payment KPIs: total revenue, transaction volume, success rate, fees collected, and percentage change versus the prior 30 days.",
        inputSchema: z.object({}),
        execute: async () => getKpis(),
      }),

      getTopMerchants: tool({
        description: "Get the top merchants ranked by successful revenue.",
        inputSchema: z.object({
          limit: z
            .number()
            .min(1)
            .max(10)
            .default(5)
            .describe("How many merchants to return"),
        }),
        execute: async ({ limit }) => getTopMerchants(limit),
      }),

      getTransactionStatusBreakdown: tool({
        description:
          "Get the count of transactions grouped by status: SUCCESS, FAILED, PENDING, REFUNDED.",
        inputSchema: z.object({}),
        execute: async () => getStatusBreakdown(),
      }),

      getRevenueByMethod: tool({
        description:
          "Get successful revenue grouped by payment method: CARD, ACH, WALLET.",
        inputSchema: z.object({}),
        execute: async () => getMethodBreakdown(),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}