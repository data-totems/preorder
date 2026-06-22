'use client'
import { getuserProducts } from "@/actions/products.actions"
import CreateProduct from "@/components/shared/CreateProduct"
import EmptyState from "@/components/shared/EmptyState"
import PageHeader from "@/components/shared/PageHeader"
import ProductCard from "@/components/shared/ProductCard"
import { Button } from "@/components/ui/button"
import { Plus, Store } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Product } from "@/types/api"
import { errorMessage } from "@/lib/errors"

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await getuserProducts();

        if(response.status === 200 && Array.isArray(response.data)) {
          setProducts(response.data)
        }
      } catch (error) {
        toast.error(errorMessage(error, "Could not load products."))
      }
    }

    getProducts();
  }, [])

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
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="size-4" /> New product
          </Button>
        }
      />

      <section className="px-6 md:px-10 pb-12">
        {products.length === 0 ? (
          <EmptyState
            icon={<Store />}
            title="No products yet"
            description="Add your first product to start selling and sharing on WhatsApp."
            action={<Button onClick={() => setOpenDialog(true)}>Add product</Button>}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image_url={p.images?.[0]?.image_url}
              />
            ))}
          </div>
        )}
      </section>

      <CreateProduct open={openDialog} setOpen={setOpenDialog} />
    </div>
  )
}

export default Marketplace
