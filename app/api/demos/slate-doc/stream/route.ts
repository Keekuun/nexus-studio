import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

interface StreamNodeData {
  type: string;
  content?: string;
  level?: number;
  title?: string;
  status?: string;
  description?: string;
  url?: string;
  caption?: string;
  items?: string[];
}

// Reusing the mock data structure from the frontend utils
const MOCK_STREAM_DATA: StreamNodeData[] = [
  {
    type: "title",
    content: "Project Nexus Analysis (Server Stream)",
    level: 1,
  },
  {
    type: "paragraph",
    content:
      "This content is streaming directly from the Next.js API via Server-Sent Events (SSE).",
  },
  {
    type: "card",
    title: "Live Data Connection",
    status: "success",
    description:
      "Successfully established connection to /api/demos/slate-doc/stream",
  },
  {
    type: "paragraph",
    content: "The following metrics are simulated server-side:",
  },
  {
    type: "list",
    items: [
      "Server Response Time: < 50ms",
      "Concurrent Connections: 1",
      "Stream Protocol: text/event-stream",
    ],
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    caption: "Technology Stack",
  },
  {
    type: "title",
    content: "Next Steps",
    level: 2,
  },
  {
    type: "paragraph",
    content:
      "Try adding a comment to any of these blocks. The comments are also persisted in an in-memory server store.",
  },
];

// Helper to convert backend data to Slate Node (simplified version of frontend logic)
const convertToSlateNode = (data: StreamNodeData) => {
  const id = nanoid();

  switch (data.type) {
    case "title":
      return {
        type: "title",
        level: data.level || 1,
        id,
        children: [{ text: data.content || "" }],
      };
    case "card":
      return {
        type: "card",
        id,
        title: data.title,
        status: data.status,
        description: data.description,
        children: [{ text: "" }],
      };
    case "image":
      return {
        type: "image",
        id,
        url: data.url,
        caption: data.caption,
        children: [{ text: "" }],
      };
    case "list":
      return {
        type: "list",
        id,
        children: (data.items || []).map((item: string) => ({
          type: "paragraph",
          id: nanoid(),
          children: [{ text: item }],
        })),
      };
    default:
      return {
        type: "paragraph",
        id,
        children: [{ text: data.content || "" }],
      };
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt") || "default";

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const accumulatedNodes: any[] = [];

      // Optional: Add a "User Prompt" block at the start if provided
      if (prompt !== "default") {
        accumulatedNodes.push(
          convertToSlateNode({
            type: "paragraph",
            content: `You asked: "${prompt}"`,
          })
        );
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(accumulatedNodes)}\n\n`)
        );
      }

      for (const data of MOCK_STREAM_DATA) {
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const newNode = convertToSlateNode(data);
        accumulatedNodes.push(newNode);

        // Send the full state (in a real app, might send diffs)
        // SSE format: data: <payload>\n\n
        const payload = JSON.stringify(accumulatedNodes);
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      }

      // Close stream
      controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
