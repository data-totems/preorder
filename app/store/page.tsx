'use client'

import { getAllProducts } from "@/actions/products.actions";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BellIcon } from "lucide-react";
import Link  from 'next/link'
import { useEffect, useState } from "react";
const products = Array.from({ length: 6 });

const Store = () => {

  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
  const getProduct = async () => {
    const response = await getAllProducts();

    if(response.status === 200) {
       console.log("Product Response", response.data)
       setProducts(response.data)
    }
   
  }

  getProduct();
  }, [])
  
  return (
    <div className="px-4 pt-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-gray-500 text-sm">Good morning</h1>
        {/* <div className="w-8 h-8 bg-gray-200 rounded-full" /> */}
        <Button variant={'ghost'} >
          <BellIcon color="#A9AEAB" />
        </Button>
      </div>

      {/* Search */}
      <div>
        <input
          placeholder="Search item"
          className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm outline-none"
        />
      </div>

      {/* Top Sellers */}
      <SectionHeader href="/store/top-sellers" title="TOP SELLERS" color="bg-orange-500" />
      <ProductGrid items={products} />

      {/* New Arrivals */}
      <SectionHeader href="/store/new-arrival" title="NEW ARRIVALS" color="bg-yellow-400" />
      <ProductGrid items={products} />

      {/* Categories */}
      <Categories />
    </div>
  );
};

export default Store;


const SectionHeader = ({
  title,
  color,
  href
}: {
  title: string;
  color: string;
  href: string
}) => (
  <div
    className={`${color} text-white px-4 py-2 rounded-xl flex justify-between items-center`}
  >
    <div className="flex items-center gap-3 ">
      <span className="font-semibold text-sm">{title}</span>
      <img  className="h-[40px] w-[40px]" src={'/star.png'} alt="star" width={100} height={100} />
    </div>
    <Link href={`${href}`} className="flex items-center gap-3 ">
      <span className="text-xs">See all</span>
      <ArrowUpRight className="text-sm" size={20}  />
    </Link>
    
  </div>
);


const ProductGrid = ({ items }: { items: any[] }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-3 shadow-sm"
        >
          <img
            src={item.images ? item?.images[0]?.image_url : ''}// replace with your image
            alt="product"
            className="w-full h-32 object-contain"
          />
          <h3 className="text-xs font-medium mt-2">
          {item.name}
          </h3>
          <p className="text-orange-500 text-xs font-semibold">
            NGN{item.price}
          </p>
        </div>
      ))}
    </div>
  );
};


const Categories = () => {
  const categories = [
    "Outdoor Gear",
    "Mobile Devices",
    "Home Appliances",
    "Notebooks",
    "Fitness Equipment",
    "E-Readers",
    "Craft Supplies",
    "Gadgets",
    "Artistic Materials",
    "Smart Devices",
    "Creative Supplies",
    "Tech Innovations",
    "DIY Essentials",
    "Electronic Accessories",
  ];

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex justify-between mb-3">
        <h3 className="text-sm font-semibold">CATEGORIES</h3>
        <span className="text-xs text-gray-400">See all →</span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600">
        {categories.map((cat) => (
          <span key={cat}>{cat}</span>
        ))}
      </div>
    </div>
  );
};
