import { Input } from "@/components/ui/input";

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
    <Input
      type="text"
      value={value}
      onChange={handleInput}
      className="w-16 h-16 text-2xl text-center"
      placeholder="😊"
    />
  );
};

export default EmojiInput;