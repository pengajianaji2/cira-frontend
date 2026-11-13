"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  CountryCode,
} from "libphonenumber-js";
import { cn } from "@/lib/utils";

interface CountryPhoneInputProps {
  id: string;
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  ariaInvalid?: boolean;
}

const regions = new Intl.DisplayNames(["id"], { type: "region" });

// Daftar negara terurut abjad nama bahasa Indonesia
const countries = getCountries()
  .map((code) => ({
    code,
    calling: getCountryCallingCode(code),
    name: regions.of(code) || code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "id"));

/**
 * Input nomor telepon internasional dengan pemilih kode negara otomatis.
 * Sesuai panduan design system dengan border rounded-xl dan tinggi min-h-10.
 */
export function CountryPhoneInput({
  id,
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "812 3456 7890",
  ariaInvalid,
}: CountryPhoneInputProps) {
  const initialCountry = value?.startsWith("+")
    ? parsePhoneNumberFromString(value)?.country
    : undefined;

  const [country, setCountry] = useState<CountryCode>(initialCountry || "ID");
  const [raw, setRaw] = useState(
    value?.startsWith("+")
      ? parsePhoneNumberFromString(value)?.nationalNumber || value
      : value || ""
  );

  const lastEmitted = useRef<string | null>(null);
  const parsedInternational = raw.startsWith("+")
    ? parsePhoneNumberFromString(raw)
    : undefined;
  const mismatch = Boolean(
    parsedInternational?.country && parsedInternational.country !== country
  );

  useEffect(() => {
    if (value === lastEmitted.current) {
      lastEmitted.current = null;
      return;
    }
    if (!value) {
      setRaw("");
      return;
    }
    if (value.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(value);
      setRaw(parsed?.nationalNumber || value);
      if (parsed?.country) setCountry(parsed.country);
    } else {
      setRaw(value);
    }
  }, [value]);

  const update = (next: string, selected: CountryCode) => {
    setRaw(next);
    const global = next.startsWith("+") ? parsePhoneNumberFromString(next) : undefined;
    const phone = global || parsePhoneNumberFromString(next, selected);
    const normalized = phone?.isValid() ? phone.number : next;
    lastEmitted.current = normalized;
    onChange(normalized);
  };

  const handleCountryChange = (nextCountry: CountryCode) => {
    setCountry(nextCountry);
    update(raw, nextCountry);
  };

  return (
    <div className="space-y-1.5 w-full min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <select
          aria-label="Pilih negara dan kode telepon"
          value={country}
          disabled={disabled}
          onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
          className="h-10 w-[130px] shrink-0 rounded-xl border border-input bg-card px-2.5 text-base md:text-sm text-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 transition-colors"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              +{c.calling} {c.name}
            </option>
          ))}
        </select>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          aria-invalid={ariaInvalid}
          disabled={disabled}
          value={raw}
          placeholder={placeholder}
          onChange={(e) => update(e.target.value, country)}
          className={cn(
            "h-10 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-base md:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 transition-colors",
            className
          )}
        />
      </div>

      {mismatch && parsedInternational?.country && (
        <p className="text-xs text-amber-800 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 leading-relaxed">
          Nomor ini terdeteksi menggunakan kode negara +
          {getCountryCallingCode(parsedInternational.country)}.{" "}
          <button
            type="button"
            className="underline font-semibold hover:text-foreground inline"
            onClick={() => {
              setCountry(parsedInternational.country!);
              setRaw(parsedInternational.nationalNumber);
              lastEmitted.current = parsedInternational.number;
              onChange(parsedInternational.number);
            }}
          >
            Gunakan {regions.of(parsedInternational.country)} (+
            {getCountryCallingCode(parsedInternational.country)})
          </button>{" "}
          atau sesuaikan nomornya agar cocok dengan negara yang dipilih.
        </p>
      )}
    </div>
  );
}
