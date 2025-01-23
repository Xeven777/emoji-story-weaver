import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import EmojiInput from "@/components/EmojiInput";
import StoryCard from "@/components/StoryCard";
import { supabase } from "@/integrations/supabase/client";

// Constants
const MAX_EMOJIS = 5;
const MIN_EMOJIS_FOR_GENERATION = 2;

// Utility Functions
function escapeEmoji(str: string): string {
  return Array.from(str)
    .map((char) => {
      const code = char.codePointAt(0);
      return code && code > 0xffff ? `\\u{${code.toString(16)}}` : char;
    })
    .join("");
}

async function generateStory(
  emojis: string[]
): Promise<{ title: string; content: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${
      import.meta.env.VITE_GEMINI_KEY
    }`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Write a whimsical story (max 350 words) based on these emojis: ${emojis.join(
                  " "
                )}. Be creative and try different genres. Return only the perfect JSON object without any backticks or formatting.`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.8,
          response_mime_type: "application/json",
          response_schema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Story title" },
              content: { type: "STRING", description: "Story content" },
            },
            required: ["title", "content"],
          },
        },
      }),
    }
  );

  if (!response.ok) throw new Error("Failed to generate story");

  const responseData = await response.json();
  const rawText = responseData.candidates[0].content.parts[0].text;

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON found");

  return JSON.parse(jsonMatch[0].replace(/\\"/g, '"').replace(/\n/g, " "));
}

async function generateCoverImage(title: string): Promise<string> {
  const response = await fetch(
    `https://ai-image-api.xeven.workers.dev/img?model=flux-schnell&prompt=${encodeURIComponent(
      "Make a book cover art for story titled: " + title
    )}`
  );

  if (!response.ok) throw new Error("Failed to generate image");

  const imgBlob = await response.blob();
  return URL.createObjectURL(imgBlob);
}

async function uploadStoryToSupabase(story: {
  title: string;
  content: string;
  emojis: string;
  coverUrl: string;
}): Promise<string> {
  const safeFileName = (story.title ?? Date.now().toString())
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  const { data: uploadData, error: picUploadError } = await supabase.storage
    .from("emoji-story")
    .upload(
      `public/${safeFileName}.png`,
      await (await fetch(story.coverUrl)).blob(),
      { contentType: "image/png", cacheControl: "30000", upsert: true }
    );

  if (picUploadError) throw picUploadError;

  const publicUrl = supabase.storage
    .from("emoji-story")
    .getPublicUrl(uploadData?.path).data.publicUrl;

  const { error, data } = await supabase.from("stories").insert({
    title: story.title,
    content: story.content,
    emojis: escapeEmoji(story.emojis),
    cover_url: publicUrl ?? uploadData?.path ?? "",
  });

  if (error) throw error;

  return publicUrl;
}

const EmojiStoryGenerator = () => {
  const [emojis, setEmojis] = useState<string[]>(Array(MAX_EMOJIS).fill(""));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    content: string;
    coverUrl: string;
    emojis: string;
  } | null>(null);

  const handleEmojiChange = useCallback((index: number, value: string) => {
    setEmojis((prev) => {
      const newEmojis = [...prev];
      newEmojis[index] = value;
      return newEmojis;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    const filledEmojis = emojis.filter((emoji) => emoji.trim() !== "");

    if (filledEmojis.length < MIN_EMOJIS_FOR_GENERATION) {
      toast.error(
        `Please add at least ${MIN_EMOJIS_FOR_GENERATION} emojis to generate a story!`
      );
      return;
    }

    setIsGenerating(true);

    try {
      const storyJson = await generateStory(filledEmojis);
      const coverUrl = await generateCoverImage(
        storyJson.title ?? "Untitled Story"
      );

      const storyData = {
        title: storyJson.title,
        content: storyJson.content,
        coverUrl,
        emojis: filledEmojis.join(""),
      };

      // Generate and save story
      await uploadStoryToSupabase(storyData);

      setGeneratedStory(storyData);
      toast.success("Story generated successfully!");
    } catch (error) {
      console.error("Story Generation Error:", error);
      toast.error("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [emojis]);

  const emojiInputs = useMemo(
    () =>
      emojis.map((emoji, index) => (
        <EmojiInput
          key={index}
          value={emoji}
          onChange={(value) => handleEmojiChange(index, value)}
        />
      )),
    [emojis, handleEmojiChange]
  );

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto text-center w-full gap-10 grid md:grid-cols-2">
          <div>
            <h1 className="text-4xl mt-10 md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Emoji Story Generator
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12">
              Transform your favorite emojis into magical stories with
              AI-powered storytelling
            </p>
            <Card className="p-6 story-card mb-8">
              <h2 className="text-xl mb-4">Choose up to {MAX_EMOJIS} emojis</h2>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {emojiInputs}
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
          </div>

          <div className="grid gap-6">
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
