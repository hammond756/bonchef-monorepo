import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const AutoGrowingTextarea = React.forwardRef<
HTMLTextAreaElement,
React.ComponentProps<"textarea">
>(({ 
  className, 
  placeholder = "Type something...",
  ...props 
}, ref) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to match the content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        "min-h-[40px] resize-none overflow-hidden",
        className
      )}
      rows={1}
      {...props}
    />
  );
});

export default AutoGrowingTextarea;