import { supabase } from "@/integrations/supabase/client";

async function generateStory(
  emojis: string[]
): Promise<{ title: string; content: string }> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `write a nice story. (nearly 350 words) based on these emojis: ${emojis.join(
                " "
              )}.Make it meaningful with a moral and twist in the end. Please choose a genre, such as science fiction, fantasy, or adventure, and craft a tale that incorporates all of the emojis in a creative and meaningful way. Be creative and try different genres and names from different cultures. Return only the perfect JSON object without any backticks or formatting.`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.4,
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

async function generateCoverImage(
  title: string,
  line: string
): Promise<string> {
  const response = await fetch(
    `https://ai-image-api.xeven.workers.dev/img?model=flux-schnell&prompt=${encodeURIComponent(
      "book cover art for story titled: " + title + " that starts with :" + line
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
      { contentType: "image/png", cacheControl: "90000", upsert: true }
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

export { generateStory, generateCoverImage, uploadStoryToSupabase };
