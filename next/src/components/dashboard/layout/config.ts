"use client";

import React from "react";
import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";

export function useNavItems(): NavItemConfig[] {
  const [items, setItems] = React.useState<NavItemConfig[]>([]);

  React.useEffect(() => {
    (async () => {
      const { data: user } = await authClient.getUser();

      const baseItems: NavItemConfig[] = [
        { key: "overview", title: "Overview", href: paths.dashboard.overview, icon: "chart-pie" },
        ...(user?.role?.name === "superadmin"
          ? [{ key: "customers", title: "Sub Admins", href: paths.dashboard.customers, icon: "users" }]
          : []),
        { key: "banner", title: "Banners", href: paths.dashboard.banner, icon: "image-square" },
        { key: "integrations", title: "Integrations", href: paths.dashboard.integrations, icon: "plugs-connected" },
        { key: "settings", title: "Settings", href: paths.dashboard.settings, icon: "gear-six" },
        { key: "account", title: "Account", href: paths.dashboard.account, icon: "user" },
        { key: "error", title: "Error", href: paths.errors.notFound, icon: "x-square" },
      ];

      setItems(baseItems);
    })();
  }, []);

  return items;
}
