"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, Loader2, X } from "lucide-react";
import { checkSlugAvailability } from "@/actions/slug.actions";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  onAvailability?: (available: boolean | null, reason: string | null) => void;
  excludeCurrent?: string;
}

type State =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable"; reason: string; suggestions?: string[] };

export default function SlugInput({
  value,
  onChange,
  onAvailability,
  excludeCurrent,
}: SlugInputProps) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const statusId = `${inputId}-status`;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const v = value.trim();
    if (!v) {
      setState({ kind: "idle" });
      onAvailability?.(null, null);
      return;
    }
    if (excludeCurrent && v === excludeCurrent) {
      setState({ kind: "available" });
      onAvailability?.(true, null);
      return;
    }
    setState({ kind: "checking" });

    let cancelled = false;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkSlugAvailability(v);
        if (cancelled) return;
        if (res.available) {
          setState({ kind: "available" });
          onAvailability?.(true, null);
        } else {
          setState({
            kind: "unavailable",
            reason: res.reason ?? "format",
            suggestions: res.suggestions,
          });
          onAvailability?.(false, res.reason ?? "format");
        }
      } catch {
        if (cancelled) return;
        setState({ kind: "idle" });
        onAvailability?.(null, "network");
      }
    }, 300);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, excludeCurrent, onAvailability]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="text-sm text-[#03140A80] whitespace-nowrap"
        >
          buzzmart.app/store/
        </label>
        <Input
          id={inputId}
          aria-describedby={`${helpId} ${statusId}`}
          aria-invalid={state.kind === "unavailable" || undefined}
          className="bg-[#F0F0F0] rounded-[12px] max-w-xs"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="your-store-slug"
          maxLength={40}
        />
        <span
          id={statusId}
          role="status"
          aria-live="polite"
          className="contents"
        >
          <Indicator state={state} />
        </span>
      </div>
      <p id={helpId} className="text-xs text-[#03140A80]">
        3–40 characters · lowercase, numbers, hyphens
      </p>
      {state.kind === "unavailable" &&
        state.reason === "taken" &&
        state.suggestions &&
        state.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {state.suggestions.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                className="text-xs px-2 py-1 bg-[#27BA5F1F] text-[#27BA5F] rounded-md hover:bg-[#27BA5F33]"
              >
                {s}
              </button>
            ))}
          </div>
        )}
    </div>
  );
}

function Indicator({ state }: { state: State }) {
  if (state.kind === "idle") return <span className="text-xs text-gray-400">…</span>;
  if (state.kind === "checking")
    return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
  if (state.kind === "available")
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <Check className="w-4 h-4" /> Available
      </span>
    );
  const reasonMap: Record<string, string> = {
    taken: "Already taken",
    reserved: "Reserved word",
    format: "Use 3–40 lowercase letters, numbers, hyphens",
  };
  const reasonText = reasonMap[state.reason] ?? state.reason;
  return (
    <span className="flex items-center gap-1 text-xs text-red-600">
      <X className="w-4 h-4" /> {reasonText}
    </span>
  );
}
