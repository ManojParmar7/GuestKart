// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import Button from "@mui/material/Button";
// import Stack from "@mui/material/Stack";
// import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

// import { CustomersFilters } from "@/components/dashboard/customer/customers-filters";
// import { CustomersTable } from "@/components/dashboard/customer/customers-table";

// export default function ClientPage(): React.JSX.Element {
// 	const router = useRouter();

// 	return (
// 		<Stack spacing={3}>
// 			<Stack direction="row" spacing={3}>
// 				<Stack spacing={1} sx={{ flex: "1 1 auto" }}></Stack>
// 				<div>
// 					<Button
// 						onClick={() => router.push(`/dashboard/customers/create`)}
// 						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
// 						variant="contained"
// 					>
// 						Add
// 					</Button>
// 				</div>
// 			</Stack>
// 			<CustomersFilters />
// 			<CustomersTable />
// 		</Stack>
// 	);
// }
// client-page.tsx
"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

import { CustomersFilters } from "@/components/dashboard/customer/customers-filters";
import { CustomersTable } from "@/components/dashboard/customer/customers-table";

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
						onClick={() => router.push(`/dashboard/customers/create`)}
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
					>
						Add
					</Button>
				</div>
			</Stack>

			{/* Filters */}
			<CustomersFilters onSearch={setFilterText} />

			{/* Table with filters passed */}
			<CustomersTable search={filterText} />
		</Stack>
	);
}
