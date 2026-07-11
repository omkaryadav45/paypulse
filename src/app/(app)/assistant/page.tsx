import { AssistantChat } from "@/components/assistant/assistant-chat";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about your payments data in plain English — answers are
          grounded in live database queries via tool-calling.
        </p>
      </div>
      <AssistantChat />
    </div>
  );
}
