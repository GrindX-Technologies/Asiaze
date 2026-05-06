"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard (overview)",
    href: "/dashboard",
  },
  {
    title: "Manage News",
    href: "/dashboard/news",
    items: [
      { title: "All News List", href: "/dashboard/news" },
      { title: "Add News", href: "/dashboard/news/add" },
      { title: "Categories", href: "/dashboard/news/categories" },
      { title: "Tags Management", href: "/dashboard/news/tags" },
    ],
  },
  {
    title: "Manage Reels",
    href: "/dashboard/reels",
    items: [
      { title: "All Reels List", href: "/dashboard/reels" },
      { title: "Add Reel", href: "/dashboard/reels/add" },
    ],
  },
  {
    title: "Users Management",
    href: "/dashboard/users",
  },
  {
    title: "Rewards Management",
    href: "/dashboard/rewards",
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    items: [
      { title: "Push Notifications", href: "/dashboard/notifications/push" },
      { title: "Past Notifications", href: "/dashboard/notifications/past" },
    ],
  },
  {
    title: "Reports / Analytics",
    href: "/dashboard/analytics",
  },
  {
    title: "Setting",
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Track open state for dropdown menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    // Initialize menus as open if current path matches
    const initial: Record<string, boolean> = {};
    sidebarNavItems.forEach(item => {
      if (item.items && pathname.startsWith(item.href) && item.href !== "/dashboard") {
        initial[item.title] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (title: string, href: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
    router.push(href);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-[#E0202B] text-white fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 pt-8 flex items-center justify-center">
        <Image 
          src="/logo.svg" 
          alt="asiaze logo" 
          width={100} 
          height={100} 
          className="rounded-lg shadow-sm"
          priority
        />
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-4">
        {sidebarNavItems.map((item, index) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
          const hasItems = item.items && item.items.length > 0;
          const isOpen = openMenus[item.title];

          return (
            <div key={index} className="space-y-1">
              {hasItems ? (
                <button
                  onClick={() => toggleMenu(item.title, item.href)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors",
                    isActive ? "bg-black text-white" : "text-white"
                  )}
                >
                  <span>{item.title}</span>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors",
                    pathname === item.href ? "bg-black text-white" : "text-white"
                  )}
                >
                  {item.title}
                </Link>
              )}
              
              {hasItems && isOpen && (
                <div className="pt-1 pb-2 space-y-1">
                  {item.items?.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.href}
                      className={cn(
                        "group flex w-full items-center rounded-md pl-8 pr-3 py-2 text-sm font-medium transition-colors",
                        pathname === subItem.href 
                          ? "bg-black text-white" 
                          : "text-white/80 hover:bg-black hover:text-white"
                      )}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Link href="/">
          <button className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 transition-colors">
            Logout
          </button>
        </Link>
      </div>
    </div>
  );
}