"use client";
import { useEffect, useRef, useState } from "react";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

type Props = { id: string; value?: string | null; onChange: (value: string) => void; disabled?: boolean; className?: string; placeholder?: string; ariaInvalid?: boolean };
const regions = new Intl.DisplayNames(["id"], { type: "region" });
const countries = getCountries().map((code) => ({ code, calling: getCountryCallingCode(code), name: regions.of(code) || code })).sort((a,b)=>a.name.localeCompare(b.name,"id"));
export function CountryPhoneInput({ id, value, onChange, disabled, className, placeholder="812 3456 7890", ariaInvalid }: Props) {
  const initial = value?.startsWith("+") ? parsePhoneNumberFromString(value)?.country : undefined;
  const [country, setCountry] = useState<CountryCode>(initial || "ID");
  const [raw, setRaw] = useState(value?.startsWith("+") ? (parsePhoneNumberFromString(value)?.nationalNumber || value) : value || "");
  const lastEmitted = useRef<string | null>(null);
  const parsedInternational = raw.startsWith("+") ? parsePhoneNumberFromString(raw) : undefined;
  const mismatch = Boolean(parsedInternational?.country && parsedInternational.country !== country);
  useEffect(() => {
    if (value === lastEmitted.current) { lastEmitted.current = null; return; }
    if (!value) { setRaw(""); return; }
    if (value.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(value);
      setRaw(parsed?.nationalNumber || value);
      if (parsed?.country) setCountry(parsed.country);
    } else setRaw(value);
  }, [value]);
  const update = (next: string, selected: CountryCode) => {
    setRaw(next);
    const global = next.startsWith("+") ? parsePhoneNumberFromString(next) : undefined;
    const phone = global || parsePhoneNumberFromString(next, selected);
    const normalized = phone?.isValid() ? phone.number : next;
    lastEmitted.current = normalized;
    onChange(normalized);
  };
  return <div className="space-y-1">
    <div className="flex gap-2">
      <select aria-label="Pilih negara dan kode telepon" value={country} disabled={disabled} onChange={(e)=>{const next=e.target.value as CountryCode;setCountry(next);update(raw,next);}} className="h-10 max-w-[45%] rounded-md border border-input bg-background px-2 text-sm">
        {countries.map(c=><option key={c.code} value={c.code}>+{c.calling} {c.name}</option>)}
      </select>
      <input id={id} type="tel" inputMode="tel" autoComplete="tel-national" aria-invalid={ariaInvalid} disabled={disabled} value={raw} placeholder={placeholder} onChange={(e)=>update(e.target.value,country)} className={className || "h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm"} />
    </div>
    {mismatch && parsedInternational?.country && <p className="text-xs text-amber-700">Nomor ini memakai kode negara +{getCountryCallingCode(parsedInternational.country)}. <button type="button" className="underline font-medium" onClick={()=>{setCountry(parsedInternational.country!);setRaw(parsedInternational.nationalNumber);lastEmitted.current=parsedInternational.number;onChange(parsedInternational.number);}}>Gunakan {regions.of(parsedInternational.country)} (+{getCountryCallingCode(parsedInternational.country)})</button> atau ubah nomornya agar cocok dengan negara terpilih.</p>}
  </div>;
}
