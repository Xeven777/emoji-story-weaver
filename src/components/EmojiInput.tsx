import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface EmojiInputProps {
  value: string;
  onChange: (value: string) => void;
}

const EmojiInput = ({ value, onChange }: EmojiInputProps) => {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow emoji characters
    const emojiRegex = /\p{Extended_Pictographic}/u;
    if (input === "" || emojiRegex.test(input)) {
      onChange(input.slice(-1)); // Only keep the last character
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleInput}
      className="emoji-input"
      placeholder="😊"
    />
  );
};

export default EmojiInput;