import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Stories = () => {
  const {
    data: stories,
    isLoading,
    error,
  } = useQuery<
    {
      id: string;
      title: string;
      content: string;
      cover_url: string;
      emojis: string;
    }[]
  >({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading stories
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-5xl tracking-tighter font-semibold mb-8 text-center bg-gradient-to-br from-white to-yellow-100 bg-clip-text text-transparent">
        Generated Stories
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories?.map((story) => (
          <Card
            key={story.id}
            className="overflow-hidden hover:shadow-lg hover:shadow-yellow-900/15 transition-shadow hover:border-primary/20"
          >
            <div className="aspect-[3/2] relative group overflow-hidden">
              <img
                src={story.cover_url}
                alt={story.title}
                className="object-cover size-full group-hover:scale-110 cursor-pointer"
              />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {story.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-4 font-light tracking-tight text-muted-foreground">
                {story.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Stories;
