import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { authClient } from "@/lib/auth/client";
			const { data } = await authClient.getUser();

export const navItems = [
  
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },

  ...(data?.role?.name === 'superadmin'
    ? [{ key: 'customers', title: 'Sub Admins', href: paths.dashboard.customers, icon: 'users' }]
    : []),
  
  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
