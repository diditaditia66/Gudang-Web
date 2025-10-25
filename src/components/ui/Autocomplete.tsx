"use client";
import Input from "./Input";
import React from "react";

export default function Autocomplete({
  value, onChange, suggestions, onPick, placeholder
}: {
  value: string; onChange: (v: string) => void;
  suggestions: string[]; onPick: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} />
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow">
          {suggestions.map((s,i)=>(
            <button
              key={i}
              type="button"
              className="block w-full text-left px-3 py-2 hover:bg-gray-50"
              onClick={()=>onPick(s)}
            >{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
