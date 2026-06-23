"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  PackageX,
  Pen,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import ProductImageCarousel from "@/components/shared/ProductImageCarousel";
import SharePanel from "@/components/share/SharePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  deleteProduct,
  getProductbyId,
  toggleInStock,
  togglearchiveProduct,
  updateProductDetails,
  updateProductImage,
} from "@/actions/products.actions";
import { getProductShareStats } from "@/actions/share-links.actions";
import type { ShareStats } from "@/types/api";

const formatNgn = (price?: string | number) => {
  if (price === undefined || price === null || price === "") return "—";
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!isFinite(n)) return String(price);
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
};

type ImageSlot = "front" | "back" | "left" | "right";

const ProductDetails = () => {
  const pathname = usePathname();
  const router = useRouter();
  const productId = pathname.split("/")[3];

  const [product, setProduct] = useState<ProductProps | null>(null);
  const [shareStats, setShareStats] = useState<ShareStats | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [updating, setUpdating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStock, setTogglingStock] = useState(false);

  const [editForm, setEditForm] = useState({ name: "", description: "", price: "" });

  const [selectedImageType, setSelectedImageType] = useState<ImageSlot>("front");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const id = Number(productId);
    if (!Number.isFinite(id)) return;
    let alive = true;
    getProductbyId(id)
      .then((r) => {
        if (!alive) return;
        setProduct(r.data);
        setEditForm({
          name: r.data.name ?? "",
          description: r.data.description ?? "",
          price: String(r.data.price ?? ""),
        });
      })
      .catch((e) => {
        if (alive) toast.error(errorMessage(e, "Could not load product."));
      });
    getProductShareStats(id)
      .then((s) => {
        if (alive) setShareStats(s);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [productId]);

  const openEdit = () => {
    if (product) {
      setEditForm({
        name: product.name ?? "",
        description: product.description ?? "",
        price: String(product.price ?? ""),
      });
    }
    setEditOpen(true);
  };

  const clearImagePreview = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setSelectedFile(null);
    setPreviewImage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewImage) URL.revokeObjectURL(previewImage);
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpdateImage = async () => {
    if (!selectedFile || !productId) {
      toast.error("Please select an image first");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append(`${selectedImageType}_image`, selectedFile);
      const response = await updateProductImage({ productId, formData });
      if (response.status === 200) {
        toast.success(`${selectedImageType} image updated`);
        clearImagePreview();
        setImageOpen(false);
      }
    } catch (e) {
      toast.error(errorMessage(e, "Could not upload image."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDetails = async () => {
    setUpdating(true);
    try {
      const response = await updateProductDetails({
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        id: Number(productId),
      });
      if (response.status === 200) {
        toast.success("Product updated");
        setProduct((p) =>
          p
            ? { ...p, name: editForm.name, description: editForm.description, price: editForm.price }
            : p,
        );
        setEditOpen(false);
      }
    } catch (e) {
      toast.error(errorMessage(e, "Could not update product."));
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStock = async () => {
    if (!product) return;
    setTogglingStock(true);
    try {
      const response = await toggleInStock(Number(productId));
      if (response.status === 200) {
        const newInStock = response.data?.in_stock ?? !product.in_stock;
        toast.success(newInStock ? "Marked back in stock" : "Marked out of stock");
        setProduct((p) => (p ? { ...p, in_stock: newInStock } : p));
      }
    } catch (e) {
      toast.error(errorMessage(e, "Could not update stock."));
    } finally {
      setTogglingStock(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const response = await togglearchiveProduct(Number(productId));
      if (response.status === 200) {
        toast.success("Product archived");
        setArchiveOpen(false);
        router.back();
      }
    } catch (e) {
      toast.error(errorMessage(e, "Could not archive product."));
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await deleteProduct(Number(productId));
      if (response.status === 200) {
        toast.success("Product deleted");
        setDeleteOpen(false);
        router.back();
      }
    } catch (e) {
      toast.error(errorMessage(e, "Could not delete product."));
    } finally {
      setDeleting(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <div className="px-6 md:px-10 py-8">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-10 w-2/3 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="px-6 md:px-10 grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const images = product.images ?? [];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        eyebrow={product.in_stock ? "PRODUCT" : "PRODUCT · OUT OF STOCK"}
        title={product.name}
        description={formatNgn(product.price)}
        actions={
          <>
            <Button variant="outline" onClick={openEdit}>
              <Pen className="size-4" /> Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={handleToggleStock}
                  disabled={togglingStock}
                  className="cursor-pointer"
                >
                  {product.in_stock ? (
                    <>
                      <PackageX className="size-4" /> Mark out of stock
                    </>
                  ) : (
                    <>
                      <PackageCheck className="size-4" /> Mark back in stock
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setImageOpen(true)}
                  className="cursor-pointer"
                >
                  <ImagePlus className="size-4" />
                  Replace image
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setArchiveOpen(true)}
                  className="cursor-pointer"
                >
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  className="cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="px-6 md:px-10 mt-6">
        <SharePanel
          stats={shareStats}
          shareTitle={product.name}
          messageTemplate={`📱 *${product.name}* — ${formatNgn(product.price)}\nTap to view:`}
        />
      </div>

      <div className="px-6 md:px-10 mt-10 grid lg:grid-cols-2 gap-8 lg:gap-12">
        <ProductImageCarousel
          images={images}
          alt={product.name}
          fallback={product.image_url ?? undefined}
        />

        <div className="flex flex-col gap-6">
          <Card padding="none" className="p-6">
            <Eyebrow className="block">PRICE</Eyebrow>
            <div className="mt-2 text-[32px] leading-[40px] font-bold text-forest-700 tracking-[-0.01em] tabular-nums">
              {formatNgn(product.price)}
            </div>
          </Card>

          <Card padding="none" className="p-6">
            <Eyebrow className="block">DESCRIPTION</Eyebrow>
            <p className="mt-3 text-[15px] leading-[24px] text-foreground/80 whitespace-pre-wrap">
              {product.description || (
                <span className="text-muted-foreground">No description yet.</span>
              )}
            </p>
          </Card>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>Update the product name, price, and description.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Product name</Label>
              <Input
                id="edit-name"
                placeholder="e.g. Wireless earbuds"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-sm bg-forest-100 text-forest-700 text-[11px] font-bold tracking-[0.02em] z-10">
                  NGN
                </span>
                <Input
                  id="edit-price"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  className="pl-16 tabular-nums"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                placeholder="What makes this product great?"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="min-h-[96px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDetails} disabled={updating}>
              {updating ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={imageOpen}
        onOpenChange={(o) => {
          setImageOpen(o);
          if (!o) clearImagePreview();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Replace image</DialogTitle>
            <DialogDescription>
              Pick which angle to update and upload a new image.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Image slot</Label>
              <Select
                value={selectedImageType}
                onValueChange={(v: ImageSlot) => setSelectedImageType(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="image-upload">Upload image</Label>
              <label
                htmlFor="image-upload"
                className="relative flex flex-col items-center justify-center h-44 rounded-md border-2 border-dashed border-ink-200 bg-ink-50 hover:bg-ink-100 cursor-pointer transition-colors overflow-hidden"
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="size-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mb-2">
                      <Upload className="size-5" />
                    </div>
                    <span className="text-[14px] font-semibold text-foreground">
                      {selectedFile ? selectedFile.name : "Click to upload image"}
                    </span>
                    <span className="mt-1 text-[12px] text-muted-foreground">
                      JPG, PNG, WEBP · max 5MB
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setImageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateImage}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : "Update image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this product?</AlertDialogTitle>
            <AlertDialogDescription>
              Buyers won&apos;t be able to see it. You can unarchive it from the marketplace later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={archiving}
            >
              {archiving && <Loader2 className="size-4 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product and its share stats. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetails;
