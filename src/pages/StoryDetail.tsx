import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const StoryDetail = () => {
  const { id } = useParams();
  const [isReading, setIsReading] = useState(false);
  const [speechInstance, setSpeechInstance] =
    useState<SpeechSynthesisUtterance | null>(null);

  const { data: story, isLoading } = useQuery<{
    content: string;
    cover_url: string;
    created_at: string;
    emojis: string;
    id: string;
    title: string;
  }>({
    queryKey: ["story", id],
    gcTime: 1000 * 600,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleTextToSpeech = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      `${story?.title}. ${story?.content}`
    );
    utterance.rate = 0.9;
    utterance.onend = () => {
      setIsReading(false);
      setSpeechInstance(null);
    };

    setSpeechInstance(utterance);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin size-10 ease-in-out" />
      </div>
    );
  }

  if (!story) return <div>Story not found</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        <div className="aspect-square relative rounded-lg overflow-hidden">
          <img
            src={story.cover_url}
            alt={story.title}
            className="object-cover w-full h-full"
          />
          <div className="bottom-0 right-0 absolute z-20 text-2xl md:text-4xl bg-white/10 backdrop-blur-xl p-2 md:p-4 rounded-2xl">
            {story.emojis}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-6xl font-bold">{story.title}</h1>
          <Button
            variant="outline"
            size="lg"
            onClick={handleTextToSpeech}
            className="w-full md:w-auto"
          >
            {isReading ? (
              <>
                <VolumeX className="mr-2" /> Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="mr-2" /> Read Aloud
              </>
            )}
          </Button>

          <p className="px-1 md:text-lg leading-relaxed whitespace-pre-wrap opacity-90">
            {story.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
