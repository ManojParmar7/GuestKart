import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { Eyedropper } from "@phosphor-icons/react/dist/ssr/Eyedropper";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { ImageSquare } from "@phosphor-icons/react/dist/ssr/ImageSquare";
import { PackageIcon } from "@phosphor-icons/react/dist/ssr/Package";
import { PlugsConnectedIcon } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
import { Ruler } from "@phosphor-icons/react/dist/ssr/Ruler";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr/ShoppingBag";
import { SquaresFour } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { UserGear } from "@phosphor-icons/react/dist/ssr/UserGear";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";

export const navIcons = {
	"chart-pie": ChartPieIcon,
	"gear-six": GearSixIcon,
	"plugs-connected": PlugsConnectedIcon,
	"x-square": XSquare,
	"image-square": ImageSquare,
	"squares-four": SquaresFour,
	product: PackageIcon,
	size: Ruler,
	color: Eyedropper,
	accessories: ShoppingBag,
	user: UserIcon,
	users: UsersIcon,
	category: SquaresFour,
	roles: UserGear,
} as Record<string, Icon>;
