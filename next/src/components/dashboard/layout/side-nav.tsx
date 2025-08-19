/* eslint-disable unicorn/prefer-single-call */
"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CaretUpDownIcon } from "@phosphor-icons/react/dist/ssr/CaretUpDown";

import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";
import { authClient } from "@/lib/auth/client";
import { isNavItemActive } from "@/lib/is-nav-item-active";
import { Logo } from "@/components/core/logo";

import { GetPermissions } from "../../../app/query-common";
import { navIcons } from "./nav-icons";

export function SideNav(): React.JSX.Element {
	const pathname = usePathname();
	const [user, setUser] = React.useState<any>(null);
	const [navItems, setNavItems] = React.useState<NavItemConfig[]>([]);

	// 1️⃣ Load user
	React.useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
		})();
	}, []);

	const { data } = useQuery(GetPermissions, {
		variables: {
			subadminId: user?.id,
			superadminId: user?.superadmin_id,
		},

		fetchPolicy: "network-only",
	});
	// 3️⃣ Build nav items
	React.useEffect(() => {
		if (!user) return;
		const items: NavItemConfig[] = [
			{ key: "overview", title: "Overview", href: paths.dashboard.overview, icon: "chart-pie" },
		];

		if (user.role.name === "superadmin") {
			// Superadmin → direct items
			items.push({ key: "customers", title: "Sub Admins", href: paths.dashboard.customers, icon: "users" });
			items.push({ key: "products", title: "Products", href: paths.dashboard.products, icon: "product" });

			items.push({ key: "banner", title: "Banners", href: paths.dashboard.banner, icon: "image-square" });
			items.push({ key: "categories", title: "Categories", href: paths.dashboard.categories, icon: "squares-four" });
			items.push({ key: "roles", title: "Roles", href: paths.dashboard.roles, icon: "roles" });
			items.push({ key: "size", title: "Size", href: paths.dashboard.size, icon: "size" });
			items.push({ key: "color", title: "Color", href: paths.dashboard.color, icon: "color" });
			items.push({ key: "extra", title: "Accessories", href: paths.dashboard.extra, icon: "accessories" });
		} else if (data?.getPermission?.modules) {
			const modules = data.getPermission.modules;

			if (modules.products?.view) {
				items.push({ key: "products", title: "Products", href: paths.dashboard.products, icon: "product" });
			}
			if (modules.categories?.view) {
				items.push({ key: "categories", title: "Categories", href: paths.dashboard.categories, icon: "squares-four" });
			}
			// if (modules.orders?.view) {
			// 	items.push({ key: "orders", title: "Orders", href: paths.dashboard.orders, icon: "shopping-cart" });
			// }
			if (modules?.banners?.view) {
				items.push({ key: "banner", title: "Banners", href: paths.dashboard.banner, icon: "image-square" });
			}
			items.push({ key: "size", title: "Size", href: paths.dashboard.size, icon: "size" });
			items.push({ key: "color", title: "Color", href: paths.dashboard.color, icon: "color" });
			items.push({ key: "extra", title: "Accessories", href: paths.dashboard.extra, icon: "accessories" });
		}

		// Common items
		items.push(
			{ key: "integrations", title: "Integrations", href: paths.dashboard.integrations, icon: "plugs-connected" },
			{ key: "settings", title: "Settings", href: paths.dashboard.settings, icon: "gear-six" },
			{ key: "account", title: "Account", href: paths.dashboard.account, icon: "user" },
			{ key: "error", title: "Error", href: paths.errors.notFound, icon: "x-square" }
		);

		setNavItems(items);
	}, [user, data]);

	return (
		<Box
			sx={{
				"--SideNav-background": "var(--mui-palette-neutral-950)",
				"--SideNav-color": "var(--mui-palette-common-white)",
				"--NavItem-color": "var(--mui-palette-neutral-300)",
				"--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
				"--NavItem-active-background": "var(--mui-palette-primary-main)",
				"--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
				"--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
				"--NavItem-icon-color": "var(--mui-palette-neutral-400)",
				"--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
				"--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
				bgcolor: "var(--SideNav-background)",
				color: "var(--SideNav-color)",
				display: { xs: "none", lg: "flex" },
				flexDirection: "column",
				height: "100%",
				left: 0,
				maxWidth: "100%",
				position: "fixed",
				scrollbarWidth: "none",
				top: 0,
				width: "var(--SideNav-width)",
				zIndex: "var(--SideNav-zIndex)",
				"&::-webkit-scrollbar": { display: "none" },
			}}
		>
			<Stack spacing={2} sx={{ p: 3 }}>
				<Box component={RouterLink} href={paths.home} sx={{ display: "inline-flex" }}>
					<Logo color="light" height={32} width={122} />
				</Box>
				<Box
					sx={{
						alignItems: "center",
						backgroundColor: "var(--mui-palette-neutral-950)",
						border: "1px solid var(--mui-palette-neutral-700)",
						borderRadius: "12px",
						cursor: "pointer",
						display: "flex",
						p: "4px 12px",
					}}
				>
					<Box sx={{ flex: "1 1 auto" }}>
						<Typography color="var(--mui-palette-neutral-400)" variant="body2">
							Workspace
						</Typography>
						<Typography color="inherit" variant="subtitle1">
							GuestKart
						</Typography>
					</Box>
					<CaretUpDownIcon />
				</Box>
			</Stack>
			<Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
			<Box component="nav" sx={{ flex: "1 1 auto", p: "12px" }}>
				{renderNavItems({ pathname, items: navItems })}
			</Box>
			<Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
		</Box>
	);
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
	const children = items.map(({ key, ...rest }) => (
		<div key={key}>
			<NavItem key={""} pathname={pathname} {...rest} />
		</div>
	));

	return (
		<Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
			{children}
		</Stack>
	);
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
	pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
	const active = isNavItemActive({ disabled, external, href, matcher, pathname });
	const Icon = icon ? navIcons[icon] : null;

	return (
		<li>
			<Box
				{...(href
					? {
							component: external ? "a" : RouterLink,
							href,
							target: external ? "_blank" : undefined,
							rel: external ? "noreferrer" : undefined,
						}
					: { role: "button" })}
				sx={{
					alignItems: "center",
					borderRadius: 1,
					color: "var(--NavItem-color)",
					cursor: "pointer",
					display: "flex",
					flex: "0 0 auto",
					gap: 1,
					p: "6px 16px",
					position: "relative",
					textDecoration: "none",
					whiteSpace: "nowrap",
					...(disabled && {
						bgcolor: "var(--NavItem-disabled-background)",
						color: "var(--NavItem-disabled-color)",
						cursor: "not-allowed",
					}),
					...(active && { bgcolor: "var(--NavItem-active-background)", color: "var(--NavItem-active-color)" }),
				}}
			>
				<Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
					{Icon ? (
						<Icon
							fill={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
							fontSize="var(--icon-fontSize-md)"
							weight={active ? "fill" : undefined}
						/>
					) : null}
				</Box>
				<Box sx={{ flex: "1 1 auto" }}>
					<Typography
						component="span"
						sx={{ color: "inherit", fontSize: "0.875rem", fontWeight: 500, lineHeight: "28px" }}
					>
						{title}
					</Typography>
				</Box>
			</Box>
		</li>
	);
}
