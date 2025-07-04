
import { Menu, X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  PlusCircle, 
  History, 
  BarChart3, 
  Newspaper, 
  Settings, 
  User,
  DollarSign
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "New Trade", href: "/trade-entry", icon: PlusCircle },
  { name: "Trade History", href: "/history", icon: History },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Prices", href: "/prices", icon: DollarSign },
  { name: "News & Events", href: "/news", icon: Newspaper },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileHeader() {
  const { openMobile, setOpenMobile } = useSidebar();
  const [location] = useLocation();

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border relative z-50">
        <h1 className="text-lg font-semibold text-foreground">TradePro Journal</h1>
        <button 
          className="text-muted-foreground hover:text-foreground p-2"
          onClick={() => setOpenMobile(!openMobile)}
        >
          {openMobile ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {openMobile && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setOpenMobile(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 bg-muted border-b border-border">
              <h1 className="text-xl font-bold text-foreground">TradePro Journal</h1>
            </div>

            {/* Navigation */}
            <nav className="mt-6 flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;

                return (
                  <Link key={item.name} href={item.href}>
                    <span
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                        isActive
                          ? "text-primary-foreground bg-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">John Trader</p>
                  <p className="text-xs text-muted-foreground">Premium Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
