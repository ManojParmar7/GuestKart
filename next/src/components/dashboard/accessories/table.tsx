/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
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

import { deleteExtra, getExtras } from "../../../app/query-common";
import TableSkeletonLoader from "../loader/table-skeleton-loader";

function applyPagination<T>(rows: T[] = [], page: number, rowsPerPage: number): T[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

type CustomersTableProps = {
	search: string;
};
export function TablePage({ search }: CustomersTableProps): React.JSX.Element {
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const loginUser = localStorage.getItem("login_id");

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
		})();
		// emitUserUpdate();
	}, []);
	const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);

	React.useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
		})();
	}, []);

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

	const { data, loading, error, refetch } = useQuery(getExtras, {
		variables,
		fetchPolicy: "network-only",
	});

	React.useEffect(() => {
		refetch(variables);
	}, [search, page, rowsPerPage]);

	const [deleteCategory] = useMutation(deleteExtra, {
		refetchQueries: [{ query: getExtras, variables: { deleteExtraId: deleteDialog?.userId } }],
		onCompleted: (data) => {
			if (data.deleteExtra?.success) {
				setSnackbar({
					open: true,
					message: `${data?.deleteExtra?.message}` || "deleted successfully!",
					severity: "success",
				});
				refetch(variables);
			} else {
				setSnackbar({
					open: true,
					message: data.deleteExtra?.message || "Failed to delete user",
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
		const extra = data?.getExtras?.extras ?? [];
		return applyPagination(extra, page, rowsPerPage);
	}, [data, page, rowsPerPage]);
	console.log(rows);
	const rowIds = React.useMemo(() => rows.map((r: any) => r.id), [rows]);
	const { selected } = useSelection(rowIds);

	const totalCount = data?.getExtras?.totalCount || 0;

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(Number.parseInt(event.target.value, 10));
		setPage(0); // reset to first page
	};

	const handleEditUser = (userId: string) => {
		router.push(`/dashboard/accessories/update/${userId}`);
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
			await deleteCategory({
				variables: {
					deleteExtraId: deleteDialog.userId,
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

	return (
		<>
			<Card>
				<Box sx={{ overflowX: "auto" }}>
					<Table sx={{ minWidth: "800px" }}>
						<TableHead>
							<TableRow>
								<TableCell> Name</TableCell>
								<TableCell> Price</TableCell>
								{user?.role?.name === "superadmin" && <TableCell>Created By</TableCell>}
								<TableCell align="center">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} align="center">
										No data found
									</TableCell>
								</TableRow>
							) : (
								rows.map((row: any) => {
									const isSelected = selected.has(row.id);
									const isDeleting = deletingUserId === row.id;

									return (
										<TableRow hover key={row?.id} selected={isSelected}>
											<TableCell>
												<Stack direction="row" spacing={1}>
													<Typography variant="body2">{row?.name}</Typography>
												</Stack>
											</TableCell>

											<TableCell>{row?.price ?? "-"}</TableCell>
											{user?.role?.name === "superadmin" && (
												<TableCell>
													{row?.createdBy?.name}
													{row?.createdBy?.role && (
														<span style={{ color: "#6b7280", fontSize: "0.875rem", marginLeft: 6 }}>
															({row.createdBy.role})
														</span>
													)}
												</TableCell>
											)}

											<TableCell align="center">
												<Stack direction="row" spacing={1} justifyContent="center">
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
						Are you sure you want to delete color &quot;<strong>{deleteDialog.userName}</strong>&quot;? This action
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
