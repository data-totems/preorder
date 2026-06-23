"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { importProducts } from "@/actions/products.actions";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}

type ImportError = { row: number; reason: string };
type ImportResult = { created: number; skipped: number; errors: ImportError[] };

const ImportProductsDialog: React.FC<ImportProductsDialogProps> = ({
  open,
  onOpenChange,
  onImported,
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setResult(null);
      setSubmitting(false);
    }
  }, [open]);

  const submit = async () => {
    if (!file) return;
    setSubmitting(true);
    try {
      const res = await importProducts(file);
      const data = res.data as ImportResult;
      setResult(data);
      if (data.created > 0) {
        toast.success(
          `Imported ${data.created} product${data.created === 1 ? "" : "s"}${
            data.skipped ? ` · ${data.skipped} skipped` : ""
          }`,
        );
        onImported?.();
      } else {
        toast.error("No products were imported. Check the row errors below.");
      }
    } catch (e) {
      toast.error(errorMessage(e, "Import failed. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns <code>name</code>, <code>price</code>,{" "}
            <code>description</code>, and (optional) <code>in_stock</code>. Add images
            to each product after import.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
            }}
            disabled={submitting}
          />
          <p className="mt-2 text-[12px] text-muted-foreground">
            Tip: Export your current products first to see the exact column format.
          </p>
        </div>

        {result && result.errors.length > 0 && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 max-h-40 overflow-y-auto">
            <div className="text-[13px] font-semibold text-destructive mb-1">
              {result.skipped} row{result.skipped === 1 ? "" : "s"} skipped
            </div>
            <ul className="text-[12px] text-foreground/80 space-y-1">
              {result.errors.map((err) => (
                <li key={err.row}>
                  Row {err.row}: {err.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            {result ? "Close" : "Cancel"}
          </Button>
          <Button type="button" onClick={submit} disabled={!file || submitting}>
            <Upload className="size-4" />
            {submitting ? "Importing…" : "Import products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProductsDialog;
