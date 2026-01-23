"use client";

import React from "react";
import { Typography } from "../ui/typography";
import { Tag } from "../ui/tag";
import { TextButton } from "../ui/text-button";
import { Image } from "../ui/image";
import { Video } from "../ui/video";
import { AssetCard } from "../ui/asset-card";
import { KeyValueRow } from "../ui/key-value-row";
import { Asset, AssetType } from "../creative-types";

export default function MaterialComponentsPreviewPage() {
  // 模拟数据
  const imageAsset: Asset = {
    id: "asset-1",
    assetId: "asset-1",
    title: "Jewelry Design Sketch",
    type: AssetType.IMAGE,
    url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    description:
      "A detailed sketch of the new jewelry collection showing intricate patterns and gem settings.",
  };

  const videoAsset: Asset = {
    id: "asset-2",
    assetId: "asset-2",
    title: "Model Walk Video",
    type: AssetType.VIDEO,
    url: "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    description:
      "High definition video clip of the model showcasing the summer collection.",
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-12 py-10">
      <div className="border-b pb-4">
        <Typography variant="h1">Material Components Preview</Typography>
        <Typography variant="subtitle" className="mt-2">
          Design system components for the creative content management system.
        </Typography>
      </div>

      {/* Typography Section */}
      <section className="space-y-6">
        <div className="border-b pb-2">
          <Typography variant="h2">Typography</Typography>
        </div>
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4">
            <div>
              <Typography variant="caption" className="mb-1 block">
                H1 (Level 1 Title)
              </Typography>
              <Typography variant="h1">The Morning Miracle</Typography>
            </div>
            <div>
              <Typography variant="caption" className="mb-1 block">
                H2 (Level 2 Title)
              </Typography>
              <Typography variant="h2">
                Brief V2 Reference Picture Added
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="mb-1 block">
                H3 (Level 3 Title)
              </Typography>
              <Typography variant="h3">15s</Typography>
            </div>
            <div>
              <Typography variant="caption" className="mb-1 block">
                H4 (Level 4 Title)
              </Typography>
              <Typography variant="h4">Video Settings</Typography>
            </div>
            <div>
              <Typography variant="caption" className="mb-1 block">
                H5 (Level 5 Title)
              </Typography>
              <Typography variant="h5">
                An organic construction of silver filaments...
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="mb-1 block">
                Body
              </Typography>
              <Typography variant="body">
                An organic construction of silver filaments in a white void that
                solidifies into body architecture on a cold, confident model.
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="mb-1 block">
                Caption
              </Typography>
              <Typography variant="caption">2025-02-15 · 14:05</Typography>
            </div>
          </div>
        </div>
      </section>

      {/* Tags Section */}
      <section className="space-y-6">
        <div className="border-b pb-2">
          <Typography variant="h2">Tags</Typography>
        </div>
        <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-6">
          <Tag label="Product-First" variant="blue" />
          <Tag label="Story-Driven" variant="orange" />
          <Tag label="High-Impact" variant="pink" />
          <Tag label="Default Tag" variant="default" />
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-6">
        <div className="border-b pb-2">
          <Typography variant="h2">Text Buttons</Typography>
        </div>
        <div className="flex flex-wrap items-center gap-8 rounded-lg border bg-card p-6">
          <TextButton>Simple Button</TextButton>
          <TextButton endIcon="chevron-down">Show more</TextButton>
          <TextButton endIcon="chevron-up">Show less</TextButton>
          <TextButton disabled>Disabled</TextButton>
        </div>
      </section>

      {/* Media Section */}
      <section className="space-y-6">
        <div className="border-b pb-2">
          <Typography variant="h2">Media (Image & Video)</Typography>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Typography variant="h4">Image Component</Typography>
            <Image
              src={imageAsset.url || ""}
              alt={imageAsset.title}
              aspectRatio="16:9"
            />
          </div>
          <div className="space-y-2">
            <Typography variant="h4">Video Component</Typography>
            <Video
              src={videoAsset.url || ""}
              poster={videoAsset.thumbnailUrl}
              aspectRatio="16:9"
            />
          </div>
        </div>
      </section>

      {/* Molecules Section */}
      <section className="space-y-6">
        <div className="border-b pb-2">
          <Typography variant="h2">Molecules (Business Components)</Typography>
        </div>

        <div className="space-y-8">
          {/* Key Value Row */}
          <div className="space-y-4">
            <Typography variant="h4">Key Value Rows</Typography>
            <div className="grid grid-cols-3 gap-8 rounded-lg border bg-card p-6">
              <KeyValueRow
                label="Duration"
                value={<Typography variant="h3">15s</Typography>}
              />
              <KeyValueRow label="Aspect Ratio" value="16:9" />
              <KeyValueRow label="Resolution" value="1080p" />
            </div>
          </div>

          {/* Asset Cards */}
          <div className="space-y-4">
            <Typography variant="h4">Asset Cards</Typography>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AssetCard
                asset={imageAsset}
                showDetails={true}
                onAssetClick={(id) => alert(`Clicked asset: ${id}`)}
              />
              <AssetCard
                asset={videoAsset}
                showDetails={true}
                onAssetClick={(id) => alert(`Clicked asset: ${id}`)}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
