"use client";

import { useState } from "react";
import * as React from "react";
import Stack from "@mui/material/Stack";

import { Filters } from "@/components/dashboard/orders/filters";
import { TablePage } from "@/components/dashboard/orders/table";

export default function ClientPage(): React.JSX.Element {
	const [filterText, setFilterText] = useState("");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	return (
		<Stack spacing={3}>
			{/* Header */}
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }} />
			</Stack>

			{/* Filters */}
			<Filters onSearch={setFilterText} />

			{/* Table with filters passed */}
			<TablePage search={filterText} />
		</Stack>
	);
}
