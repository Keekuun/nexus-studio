import { Button } from "@/components/ui/button";

export default function Home(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center space-y-8">
        <h1 className="text-6xl font-bold mb-4">
          Nexus Studio
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          多模态创作平台 - 集成文本、音视频和AI技术
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">开始创作</Button>
          <Button size="lg" variant="outline">了解更多</Button>
        </div>
      </div>
    </div>
  );
}

