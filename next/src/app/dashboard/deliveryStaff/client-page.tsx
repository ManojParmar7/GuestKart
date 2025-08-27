"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

import { DeliveryStaffFilters } from "@/components/dashboard/deliveryStaff/customers-filters";
import { DeliveryStaffTable } from "@/components/dashboard/deliveryStaff/customers-table";

export default function ClientPage(): React.JSX.Element {
	const router = useRouter();
	const [filterText, setFilterText] = useState("");

	return (
		<Stack spacing={3}>
			{/* Header */}
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }} />
				<div>
					<Button
						onClick={() => router.push(`/dashboard/deliveryStaff/create`)}
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
					>
						Add
					</Button>
				</div>
			</Stack>

			{/* Filters */}
			<DeliveryStaffFilters onSearch={setFilterText} />

			{/* Table with filters passed */}
			<DeliveryStaffTable search={filterText} />
		</Stack>
	);
}
