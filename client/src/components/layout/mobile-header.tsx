import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export default function MobileHeader() {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
      <h1 className="text-lg font-semibold text-foreground">TradePro Journal</h1>
      <button 
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpenMobile(!openMobile)}
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
