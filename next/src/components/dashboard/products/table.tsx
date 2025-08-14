/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { PencilIcon } from "@phosphor-icons/react/dist/ssr/Pencil";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";

import { authClient } from "@/lib/auth/client";
import { useSelection } from "@/hooks/use-selection";

import { deleteBanner, getAllProducts, GetPermissions } from "../../../app/query-common";
import TableSkeletonLoader from "../loader/table-skeleton-loader";

function applyPagination<T>(rows: T[] = [], page: number, rowsPerPage: number): T[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

type CustomersTableProps = {
	search: string;
	setPermissionsData: any;
	setUserData: any;
};
export function TablePage({ search, setPermissionsData, setUserData }: CustomersTableProps): React.JSX.Element {
	const loginUser = localStorage.getItem("login_id");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const router = useRouter();
	const [user, setUser] = useState<any>(null);

	const [deleteDialog, setDeleteDialog] = React.useState({
		open: false,
		userId: null as string | null,
		userName: "",
	});
	const [snackbar, setSnackbar] = React.useState({
		open: false,
		message: "",
		severity: "success" as "success" | "error" | "warning" | "info",
	});

	useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
			setUserData(data);
		})();

		// emitUserUpdate();
	}, []);
	const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);
	// const variables = {
	// 	superadminId: loginUser,
	// 	subadminId: subAdmin || null,
	// 	search: search || null,
	// 	limit: rowsPerPage,
	// 	page: page + 1,
	// };

	React.useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
		})();
	}, []);
	const { data: permissionsData } = useQuery(GetPermissions, {
		variables: {
			subadminId: user?.id,
			superadminId: user?.superadmin_id,
		},
		fetchPolicy: "network-only",
	});
	const variables = {
		search: search,
		...(user?.role?.name === "superadmin"
			? {
					superadminId: loginUser,
					subadminId: null,
				}
			: user?.role?.name === "subadmin"
				? {
						superadminId: user?.superadmin_id,
						subadminId: loginUser,
					}
				: {}),
	};

	const { data, loading, error, refetch } = useQuery(getAllProducts, {
		variables,
		fetchPolicy: "network-only",
	});
	const modules = permissionsData?.getPermission?.modules?.banners;
	const handleData = () => {
		setPermissionsData(modules?.create);
	};
	React.useEffect(() => {
		refetch(variables);
		handleData();
	}, [search, page, rowsPerPage, handleData]);

	const [deleteUsers] = useMutation(deleteBanner, {
		refetchQueries: [{ query: getAllProducts, variables: { deleteBannerId: deleteDialog?.userId } }],
		onCompleted: (data) => {
			if (data.deleteBanner.success) {
				setSnackbar({
					open: true,
					message: `${data?.deleteBanner?.message}` || "deleted successfully!",
					severity: "success",
				});
				refetch(variables);
			} else {
				setSnackbar({
					open: true,
					message: data.deleteBanner.message || "Failed to delete user",
					severity: "error",
				});
			}
			setDeleteDialog({ open: false, userId: null, userName: "" });
		},
		onError: (error) => {
			setSnackbar({
				open: true,
				message: "Error deleting user: " + error.message,
				severity: "error",
			});
			setDeleteDialog({ open: false, userId: null, userName: "" });
		},
	});

	const rows = React.useMemo(() => {
		const users = data?.getAllProducts?.products ?? [];
		return applyPagination(users, page, rowsPerPage);
	}, [data, page, rowsPerPage]);
	console.log(rows);
	const rowIds = React.useMemo(() => rows.map((r: any) => r.id), [rows]);
	const { selected } = useSelection(rowIds);

	const totalCount = data?.getAllProducts?.total || 0;

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(Number.parseInt(event.target.value, 10));
		setPage(0); // reset to first page
	};

	const handleEditUser = (userId: string) => {
		router.push(`/dashboard/products/update/${userId}`);
	};

	const handleDeleteClick = (userId: string, userName: string) => {
		setDeleteDialog({
			open: true,
			userId,
			userName,
		});
	};

	const handleDeleteConfirm = async () => {
		if (!deleteDialog.userId) return;

		setDeletingUserId(deleteDialog.userId);

		try {
			await deleteUsers({
				variables: {
					deleteProductId: deleteDialog.userId,
				},
			});
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setDeletingUserId(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialog({ open: false, userId: null, userName: "" });
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	if (loading) {
		return <TableSkeletonLoader />;
	}

	if (error) {
		return (
			<Card>
				<Box sx={{ p: 3 }}>
					<Alert severity="error">Error loading users: {error.message}</Alert>
				</Box>
			</Card>
		);
	}
	// eslint-disable-next-line unicorn/consistent-function-scoping
	const getColorFromName = (name: string) => {
		if (!name) return "#000"; // default black

		const temp = document.createElement("div");
		temp.style.color = name;
		document.body.append(temp);

		const rgb = getComputedStyle(temp).color;
		temp.remove();

		// Agar naam galat hua toh black
		if (!rgb || (rgb === "rgb(0, 0, 0)" && name.toLowerCase() !== "black")) {
			return "#000";
		}

		// RGB → HEX conversion
		const match = rgb.match(/\d+/g);
		if (!match) return "#000";

		return `#${match.map((x) => Number.parseInt(x).toString(16).padStart(2, "0")).join("")}`;
	};
	return (
		<>
			<Card>
				<Box sx={{ overflowX: "auto" }}>
					<Table sx={{ minWidth: "1200px" }}>
						<TableHead>
							<TableRow>
								<TableCell>Images</TableCell>
								<TableCell>Name</TableCell>
								<TableCell>Price</TableCell>
								<TableCell>Stock</TableCell>
								<TableCell>Category</TableCell>
								<TableCell>Sizes</TableCell>
								<TableCell>Colors</TableCell>
								<TableCell>Extras</TableCell>
								<TableCell>Created By</TableCell>
								<TableCell align="center">Actions</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{rows.length === 0 ? (
								<TableRow>
									<TableCell colSpan={11} align="center">
										No data found
									</TableCell>
								</TableRow>
							) : (
								rows.map((row: any) => {
									const isSelected = selected.has(row.id);
									const isDeleting = deletingUserId === row.id;

									return (
										<TableRow hover key={row.id} selected={isSelected}>
											{/* Images */}
											<TableCell>
												<Stack direction="row" spacing={1} sx={{ overflowX: "auto", maxWidth: 180 }}>
													{row.images?.map((img: string, i: number) => (
														<Avatar
															key={i}
															src={`http://localhost:8000${img}`}
															variant="rounded"
															sx={{ width: 50, height: 50 }}
														/>
													))}
												</Stack>
											</TableCell>

											<TableCell>{row.name}</TableCell>
											<TableCell>₹{row.price}</TableCell>
											<TableCell>{row.stock}</TableCell>
											<TableCell>{row.category?.name}</TableCell>

											{/* Sizes */}
											<TableCell>{row.sizes?.map((size: any) => size.name).join(", ")}</TableCell>

											{/* Colors with label */}
											<TableCell>
												<Stack direction="row" spacing={1}>
													{row.colors?.map((color: any, i: number) => {
														const colorCode = getColorFromName(color.name);

														return (
															<Stack
																key={i}
																direction="row"
																spacing={1}
																alignItems="center"
																sx={{
																	border: "1px solid #ccc",
																	borderRadius: "8px",
																	padding: "2px 6px",
																}}
															>
																<Box
																	sx={{
																		width: 16,
																		height: 16,
																		borderRadius: "50%",
																		backgroundColor: colorCode,
																		border: "1px solid #999",
																	}}
																/>
																<Typography variant="body2">{color.name}</Typography>
															</Stack>
														);
													})}
												</Stack>
											</TableCell>

											{/* Extras */}
											<TableCell>{row.extras?.map((extra: any) => extra.name).join(", ")}</TableCell>

											<TableCell>
												{row?.createdBy?.name}
												{row?.createdBy?.role && (
													<span style={{ color: "#6b7280", fontSize: "0.875rem", marginLeft: 6 }}>
														({row.createdBy.role})
													</span>
												)}
											</TableCell>
											{/* Actions (original conditional logic) */}
											<TableCell align="center">
												<Stack direction="row" spacing={1} justifyContent="center">
													{user?.role?.name === "superadmin" ? (
														<>
															<Tooltip title="Edit User">
																<IconButton
																	onClick={() => handleEditUser(row.id)}
																	color="primary"
																	size="small"
																	disabled={isDeleting}
																>
																	<PencilIcon fontSize="var(--icon-fontSize-sm)" />
																</IconButton>
															</Tooltip>
															<Tooltip title="Delete User">
																<IconButton
																	onClick={() => handleDeleteClick(row.id, row.name)}
																	color="error"
																	size="small"
																	disabled={isDeleting}
																>
																	{isDeleting ? (
																		<CircularProgress size={16} />
																	) : (
																		<TrashIcon fontSize="var(--icon-fontSize-sm)" />
																	)}
																</IconButton>
															</Tooltip>
														</>
													) : (
														<>
															{modules?.update && (
																<Tooltip title="Edit User">
																	<IconButton
																		onClick={() => handleEditUser(row.id)}
																		color="primary"
																		size="small"
																		disabled={isDeleting}
																	>
																		<PencilIcon fontSize="var(--icon-fontSize-sm)" />
																	</IconButton>
																</Tooltip>
															)}
															{modules?.delete && (
																<Tooltip title="Delete User">
																	<IconButton
																		onClick={() => handleDeleteClick(row.id, row.name)}
																		color="error"
																		size="small"
																		disabled={isDeleting}
																	>
																		{isDeleting ? (
																			<CircularProgress size={16} />
																		) : (
																			<TrashIcon fontSize="var(--icon-fontSize-sm)" />
																		)}
																	</IconButton>
																</Tooltip>
															)}
														</>
													)}
												</Stack>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</Box>
				<Divider />
				<TablePagination
					component="div"
					count={totalCount}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={handlePageChange}
					onRowsPerPageChange={handleRowsPerPageChange}
					rowsPerPageOptions={[5, 10, 25]}
				/>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialog.open}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-description"
			>
				<DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-dialog-description">
						Are you sure you want to delete products &quot;<strong>{deleteDialog.userName}</strong>&quot;? This action
						cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
						disabled={deletingUserId !== null}
						startIcon={deletingUserId && <CircularProgress size={16} />}
					>
						{deletingUserId ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Success/Error Snackbar */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleSnackbarClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}
