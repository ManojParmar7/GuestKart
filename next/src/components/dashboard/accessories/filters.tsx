"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";

type Props = {
	onSearch: (value: string) => void;
};

export function Filters({ onSearch }: Props): React.JSX.Element {
	const [search, setSearch] = React.useState("");

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearch(value);
		onSearch(value); // pass to parent
	};

	return (
		<Card sx={{ p: 2 }}>
			<OutlinedInput
				value={search}
				onChange={handleSearchChange}
				fullWidth
				placeholder="Search Accessories Name"
				startAdornment={
					<InputAdornment position="start">
						<MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
					</InputAdornment>
				}
				sx={{ maxWidth: "500px" }}
			/>
		</Card>
	);
}
