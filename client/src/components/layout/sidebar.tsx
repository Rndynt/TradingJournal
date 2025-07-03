import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  PlusCircle, 
  History, 
  BarChart3, 
  Newspaper, 
  Settings, 
  User 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "New Trade", href: "/trade-entry", icon: PlusCircle },
  { name: "Trade History", href: "/history", icon: History },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "News & Events", href: "/news", icon: Newspaper },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-dark-200 border-r border-dark-300">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-dark-300">
          <h1 className="text-xl font-bold text-white">TradePro Journal</h1>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-white bg-dark-300"
                      : "text-gray-300 hover:text-white hover:bg-dark-300"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-dark-300">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-info rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">John Trader</p>
              <p className="text-xs text-gray-400">Premium Account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
