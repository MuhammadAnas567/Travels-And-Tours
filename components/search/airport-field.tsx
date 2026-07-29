"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AirportSuggestion = {
  code: string;
  name: string;
  city: string;
  country: string;
  type: string;
  label: string;
  countryName: string;
};

type AirportFieldProps = {
  id: string;
  label: string;
  /** IATA code or free-text being typed. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  prefixIcon?: ReactNode;
  className?: string;
  inputClassName?: string;
  inputRef?: Ref<HTMLInputElement>;
};

export function AirportField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = "City or airport",
  prefixIcon,
  className,
  inputClassName,
  inputRef,
}: AirportFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const [results, setResults] = useState<AirportSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const lastPickedCode = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // External updates (swap, recent chips, URL params).
  useEffect(() => {
    if (lastPickedCode.current && value === lastPickedCode.current) return;
    lastPickedCode.current = null;
    setText(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const searchQ =
      lastPickedCode.current && text.includes(`(${lastPickedCode.current})`)
        ? ""
        : text.trim();

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/airports/search?q=${encodeURIComponent(searchQ)}&limit=12`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error("Airport search failed");
        const data = (await res.json()) as { results: AirportSuggestion[] };
        setResults(data.results ?? []);
        setActiveIndex(data.results?.length ? 0 : -1);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [text, open]);

  useEffect(() => {
    function onDocPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  function pick(airport: AirportSuggestion) {
    lastPickedCode.current = airport.code;
    setText(airport.label);
    onChange(airport.code);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      pick(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        label={label}
        placeholder={placeholder}
        value={text}
        error={error}
        prefixIcon={prefixIcon}
        className={inputClassName}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          const next = e.target.value;
          lastPickedCode.current = null;
          setText(next);
          setOpen(true);
          const paren = next.match(/\(([A-Za-z]{3})\)\s*$/);
          if (paren) onChange(paren[1].toUpperCase());
          else onChange(next);
        }}
        onKeyDown={onKeyDown}
      />

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-[120] mt-1 max-h-72 w-full overflow-auto rounded-md border border-line bg-paper py-1 shadow-md"
        >
          {loading && results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-ink-500">Searching airports…</li>
          ) : null}
          {!loading && results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-ink-500">
              No commercial airports match. Try a city or IATA code.
            </li>
          ) : null}
          {results.map((airport, index) => (
            <li key={airport.code} role="presentation">
              <button
                id={`${listId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex w-full min-h-11 items-start gap-3 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2",
                  index === activeIndex ? "bg-pine-50" : "hover:bg-sand"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(airport)}
              >
                <span className="mt-0.5 w-10 shrink-0 font-semibold tabular-nums text-pine-700">
                  {airport.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {airport.city || airport.name}
                  </span>
                  <span className="block truncate text-xs text-ink-500">
                    {airport.name}
                    {airport.countryName ? ` · ${airport.countryName}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
