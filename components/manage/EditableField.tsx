"use client";
import { useEffect, useState } from "react";
import { Check, Pen, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  editing: boolean;
  onEdit: () => void;
  onSave: (value: string) => Promise<void> | void;
  onCancel: () => void;
  className?: string;
}

export default function EditableField({
  label,
  value,
  placeholder,
  type = "text",
  disabled,
  editing,
  onEdit,
  onSave,
  onCancel,
  className,
}: EditableFieldProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setDraft(value);
  }, [editing, value]);

  const handleSave = async () => {
    if (draft === value) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 min-w-0", className)}>
      <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-ink-500">
        {label}
      </span>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            className="bg-white"
            disabled={saving}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onCancel();
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={saving}
            aria-label="Cancel"
          >
            <X className="size-4" />
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Check className="size-4" /> Save
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 min-h-[44px]">
          <span className="text-[15px] text-foreground truncate">
            {value || <span className="text-muted-foreground">Not set</span>}
          </span>
          {!disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-forest-700 shrink-0"
            >
              <Pen className="size-4" /> Edit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
