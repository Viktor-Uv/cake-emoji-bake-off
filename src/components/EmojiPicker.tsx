
import React, { useState } from "react";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectEmoji = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="text-2xl h-12 w-12"
      >
        {value || "🍰"}
      </Button>
      
      {isOpen && (
        <div className="absolute mt-2 p-2 bg-white rounded-lg shadow-lg z-50 border">
          <div className="grid grid-cols-5 gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className={`text-xl p-2 rounded hover:bg-gray-100 ${
                  emoji === value ? "bg-gray-200" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
