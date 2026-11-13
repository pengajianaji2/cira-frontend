"use client";

import React, { InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface MoneyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number | string | null;
  onChange: (canonicalDigits: string) => void;
}

const digitsOnly = (value: unknown): string => String(value ?? "").replace(/\D/g, "");

const formatWithThousandSeparators = (value: string): string =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Komponen input uang Rupiah dengan pemisah ribuan otomatis (titik)
 * dan emisi nilai angka mentah (canonical digits) tanpa formatting.
 */
export function MoneyInput({ value, onChange, ...props }: MoneyInputProps) {
  const [display, setDisplay] = useState(formatWithThousandSeparators(digitsOnly(value)));

  useEffect(() => {
    setDisplay(formatWithThousandSeparators(digitsOnly(value)));
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const cursorPosition = input.selectionStart ?? input.value.length;
    const beforeCursor = input.value.slice(0, cursorPosition);
    const digitCountBefore = digitsOnly(beforeCursor).length;

    const canonical = digitsOnly(input.value);
    const formatted = formatWithThousandSeparators(canonical);

    setDisplay(formatted);
    onChange(canonical);

    // Kembalikan posisi kursor agar pengguna dapat mengetik dengan natural
    requestAnimationFrame(() => {
      let index = 0;
      let count = 0;
      while (index < formatted.length && count < digitCountBefore) {
        if (/\d/.test(formatted[index])) {
          count++;
        }
        index++;
      }
      input.setSelectionRange(index, index);
    });
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
    />
  );
}
