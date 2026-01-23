import { Descendant } from "slate";
import { CustomElement } from "./types";
import { nanoid } from "nanoid";

// Simulate backend data chunks
const MOCK_STREAM_DATA = [
  {
    type: "title",
    content: "Project Nexus Analysis",
    level: 1,
  },
  {
    type: "paragraph",
    content:
      "Here is the detailed analysis of the project status based on the latest metrics.",
  },
  {
    type: "card",
    title: "Performance Metric",
    status: "success",
    description:
      "System latency has improved by 20% after the latest optimization patch.",
  },
  {
    type: "paragraph",
    content: "However, we noticed some anomalies in the following areas:",
  },
  {
    type: "list",
    items: [
      "Memory usage spikes during peak load",
      "Database connection pool exhaustion",
      "API rate limiting false positives",
    ],
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    caption: "Server Load Distribution",
  },
  {
    type: "title",
    content: "Recommendations",
    level: 2,
  },
  {
    type: "paragraph",
    content:
      "Based on the data, we recommend scaling the database cluster vertically.",
  },
];

// Helper to convert backend data to Slate Node
type MockStreamItem = (typeof MOCK_STREAM_DATA)[number];

export const convertToSlateNode = (data: MockStreamItem): CustomElement => {
  const id = nanoid();

  switch (data.type) {
    case "title":
      return {
        type: "title",
        level: (data.level as 1 | 2 | 3) || 1,
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
        children: [{ text: "" }], // Void node
      };
    case "image":
      return {
        type: "image",
        id,
        url: data.url,
        caption: data.caption,
        children: [{ text: "" }], // Void node
      };
    case "list":
      // Simplified list handling
      // Real slate lists are usually ul > li > p
      // Here we just make a list wrapper and text items
      // For this demo, let's just make it a paragraph for now or a custom list container
      return {
        type: "list",
        id,
        children: (data.items || []).map((item: string) => ({
          type: "paragraph", // Or list-item if we defined it
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

export const simulateSSE = (
  prompt: string,
  onChunk: (nodes: Descendant[]) => void,
  onComplete: () => void
) => {
  const eventSource = new EventSource(
    `/api/demos/slate-doc/stream?prompt=${encodeURIComponent(prompt)}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (Array.isArray(data)) {
        onChunk(data);
      }
    } catch (e) {
      console.error("Error parsing SSE data", e);
    }
  };

  eventSource.addEventListener("done", () => {
    eventSource.close();
    onComplete();
  });

  eventSource.onerror = (err) => {
    console.error("SSE Error", err);
    eventSource.close();
    onComplete();
  };

  return () => eventSource.close();
};
