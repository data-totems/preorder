"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createProduct } from "@/actions/products.actions";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  productName: z.string().min(2, "At least 2 characters").max(50, "At most 50 characters"),
  tags: z.array(z.string()),
  productImage: z
    .any()
    .refine((file) => file instanceof File, { message: "Image is required" })
    .refine((file) => file && file.size <= MAX_FILE_SIZE, { message: "Max file size is 2MB" })
    .refine((file) => file && ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only JPG, PNG, WEBP supported",
    }),
  description: z.string().min(1, "Add a short description"),
  price: z.string().min(1, "Enter a price"),
});

const TAG_OPTIONS = [
  "Mobile Devices",
  "Notebooks",
  "E-Readers",
  "Gadgets",
  "Smart Devices",
  "Tech Innovations",
];

const CreateProduct = ({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      tags: [],
      description: "",
      price: "",
      productImage: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      if (preview) URL.revokeObjectURL(preview);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      form.setValue("productImage", file, { shouldValidate: true });
    } catch {
      toast.error("Could not read image");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    form.setValue("productImage", undefined, { shouldValidate: true });
  };

  const resetAll = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    form.reset({ productName: "", tags: [], description: "", price: "", productImage: undefined });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.productName);
      formData.append("price", values.price);
      formData.append("description", values.description);
      if (values.tags?.length) formData.append("tags", JSON.stringify(values.tags));
      if (values.productImage instanceof File) formData.append("front_image", values.productImage);

      const response = await createProduct(formData);
      if (response.status === 201) {
        toast.success("Product created");
        setOpen(false);
        resetAll();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          "Could not create product",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetAll();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create product</DialogTitle>
          <DialogDescription>Add a product to your storefront.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-5">
            <FormField
              control={form.control}
              name="productImage"
              render={() => (
                <FormItem>
                  <FormLabel>Product image</FormLabel>
                  <FormControl>
                    <label className="relative flex flex-col items-center justify-center h-44 rounded-md border-2 border-dashed border-ink-200 bg-ink-50 hover:bg-ink-100 cursor-pointer transition-colors overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {preview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              clearImage();
                            }}
                            className="absolute top-2 right-2 size-8 rounded-full bg-ink-900/70 text-white flex items-center justify-center hover:bg-ink-900 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : isLoading ? (
                        <Loader2 className="size-6 text-ink-500 animate-spin" />
                      ) : (
                        <>
                          <div className="size-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mb-2">
                            <ImagePlus className="size-5" />
                          </div>
                          <span className="text-[14px] font-semibold text-foreground">
                            Upload image
                          </span>
                          <span className="mt-1 text-[12px] text-muted-foreground">
                            JPG, PNG, WEBP · max 2MB
                          </span>
                        </>
                      )}
                    </label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Wireless earbuds" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-sm bg-forest-100 text-forest-700 text-[11px] font-bold tracking-[0.02em] z-10">
                        NGN
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="pl-16 tabular-nums"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What makes this product great?"
                      className="min-h-[96px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {TAG_OPTIONS.map((tag) => {
                        const selected = field.value.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((t) => t !== tag)
                                  : [...field.value, tag],
                              )
                            }
                            className={cn(
                              "px-3 py-1.5 rounded-pill text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              selected
                                ? "bg-forest-700 text-white hover:bg-forest-500"
                                : "bg-ink-100 text-ink-700 hover:bg-ink-200",
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Plus className="size-4" /> Create product
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProduct;
