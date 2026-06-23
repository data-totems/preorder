'use client'
import { getuserProducts, exportProducts } from "@/actions/products.actions"
import CreateProduct from "@/components/shared/CreateProduct"
import EmptyState from "@/components/shared/EmptyState"
import PageHeader from "@/components/shared/PageHeader"
import ProductCard from "@/components/shared/ProductCard"
import DataPagination, { usePaginated } from "@/components/shared/DataPagination"
import ImportProductsDialog from "@/components/shared/ImportProductsDialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Store, Download, Upload, ChevronDown } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { Product } from "@/types/api"
import { errorMessage } from "@/lib/errors"

const PAGE_SIZE = 12

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadProducts = useCallback(async () => {
    try {
      const response = await getuserProducts()
      if (response.status === 200 && Array.isArray(response.data)) {
        setProducts(response.data)
      }
    } catch (error) {
      toast.error(errorMessage(error, "Could not load products."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const { slice: pageProducts, page, setPage, totalItems } = usePaginated(products, PAGE_SIZE)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportProducts()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `buzzmart-products-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success("CSV downloaded")
    } catch (error) {
      toast.error(errorMessage(error, "Export failed."))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        eyebrow="MARKETPLACE"
        title="Your products"
        description={
          products.length > 0
            ? `${products.length} item${products.length === 1 ? "" : "s"}`
            : "Add your first product to start selling."
        }
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Import or export"
                className="inline-flex items-center justify-center h-11 px-4 gap-2 rounded-md border border-border bg-transparent text-foreground hover:bg-ink-50 text-[15px] font-semibold transition-colors duration-150"
              >
                Bulk <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={handleExport}
                  disabled={exporting || products.length === 0}
                  className="cursor-pointer"
                >
                  <Download className="size-4" /> {exporting ? "Exporting…" : "Export CSV"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setImportOpen(true)}
                  className="cursor-pointer"
                >
                  <Upload className="size-4" /> Import CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setOpenDialog(true)} type="button">
              <Plus className="size-4" /> New product
            </Button>
          </>
        }
      />

      <section className="px-6 md:px-10 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-7 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Store />}
            title="No products yet"
            description="Add your first product, or import a CSV to bring in your catalogue."
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={() => setOpenDialog(true)} type="button">Add product</Button>
                <Button variant="outline" type="button" onClick={() => setImportOpen(true)}>
                  <Upload className="size-4" /> Import CSV
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {pageProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  image_url={p.images?.[0]?.image_url}
                  inStock={p.in_stock !== false}
                />
              ))}
            </div>
            <div className="mt-10">
              <DataPagination
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <CreateProduct open={openDialog} setOpen={setOpenDialog} />
      <ImportProductsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => {
          setImportOpen(false)
          loadProducts()
        }}
      />
    </div>
  )
}

export default Marketplace
