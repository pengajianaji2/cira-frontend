"use client";
import { InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value"|"onChange"> & { value?: number | string | null; onChange: (canonicalDigits: string) => void };
const digitsOnly=(value:unknown)=>String(value??"").replace(/\D/g,"");
const format=(value:string)=>value.replace(/\B(?=(\d{3})+(?!\d))/g,".");
export function MoneyInput({ value, onChange, ...props }: Props) {
  const [display,setDisplay]=useState(format(digitsOnly(value)));
  useEffect(()=>setDisplay(format(digitsOnly(value))),[value]);
  const change=(event:React.ChangeEvent<HTMLInputElement>)=>{
    const input=event.currentTarget;const before=input.value.slice(0,input.selectionStart??input.value.length);const digitCount=digitsOnly(before).length;const canonical=digitsOnly(input.value);const formatted=format(canonical);setDisplay(formatted);onChange(canonical);
    requestAnimationFrame(()=>{let index=0,count=0;while(index<formatted.length&&count<digitCount){if(/\d/.test(formatted[index]))count++;index++;}input.setSelectionRange(index,index);});
  };
  return <Input {...props} type="text" inputMode="numeric" value={display} onChange={change} />;
}
