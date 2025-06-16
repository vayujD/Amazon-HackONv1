
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Shield,
  BarChart3,
  Users,
  AlertTriangle,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { name: "Dashboard", href: "dashboard", icon: Home },
  { name: "Admin Operations", href: "admin", icon: Shield },
  { name: "Review Analytics", href: "analytics", icon: BarChart3 },
  { name: "Seller Dashboard", href: "seller", icon: Users },
  { name: "Seller Management", href: "seller-management", icon: User },
  { name: "Alerts", href: "alerts", icon: AlertTriangle },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-amazon-orange" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Amazon MIP</h1>
            <p className="text-xs text-sidebar-foreground/60">Marketplace Integrity</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={activeTab === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
                activeTab === item.href && "bg-sidebar-accent text-sidebar-foreground"
              )}
              onClick={() => onTabChange(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="border-t p-3">
        <div className="flex items-center space-x-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-amazon-orange flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              Admin User
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              admin@amazon.com
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
