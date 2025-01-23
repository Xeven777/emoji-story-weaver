import EmojiMartPicker from "@emoji-mart/react";
import data, { Emoji } from "@emoji-mart/data";
import { Button } from "./ui/button";
import { useState } from "react";
import { Cross, Delete } from "lucide-react";

interface EmojiPickerProps {
  selectedEmojis: string[];
  setSelectedEmojis: (emojis: string[]) => void;
  maxEmojis?: number;
}

const EmojiPicker = ({
  selectedEmojis,
  setSelectedEmojis,
  maxEmojis = 5,
}: EmojiPickerProps) => {
  interface EmojiSelectEvent {
    native: string;
  }

  const handleSelect = (emoji: EmojiSelectEvent) => {
    if (selectedEmojis.length < maxEmojis) {
      setSelectedEmojis([...selectedEmojis, emoji.native]);
    }
  };

  const handleRemoveEmoji = (index: number) => {
    setSelectedEmojis(selectedEmojis.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 min-h-14 border rounded-md relative">
        {selectedEmojis.map((emoji, index) => (
          <span
            key={index}
            className="cursor-pointer text-2xl"
            title="Click to remove"
          >
            {emoji}
          </span>
        ))}
        {selectedEmojis.length > 0 && (
          <Button
            variant="outline"
            className="absolute right-0"
            size="sm"
            onClick={() => handleRemoveEmoji(selectedEmojis.length - 1)}
          >
            <Delete size={20} color="red" />
          </Button>
        )}
      </div>
      <EmojiMartPicker data={data} onEmojiSelect={handleSelect} />
    </div>
  );
};

export default EmojiPicker;
