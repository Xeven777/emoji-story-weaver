import { Card } from "@/components/ui/card";

interface StoryCardProps {
  title: string;
  content: string;
  coverUrl: string;
  emojis: string;
  isPlaceholder?: boolean;
}

const StoryCard = ({
  title,
  content,
  coverUrl,
  emojis,
  isPlaceholder,
}: StoryCardProps) => {
  return (
    <Card className="story-card overflow-hidden">
      <div className="aspect-[5/4] relative">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {isPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-primary">
            <p className="text-lg font-medium">
              Your story cover will appear here
            </p>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="text-2xl mb-2">{emojis}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-start whitespace-break-spaces">
          {content}
        </p>
      </div>
    </Card>
  );
};

export default StoryCard;
