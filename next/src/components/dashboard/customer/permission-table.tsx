"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { Button, Switch } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { showToast } from "@/hooks/toast-message"; // adjust the path accordingly

import { creaOrUpdatePermission, GetPermissions } from "../../../app/query-common";

export function PermissionTable(): React.JSX.Element {
	const [createOrUpdatePermissions] = useMutation(creaOrUpdatePermission);

	const loginUser = localStorage.getItem("login_id");
	const params = useParams();
	const id = params?.id as string;

	const { data } = useQuery(GetPermissions, {
		variables: { subadminId: id, superadminId: loginUser },
		fetchPolicy: "network-only",
	});

	const originalModules = React.useMemo(() => {
		const modules = { ...data?.getPermission?.modules };
		delete modules?.__typename;

		const cleanedModules: any = {};
		for (const [moduleName, perms] of Object.entries(modules || {})) {
			cleanedModules[moduleName] = {};
			for (const [key, value] of Object.entries(perms as any)) {
				if (key !== "__typename") cleanedModules[moduleName][key] = value;
			}
		}
		return cleanedModules;
	}, [data]);

	const [modulesState, setModulesState] = React.useState<any>({});

	React.useEffect(() => {
		if (Object.keys(originalModules).length > 0) {
			setModulesState(originalModules);
		}
	}, [originalModules]);

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const moduleEntries = Object.entries(modulesState);
	const paginatedRows = moduleEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	const handleToggle = (moduleName: string, permissionKey: string) => {
		setModulesState((prev: any) => ({
			...prev,
			[moduleName]: {
				...prev[moduleName],
				[permissionKey]: !prev[moduleName][permissionKey],
			},
		}));
	};

	const handleSubmit = async () => {
		const payload = {
			subadminId: id,
			superadminId: loginUser,
			modules: modulesState,
		};

		try {
			const { data } = await createOrUpdatePermissions({
				variables: payload,
			});
			showToast({ message: "Permissions granted successfully.", type: "success" });
			console.log("Server Response:", data);
			// success message dikhaye
		} catch (error) {
			console.error("Error submitting permissions:", error);
		}
	};

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(Number.parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Card>
			<Box sx={{ overflowX: "auto" }}>
				<Table sx={{ minWidth: "800px" }}>
					<TableHead>
						<TableRow>
							<TableCell>Modules</TableCell>
							<TableCell>Create</TableCell>
							<TableCell>Update</TableCell>
							<TableCell>View</TableCell>
							<TableCell>Delete</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedRows.map(([moduleName, perms]: any) => (
							<TableRow key={moduleName} hover>
								<TableCell>
									<Typography variant="subtitle2">{moduleName}</Typography>
								</TableCell>
								{["create", "update", "view", "delete"].map((permKey) => (
									<TableCell key={permKey}>
										{permKey in perms ? (
											<Switch
												color="primary"
												checked={!!perms[permKey]}
												onChange={() => handleToggle(moduleName, permKey)}
											/>
										) : (
											<Typography color="text.secondary">
												<Switch color="primary" checked={true} />
											</Typography>
										)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Box>

			<Divider />

			<TablePagination
				component="div"
				count={moduleEntries.length}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
				page={page}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
			/>

			<Box display="flex" justifyContent="flex-end" p={2}>
				<Button variant="contained" color="primary" onClick={handleSubmit}>
					Update Permissions
				</Button>
			</Box>
		</Card>
	);
}
