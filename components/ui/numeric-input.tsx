"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type NumericInputMode = "decimal" | "integer";

interface NumericInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "type" | "inputMode" | "onChange"
  > {
  mode?: NumericInputMode;
  onValueChange?: (value: number) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ mode = "decimal", onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      const pattern =
        mode === "decimal" ? /^\d*\.?\d*$/ : /^\d*$/;

      if (val !== "" && !pattern.test(val)) {
        return;
      }

      if (onChange) {
        onChange(e);
      }

      if (onValueChange) {
        if (val === "" || val === ".") {
          onValueChange(0);
        } else {
          onValueChange(Number(val));
        }
      }
    };

    return (
      <Input
        type="text"
        inputMode={mode === "decimal" ? "decimal" : "numeric"}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
NumericInput.displayName = "NumericInput";

export { NumericInput };
export type { NumericInputProps };
