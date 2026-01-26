"use client";

import dynamic from "next/dynamic";

const VoiceChatDemo = dynamic(() => import("./voice-chat"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/10">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p>正在加载语音组件...</p>
      </div>
    </div>
  ),
});

export default function VoiceChatLoader() {
  return <VoiceChatDemo />;
}
