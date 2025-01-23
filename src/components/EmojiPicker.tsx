import EmojiMartPicker from "@emoji-mart/react";
import data, { Emoji } from "@emoji-mart/data";
import { Button } from "./ui/button";
import { useState } from "react";

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

  const handleClear = () => {
    setSelectedEmojis([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-2 min-h-[50px] border rounded-md">
        {selectedEmojis.map((emoji, index) => (
          <span
            key={index}
            className="cursor-pointer text-2xl"
            onClick={() => handleRemoveEmoji(index)}
            title="Click to remove"
          >
            {emoji}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <EmojiMartPicker data={data} onEmojiSelect={handleSelect} />
        {selectedEmojis.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;
