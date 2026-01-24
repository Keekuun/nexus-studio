import fs from "fs/promises";
import path from "path";
import { MarkdownArticle } from "@/components/canvas/markdown-article";
import { Typography } from "../ui/typography";

export default async function MaterialDocsPage() {
  const assetMdPath = path.join(
    process.cwd(),
    "app/(routes)/demos/material/asset.md"
  );
  const componentsMdPath = path.join(
    process.cwd(),
    "app/(routes)/demos/material/components.md"
  );

  const [assetMd, componentsMd] = await Promise.all([
    fs.readFile(assetMdPath, "utf-8"),
    fs.readFile(componentsMdPath, "utf-8"),
  ]);

  return (
    <div className="container mx-auto max-w-7xl space-y-12 px-4 py-10">
      <div className="border-b pb-4">
        <Typography variant="h1">Material Design System Docs</Typography>
        <Typography variant="subtitle" className="mt-2">
          Documentation for data structures and UI components.
        </Typography>
      </div>

      <div className="grid grid-cols-1 gap-12 xl:grid-cols-2">
        <section className="h-fit space-y-6">
          <div className="sticky top-20 z-10 border-b bg-background/95 py-4 backdrop-blur">
            <Typography variant="h2">Data Structures (asset.md)</Typography>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <MarkdownArticle content={assetMd} />
          </div>
        </section>

        <section className="h-fit space-y-6">
          <div className="sticky top-20 z-10 border-b bg-background/95 py-4 backdrop-blur">
            <Typography variant="h2">
              Component Definitions (components.md)
            </Typography>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <MarkdownArticle content={componentsMd} />
          </div>
        </section>
      </div>
    </div>
  );
}
