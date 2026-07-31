"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Truck, Store, LayoutDashboard } from "lucide-react";
import "./role-nav.css";

const links = [
  { href: "/", label: "Menú", icon: ShoppingBag },
  { href: "/tienda", label: "Tienda", icon: Store },
  { href: "/vendedor", label: "Repartidor", icon: Truck },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function RoleNav() {
  const pathname = usePathname();
  const [oculto, setOculto] = useState(false);
  const ultimoScroll = useRef(0);

  useEffect(() => {
    const handler = () => {
      const actual = window.scrollY;
      if (actual > 60 && actual > ultimoScroll.current) {
        setOculto(true);
      } else {
        setOculto(false);
      }
      ultimoScroll.current = actual;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={cn("role-nav", oculto && "role-nav-hidden")}>
      <div className="role-nav-inner">
        <Link href="/" className="role-nav-logo">
          <img src="/img/FoodOs.png" alt="FoodOS" className="role-nav-logo-img" />
          <span className="role-nav-logo-text ml-1.5 hidden sm:inline">
            <span className="role-nav-logo-accent">FOOD</span> OS
          </span>
        </Link>
        <div className="role-nav-links">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "role-nav-link",
                  active ? "role-nav-link-active" : "role-nav-link-inactive"
                )}
              >
                <Icon className="role-nav-link-icon" />
                <span className="role-nav-link-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
