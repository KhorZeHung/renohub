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
  maxDecimalPlaces?: number;
  onValueChange?: (value: number) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ mode = "decimal", maxDecimalPlaces, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      let pattern: RegExp;
      if (mode === "decimal") {
        pattern = maxDecimalPlaces !== undefined
          ? new RegExp(`^\\d*\\.?\\d{0,${maxDecimalPlaces}}$`)
          : /^\d*\.?\d*$/;
      } else {
        pattern = /^\d*$/;
      }

      if (val !== "" && !pattern.test(val)) return;

      if (onChange) onChange(e);

      if (onValueChange) {
        if (val === "" || val.endsWith(".")) return;
        onValueChange(Number(val));
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
