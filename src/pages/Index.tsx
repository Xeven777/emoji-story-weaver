import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import StoryCard from "@/components/StoryCard";
import { supabase } from "@/integrations/supabase/client";
import EmojiPicker from "@/components/EmojiPicker";
import { Loader2 } from "lucide-react";

// Constants
const MAX_EMOJIS = 5;
const MIN_EMOJIS_FOR_GENERATION = 2;

async function generateStory(emojis) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `write a nice story. (max 350 words) based on these emojis: ${emojis.join(
                " "
              )}.Please choose a genre, such as science fiction, fantasy, or adventure, and craft a tale that incorporates all of the emojis in a creative and meaningful way. Be creative and try different genres and names from different cultures. Return only the perfect JSON object without any backticks or formatting.`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.5,
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
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    const candidates = responseData?.candidates;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      throw new Error("No valid candidates received from the API.");
    }

    const content = candidates[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Invalid content structure in API response.");
    }

    // Attempt to parse JSON from the returned text
    try {
      return JSON.parse(content);
    } catch (jsonError) {
      throw new Error(
        `Failed to parse JSON from content: ${jsonError.message}. Content: ${content}`
      );
    }
  } catch (error) {
    console.error("Error generating story:", error.message);
    throw error;
  }
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

  const { error } = await supabase.from("stories").insert({
    title: story.title,
    content: story.content,
    emojis: story.emojis,
    cover_url: publicUrl ?? uploadData?.path ?? "",
  });

  if (error) throw error;

  return publicUrl;
}

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
      const storyJson = await generateStory(selectedEmojis);
      const coverUrl = await generateCoverImage(
        storyJson.title ?? "Untitled Story"
      );

      const storyData = {
        title: storyJson.title,
        content: storyJson.content,
        coverUrl,
        emojis: selectedEmojis.join(""),
      };

      await uploadStoryToSupabase(storyData);
      setGeneratedStory(storyData);
      toast.success("Story generated successfully!");
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
            </h1>
            <p className="text-lg md:text-xl px-6 text-muted-foreground mb-12">
              Transform your favorite emojis into magical stories with
              AI-powered storytelling
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
