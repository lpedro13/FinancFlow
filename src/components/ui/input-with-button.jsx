import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const InputWithButton = React.forwardRef(({ className, type, onButtonClick, buttonText, ...props }, ref) => {
  return (
    <div className="flex gap-2">
      <Input
        type={type}
        className={className}
        ref={ref}
        {...props}
      />
      <Button 
        type="button"
        onClick={onButtonClick}
        variant="outline"
        className="shrink-0"
      >
        {buttonText}
      </Button>
    </div>
  );
});

InputWithButton.displayName = 'InputWithButton';

export { InputWithButton };