import { NextResponse } from "next/server";

interface HistoryNodeData {
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

// Helper to convert backend data to Slate Node with deterministic IDs
const convertToSlateNode = (
  data: HistoryNodeData,
  index: number,
  versionPrefix: string
) => {
  const id = `${versionPrefix}_node_${index}`;

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
        children: (data.items || []).map((item: string, i: number) => ({
          type: "paragraph",
          id: `${id}_item_${i}`,
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

const MOCK_HISTORY_1 = [
  { type: "title", content: "v1.0: Initial Proposal", level: 1 },
  {
    type: "paragraph",
    content:
      "This is the first draft of the proposal. It outlines the basic requirements.",
  },
  {
    type: "card",
    title: "Budget Approval",
    status: "warning",
    description: "Pending finance review.",
  },
];

const MOCK_HISTORY_2 = [
  { type: "title", content: "v1.1: Revised Scope", level: 1 },
  {
    type: "paragraph",
    content:
      "Updated the scope based on client feedback. Removed the mobile app requirement.",
  },
  {
    type: "card",
    title: "Budget Approval",
    status: "success",
    description: "Finance approved the new budget.",
  },
  {
    type: "list",
    items: ["Frontend: React", "Backend: Node.js", "Database: Postgres"],
  },
];

const MOCK_HISTORY_3 = [
  { type: "title", content: "v2.0: Final Specs", level: 1 },
  { type: "paragraph", content: "Final specifications ready for development." },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    caption: "Architecture Diagram",
  },
  {
    type: "card",
    title: "Kickoff Meeting",
    status: "info",
    description: "Scheduled for next Monday.",
  },
];

const HISTORY_LIST = [
  {
    id: "hist_1",
    title: "v2.0: Final Specs",
    summary: "Finalized architecture and timeline.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    content: MOCK_HISTORY_3.map((item, i) => convertToSlateNode(item, i, "v2")),
  },
  {
    id: "hist_2",
    title: "v1.1: Revised Scope",
    summary: "Adjusted scope and budget.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    content: MOCK_HISTORY_2.map((item, i) =>
      convertToSlateNode(item, i, "v1_1")
    ),
  },
  {
    id: "hist_3",
    title: "v1.0: Initial Proposal",
    summary: "Draft proposal for review.",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    content: MOCK_HISTORY_1.map((item, i) =>
      convertToSlateNode(item, i, "v1_0")
    ),
  },
];

export async function GET() {
  return NextResponse.json(HISTORY_LIST);
}
