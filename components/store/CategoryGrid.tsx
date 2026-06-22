import Link from "next/link";

const categories = [
  { slug: "phones", name: "Phones", count: "120+" },
  { slug: "tablets", name: "Tablets", count: "40+" },
  { slug: "laptops", name: "Laptops", count: "60+" },
  { slug: "fashion", name: "Fashion", count: "200+" },
  { slug: "beauty", name: "Beauty", count: "80+" },
  { slug: "home", name: "Home", count: "55+" },
];

const CategoryGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {categories.map((c) => (
      <Link
        key={c.slug}
        href={`/store?category=${c.slug}`}
        className="relative overflow-hidden rounded-lg p-6 h-40 flex flex-col justify-end bg-gradient-to-br from-forest-700 to-forest-900 text-white hover:from-forest-500 hover:to-forest-700 transition-colors duration-200"
      >
        <div className="text-[28px] leading-[36px] font-bold tracking-[-0.01em]">{c.name}</div>
        <div className="text-[13px] text-forest-50/70 mt-1">{c.count} products</div>
      </Link>
    ))}
  </div>
);

export default CategoryGrid;
