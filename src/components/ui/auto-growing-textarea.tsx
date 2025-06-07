import React, { useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const AutoGrowingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ 
  className, 
  value,
  ...props 
}, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);

  // This allows the parent to have a ref to the textarea element
  React.useImperativeHandle(ref, () => internalRef.current!, []);

  useEffect(() => {
    if (internalRef.current) {
      // Reset height to auto to get the correct scrollHeight
      internalRef.current.style.height = 'auto';
      // Set the height to match the content
      internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={internalRef}
      value={value}
      className={cn(
        "min-h-[40px] resize-none overflow-hidden",
        className
      )}
      rows={1}
      {...props}
    />
  );
});

AutoGrowingTextarea.displayName = 'AutoGrowingTextarea';

export default AutoGrowingTextarea;