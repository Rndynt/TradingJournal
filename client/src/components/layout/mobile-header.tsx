import { Menu } from "lucide-react";

export default function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
      <h1 className="text-lg font-semibold text-foreground">TradePro Journal</h1>
      <button className="text-muted-foreground hover:text-foreground">
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
