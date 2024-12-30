import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import EmojiInput from "@/components/EmojiInput";
import StoryCard from "@/components/StoryCard";

const Index = () => {
  const [emojis, setEmojis] = useState<string[]>(Array(5).fill(""));
  const [isGenerating, setIsGenerating] = useState(false);

  const handleEmojiChange = (index: number, value: string) => {
    const newEmojis = [...emojis];
    newEmojis[index] = value;
    setEmojis(newEmojis);
  };

  const handleGenerate = async () => {
    const filledEmojis = emojis.filter(emoji => emoji.trim() !== "");
    if (filledEmojis.length < 2) {
      toast.error("Please add at least 2 emojis to generate a story!");
      return;
    }

    setIsGenerating(true);
    // TODO: Implement story generation after Supabase connection
    toast.info("Coming soon! Connect to Supabase to enable story generation.");
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            Emoji Story Generator
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12">
            Transform your favorite emojis into magical stories with AI-powered storytelling
          </p>

          <Card className="p-6 story-card mb-8">
            <h2 className="text-xl mb-4">Choose up to 5 emojis</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {emojis.map((emoji, index) => (
                <EmojiInput
                  key={index}
                  value={emoji}
                  onChange={(value) => handleEmojiChange(index, value)}
                />
              ))}
            </div>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full md:w-auto"
            >
              {isGenerating ? "Generating..." : "Generate Story"}
            </Button>
          </Card>

          <div className="grid gap-6">
            <StoryCard
              title="Example Story"
              content="This is where your generated story will appear. Add some emojis and click generate to create your own magical tale!"
              coverUrl="/placeholder.svg"
              emojis="🌟 🌙 ✨"
              isPlaceholder
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;