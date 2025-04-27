import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  User,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Set default open state based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: FolderKanban,
      label: "Projects",
      href: "/projects",
    },
    {
      icon: CheckSquare,
      label: "Tasks",
      href: "/tasks",
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
    },
  ];

  // Mobile toggle button
  const MobileToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden absolute top-4 left-4 z-50"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      {sidebarOpen ? <X /> : <Menu />}
    </Button>
  );

  return (
    <>
      <MobileToggle />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col lg:sticky bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300",
          isMobile && !sidebarOpen && "-translate-x-full",
          className
        )}
      >
        <div className="flex h-16 shrink-0 items-center px-6">
          <h1 className="text-2xl font-bold text-primary dark:text-primary-foreground">TaskFlow</h1>
        </div>
        <nav className="flex flex-1 flex-col px-6 py-4">
          <ul className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer",
                      location === item.href
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4">
            <Link href="/settings">
              <a className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="h-5 w-5" />
                Settings
              </a>
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
