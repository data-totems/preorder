"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SlugInput from "./SlugInput";
import { updateStoreSlug } from "@/actions/slug.actions";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import type { BusinessSlugAlias } from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  currentSlug: string;
  aliases: BusinessSlugAlias[];
  onUpdated: () => void;
}

/**
 * EditSlugModal — merchant-only "edit my store link" UI.
 *
 * Re-uses `<SlugInput>` (debounced availability + suggestions) with
 * `excludeCurrent` so the merchant keeps their own slug as "available".
 * Inline field error only for 400 responses keyed on `slug`; everything
 * else surfaces as a toast via the shared `errorMessage` helper.
 *
 * The `slug` state resets to `currentSlug` whenever the modal re-opens,
 * so reopening after a cancel doesn't preserve a half-typed slug from a
 * prior session.
 */
export default function EditSlugModal({
  open,
  onClose,
  currentSlug,
  aliases,
  onUpdated,
}: Props) {
  const [slug, setSlug] = useState(currentSlug);
  const [available, setAvailable] = useState<boolean | null>(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Reset form when the modal opens or the underlying slug changes (after
  // a successful update the parent refetches and passes the new slug in).
  useEffect(() => {
    if (open) {
      setSlug(currentSlug);
      setAvailable(true);
      setFieldError(null);
    }
  }, [open, currentSlug]);

  const submit = async () => {
    setSubmitting(true);
    setFieldError(null);
    try {
      await updateStoreSlug(slug);
      toast.success("Store link updated");
      onUpdated();
      onClose();
    } catch (e: unknown) {
      const data = (e as { response?: { data?: Record<string, unknown> } })
        ?.response?.data;
      const slugErr = data?.slug;
      if (Array.isArray(slugErr) && typeof slugErr[0] === "string") {
        setFieldError(slugErr[0]);
      } else {
        toast.error(errorMessage(e, "Could not update store link."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const disabled =
    submitting || available !== true || slug.trim() === currentSlug;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your store link</DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <p className="text-sm text-gray-500">Your current link:</p>
          <code className="text-sm">buzzmart.app/store/{currentSlug}</code>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-1">New link:</p>
          <SlugInput
            value={slug}
            onChange={setSlug}
            excludeCurrent={currentSlug}
            onAvailability={setAvailable}
          />
          {fieldError && (
            <p className="text-xs text-red-600 mt-1">{fieldError}</p>
          )}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
          <strong>Old links keep working.</strong> Customers who tap your old
          link will be redirected to your new one. You can change this any time.
        </div>

        {aliases.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            <p>Previously used slugs (still redirect):</p>
            <ul className="list-disc list-inside">
              {aliases.map((a) => (
                <li key={a.slug}>
                  {a.slug}
                  {a.retired_at &&
                    ` (retired ${new Date(a.retired_at).toLocaleDateString()})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={disabled}
            className="bg-[#27BA5F] hover:bg-[#1FA34E]"
          >
            {submitting ? "Updating…" : "Update store link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
