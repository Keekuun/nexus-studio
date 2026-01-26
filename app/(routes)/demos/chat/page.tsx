import VoiceChatLoader from "./components/voice-chat-loader";

export const metadata = {
  title: "实时语音对话 Demo | Nexus Studio",
  description: "基于 Web Speech API 和 Next.js 的实时语音对话演示",
};

export default function ChatDemoPage() {
  return <VoiceChatLoader />;
}
