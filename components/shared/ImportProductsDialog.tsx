"use client";

import * as React from "react";
import { Upload, Check, AlertTriangle, X, ArrowLeft } from "lucide-react";
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
import { importProducts, previewProductImport } from "@/actions/products.actions";
import { errorMessage } from "@/lib/errors";
import { toast } from "sonner";

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}

type PreviewRow = {
  row: number;
  name: string;
  price: string;
  description: string;
  in_stock: boolean;
  image_url: string;
  errors: string[];
  image_warning: string | null;
};

type PreviewResult = {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  image_warning_count: number;
  truncated: boolean;
  max_rows: number;
  rows: PreviewRow[];
};

type ImportError = { row: number; reason: string };
type ImportResult = {
  created: number;
  skipped: number;
  errors: ImportError[];
  image_warnings?: ImportError[];
};

type Stage = "pick" | "preview" | "result";

const ImportProductsDialog: React.FC<ImportProductsDialogProps> = ({
  open,
  onOpenChange,
  onImported,
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [stage, setStage] = React.useState<Stage>("pick");
  const [previewing, setPreviewing] = React.useState(false);
  const [importingNow, setImportingNow] = React.useState(false);
  const [preview, setPreview] = React.useState<PreviewResult | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setStage("pick");
      setPreviewing(false);
      setImportingNow(false);
      setPreview(null);
      setResult(null);
    }
  }, [open]);

  const handlePreview = async () => {
    if (!file) return;
    setPreviewing(true);
    try {
      const res = await previewProductImport(file);
      setPreview(res.data as PreviewResult);
      setStage("preview");
    } catch (e) {
      toast.error(errorMessage(e, "Could not read the CSV. Check the format."));
    } finally {
      setPreviewing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setImportingNow(true);
    try {
      const res = await importProducts(file);
      const data = res.data as ImportResult;
      setResult(data);
      setStage("result");
      if (data.created > 0) {
        toast.success(
          `Imported ${data.created} product${data.created === 1 ? "" : "s"}${
            data.skipped ? ` · ${data.skipped} skipped` : ""
          }`,
        );
        onImported?.();
      } else {
        toast.error("No products were imported. Check the row errors.");
      }
    } catch (e) {
      toast.error(errorMessage(e, "Import failed. Try again."));
    } finally {
      setImportingNow(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {stage === "pick" && "Import products from CSV"}
            {stage === "preview" && "Review before importing"}
            {stage === "result" && "Import complete"}
          </DialogTitle>
          {stage === "pick" && (
            <DialogDescription>
              Upload a CSV with columns <code>name</code>, <code>price</code>,{" "}
              <code>description</code>, <code>in_stock</code>, and{" "}
              <code>image_url</code>. You&apos;ll get to review every row before
              anything is created.
            </DialogDescription>
          )}
          {stage === "preview" && preview && (
            <DialogDescription>
              {preview.valid_rows} of {preview.total_rows} row
              {preview.total_rows === 1 ? "" : "s"} will be imported.
              {preview.invalid_rows > 0 && (
                <span className="text-destructive">
                  {" "}
                  {preview.invalid_rows} row{preview.invalid_rows === 1 ? "" : "s"} will be skipped — see why below.
                </span>
              )}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {stage === "pick" && (
            <div>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={previewing}
              />
              <p className="mt-2 text-[12px] text-muted-foreground">
                Tip: Export your current products first to see the exact column format.
              </p>
            </div>
          )}

          {stage === "preview" && preview && (
            <>
              {preview.truncated && (
                <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-[12px] text-amber-900">
                  Only the first {preview.max_rows} rows were read. Split the CSV and re-run for the rest.
                </div>
              )}

              <div className="rounded-md border border-border overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-ink-50 text-foreground/70 uppercase text-[11px] tracking-[0.04em]">
                    <tr>
                      <th className="text-left px-3 py-2 w-12">#</th>
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-left px-3 py-2 w-24">Price</th>
                      <th className="text-left px-3 py-2 w-16">Stock</th>
                      <th className="text-left px-3 py-2 w-24">Image</th>
                      <th className="text-left px-3 py-2 w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r) => {
                      const hasError = r.errors.length > 0;
                      return (
                        <tr
                          key={r.row}
                          className={`border-t border-border ${hasError ? "bg-destructive/5" : ""}`}
                        >
                          <td className="px-3 py-2 align-top text-muted-foreground tabular-nums">
                            {r.row}
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="font-semibold text-foreground line-clamp-1">
                              {r.name || <span className="italic text-muted-foreground">(missing)</span>}
                            </div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1">
                              {r.description || <span className="italic">no description</span>}
                            </div>
                            {hasError && (
                              <ul className="mt-1 text-[11px] text-destructive list-disc pl-4">
                                {r.errors.map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                              </ul>
                            )}
                            {r.image_warning && (
                              <div className="mt-1 text-[11px] text-amber-800 flex items-center gap-1">
                                <AlertTriangle className="size-3 shrink-0" />
                                {r.image_warning}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top tabular-nums">
                            {r.price ? `₦${r.price}` : <span className="text-muted-foreground italic">—</span>}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {r.in_stock ? "In" : <span className="text-destructive">Out</span>}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {r.image_url ? (
                              <span
                                className={r.image_warning ? "text-amber-700" : "text-forest-700"}
                                title={r.image_warning ? "Image will be skipped" : "Image URL will be fetched on import"}
                              >
                                {r.image_warning ? "Skip" : "On import"}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {hasError ? (
                              <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                                <X className="size-3" /> Skip
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-forest-700 font-semibold">
                                <Check className="size-3" /> OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {preview.rows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                          No data rows found in the CSV.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {stage === "result" && result && (
            <div className="space-y-3">
              <div className="rounded-md border border-forest-300 bg-forest-50 p-3 text-[13px]">
                <div className="font-semibold text-forest-700">
                  ✓ {result.created} product{result.created === 1 ? "" : "s"} imported
                </div>
                {result.skipped > 0 && (
                  <div className="text-foreground/70 mt-1">
                    {result.skipped} row{result.skipped === 1 ? "" : "s"} skipped
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 max-h-40 overflow-y-auto">
                  <div className="text-[13px] font-semibold text-destructive mb-1">
                    Row errors
                  </div>
                  <ul className="text-[12px] text-foreground/80 space-y-1">
                    {result.errors.map((err) => (
                      <li key={err.row}>Row {err.row}: {err.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(result.image_warnings?.length ?? 0) > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 max-h-40 overflow-y-auto">
                  <div className="text-[13px] font-semibold text-amber-800 mb-1">
                    {result.image_warnings!.length} image{result.image_warnings!.length === 1 ? "" : "s"} could not be attached
                  </div>
                  <p className="text-[11px] text-amber-900/80 mb-2">
                    The products were still created — upload these images directly from the product page.
                  </p>
                  <ul className="text-[12px] text-foreground/80 space-y-1">
                    {result.image_warnings!.map((err) => (
                      <li key={err.row}>Row {err.row}: {err.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t border-border pt-4">
          {stage === "pick" && (
            <>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handlePreview} disabled={!file || previewing}>
                {previewing ? "Reading…" : "Preview rows →"}
              </Button>
            </>
          )}
          {stage === "preview" && preview && (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setStage("pick");
                  setPreview(null);
                }}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={handleConfirmImport}
                disabled={importingNow || preview.valid_rows === 0}
              >
                <Upload className="size-4" />
                {importingNow
                  ? "Importing…"
                  : preview.valid_rows === 0
                    ? "No valid rows"
                    : `Import ${preview.valid_rows} product${preview.valid_rows === 1 ? "" : "s"}`}
              </Button>
            </>
          )}
          {stage === "result" && (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProductsDialog;
