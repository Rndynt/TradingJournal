import { Menu } from "lucide-react";

export default function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-dark-200 border-b border-dark-300">
      <h1 className="text-lg font-semibold text-white">TradePro Journal</h1>
      <button className="text-gray-400 hover:text-white">
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
