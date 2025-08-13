"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

import { Filters } from "@/components/dashboard/roles/filters";
import { TablePage } from "@/components/dashboard/roles/table";

export default function ClientPage(): React.JSX.Element {
	const router = useRouter();
	const [filterText, setFilterText] = useState("");
	const [permissionsData, setPermissionsData] = useState([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [userData, setUserData] = useState<any>([]);

	return (
		<Stack spacing={3}>
			{/* Header */}
			<Stack direction="row" spacing={3}>
				<Stack spacing={1} sx={{ flex: "1 1 auto" }} />
				<div>
					<Button
						onClick={() => router.push(`/dashboard/roles/create`)}
						startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
						variant="contained"
						disabled={userData?.role?.name !== "superadmin" && !permissionsData}
					>
						Add
					</Button>
				</div>
			</Stack>

			{/* Filters */}
			<Filters onSearch={setFilterText} />

			{/* Table with filters passed */}
			<TablePage search={filterText} setPermissionsData={setPermissionsData} setUserData={setUserData} />
		</Stack>
	);
}
