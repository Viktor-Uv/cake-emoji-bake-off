
import React, { useState } from "react";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange }) => {
  const handleSelectEmoji = (emoji: string) => {
    onChange(emoji);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="text-2xl h-12 w-12 flex items-center justify-center"
        >
          {value || "🍰"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-5 gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant="ghost"
              size="sm"
              className={`text-xl p-2 h-10 w-10 flex items-center justify-center ${
                emoji === value ? "bg-accent" : ""
              }`}
              onClick={() => handleSelectEmoji(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
