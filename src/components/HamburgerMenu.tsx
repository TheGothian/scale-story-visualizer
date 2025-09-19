import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  User,
  Settings,
  LogOut,
  Scale,
  BarChart3,
  Target,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

export const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/",
      active: location.pathname === "/",
    },
    {
      icon: Scale,
      label: "Weights",
      path: "/weights",
      active: location.pathname === "/weights",
    },
    {
      icon: Target,
      label: "Body Fat",
      path: "/body-fat",
      active: location.pathname === "/body-fat",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      active: location.pathname === "/settings",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user?.display_name || user?.email || "User"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={item.active ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
