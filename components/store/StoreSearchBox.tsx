"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface StoreSearchBoxProps {
  size?: "sm" | "lg";
  placeholder?: string;
  className?: string;
}

/**
 * Storefront search input. Submitting (Enter) navigates to /store?q=<value>.
 * The /store page reads the param and filters its product list client-side.
 *
 * Stays controlled by the URL — when the user lands on /store?q=foo from any
 * link, the box hydrates with "foo" automatically.
 */
const StoreSearchBox: React.FC<StoreSearchBoxProps> = ({
  size = "sm",
  placeholder = "Search products or stores",
  className,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get("q") ?? "");

  // Keep input in sync if the URL changes from elsewhere (back/forward nav).
  React.useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    const target = trimmed ? `/store?q=${encodeURIComponent(trimmed)}` : "/store";
    router.push(target);
  };

  const isLarge = size === "lg";

  return (
    <form onSubmit={submit} className={className}>
      <div className="relative w-full">
        <Search
          className={`absolute ${isLarge ? "left-4" : "left-3"} top-1/2 -translate-y-1/2 ${isLarge ? "size-5" : "size-4"} text-ink-300`}
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`w-full ${isLarge ? "h-14 pl-12 pr-4 text-[16px]" : "h-10 pl-10 pr-3 text-[14px]"} rounded-md bg-ink-100 border-0 placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-white`}
        />
      </div>
    </form>
  );
};

export default StoreSearchBox;
