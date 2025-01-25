import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import StoryCard from "@/components/StoryCard";
import EmojiPicker from "@/components/EmojiPicker";
import { Loader2 } from "lucide-react";
import {
  generateCoverImage,
  generateStory,
  uploadStoryToSupabase,
} from "@/lib/functions";
import { set } from "date-fns";

const MAX_EMOJIS = 5;
const MIN_EMOJIS_FOR_GENERATION = 2;

const EmojiStoryGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    content: string;
    coverUrl: string;
    emojis: string;
  } | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);

  const handleGenerate = useCallback(async () => {
    if (selectedEmojis.length < MIN_EMOJIS_FOR_GENERATION) {
      toast.error(
        `Please add at least ${MIN_EMOJIS_FOR_GENERATION} emojis to generate a story!`
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Generate story
      const storyJson = await generateStory(selectedEmojis);
      setGeneratedStory({
        title: storyJson.title,
        content: storyJson.content,
        coverUrl: "/placeholder.svg",
        emojis: selectedEmojis.join(""),
      });
      toast.success("Story generated successfully!");

      // Generate cover image
      const coverUrl = await generateCoverImage(
        storyJson.title ?? "Untitled Story"
      );
      const storyData = {
        ...storyJson,
        coverUrl,
        emojis: selectedEmojis.join(""),
      };
      setGeneratedStory(storyData);
      toast.success("Cover image generated successfully!");

      // Upload story to Supabase
      const picUrl = await uploadStoryToSupabase(storyData);
      toast.success("Story uploaded successfully!");

      // Update cover image URL
      setGeneratedStory((prev) => ({ ...prev, coverUrl: picUrl }));
    } catch (error) {
      console.error("Story Generation Error:", error);
      toast.error("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedEmojis]);

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto text-center w-full gap-10 grid md:grid-cols-2">
          <div>
            <h1 className="text-4xl mt-10 md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70">
              Emoji Story Generator
              <span className="text-white">📖✨</span>
            </h1>
            <p className="text-lg md:text-xl px-6 text-muted-foreground mb-12">
              Transform your favorite emojis into magical stories with
              AI-powered storytelling 🧙‍♂️🔮
            </p>
            <Card className="p-6 relative bg-gradient-to-b from-card via-primary/10 mb-8 overflow-hidden">
              <div className="absolute top-0 h-px w-full bg-gradient-to-r via-primary"></div>
              <h2 className="text-xl mb-4 opacity-90 mt-4">
                Choose up to {MAX_EMOJIS} emojis
              </h2>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <EmojiPicker
                  selectedEmojis={selectedEmojis}
                  setSelectedEmojis={setSelectedEmojis}
                  maxEmojis={MAX_EMOJIS}
                />
              </div>
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full md:w-auto"
              >
                {isGenerating ? "Generating..." : "Generate Story"}
                {isGenerating && (
                  <Loader2 className="animate-spin ml-2" size={20} />
                )}
              </Button>
            </Card>
          </div>

          <div className={isGenerating ? "animate-pulse" : ""}>
            {generatedStory ? (
              <StoryCard {...generatedStory} />
            ) : (
              <StoryCard
                title="Example Story"
                content="This is where your generated story will appear. Add some emojis and click generate to create your own magical tale!"
                coverUrl="/placeholder.svg"
                emojis="🌟 🌙 ✨"
                isPlaceholder
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiStoryGenerator;
