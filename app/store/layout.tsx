import { ReactNode } from "react";
import { Home, Search, Grid } from "lucide-react";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
      <div className="flex justify-around items-center h-16">
        <button className="flex flex-col items-center text-[#27BA5F]">
          <Home size={20} />
          <span className="text-xs">Marketplace</span>
        </button>

        <button className="flex flex-col items-center text-gray-400">
          <Search size={20} />
          <span className="text-xs">Search</span>
        </button>

        <button className="flex flex-col items-center text-gray-400">
          <Grid size={20} />
          <span className="text-xs">Category</span>
        </button>
      </div>
    </nav>
  );
};

const StoreLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20">
      {children}
      <BottomNav />
    </div>
  );
};

export default StoreLayout;
