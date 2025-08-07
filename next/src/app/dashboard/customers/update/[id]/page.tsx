import * as React from "react";
import type { Metadata } from "next";
import Stack from "@mui/material/Stack";

import { config } from "@/config";
import { UpdateForm } from "@/components/dashboard/customer/updated-from";

export const metadata = { title: `Settings | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
	return (
		<Stack spacing={3}>
			<UpdateForm />
		</Stack>
	);
}
