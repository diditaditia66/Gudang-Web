"use client";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Input from "./Input";
import clsx from "clsx";

export default function Autocomplete({
  value,
  onChange,
  suggestions,
  onPick,
  placeholder,
  noResultsText = "Tidak ada hasil",
  maxItems = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  onPick: (v: string) => void;
  placeholder?: string;
  noResultsText?: string;
  maxItems?: number;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number>(-1);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => suggestions.slice(0, maxItems), [suggestions, maxItems]);

  useEffect(() => {
    setOpen(items.length > 0);
    setActive(-1);
  }, [items]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((p) => (p + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => (p - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && active < items.length) {
        onPick(items[active]);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">{noResultsText}</div>
          ) : (
            items.map((s, i) => (
              <button
                key={`${s}-${i}`}
                type="button"
                role="option"
                aria-selected={i === active}
                className={clsx(
                  "block w-full px-3 py-2 text-left text-sm",
                  i === active ? "bg-gray-100" : "hover:bg-gray-50"
                )}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                onClick={() => {
                  onPick(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
