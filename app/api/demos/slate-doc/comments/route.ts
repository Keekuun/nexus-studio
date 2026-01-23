import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

// File-based persistence for comments
const DATA_FILE_PATH = path.join(
  process.cwd(),
  "app/api/demos/slate-doc/comments/comments-db.json"
);

interface Comment {
  id: string;
  nodeId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  replies: Comment[];
}

// Helper to read/write DB
const getDB = (): Record<string, Comment[]> => {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading comments DB:", error);
  }
  return {};
};

const saveDB = (data: Record<string, Comment[]>) => {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing comments DB:", error);
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nodeId = searchParams.get("nodeId");

  const db = getDB();

  if (nodeId) {
    return NextResponse.json(db[nodeId] || []);
  }

  return NextResponse.json(db);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nodeId, content, author } = body;

    if (!nodeId || !content) {
      return NextResponse.json(
        { error: "Missing nodeId or content" },
        { status: 400 }
      );
    }

    const newComment = {
      id: nanoid(),
      nodeId,
      author: author || {
        id: "user-guest",
        name: "Guest User",
        avatar: "",
      },
      content,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const db = getDB();
    if (!db[nodeId]) {
      db[nodeId] = [];
    }

    db[nodeId].push(newComment);
    saveDB(db);

    return NextResponse.json(newComment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
