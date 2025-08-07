/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
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
import Typography from "@mui/material/Typography";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { PencilIcon } from "@phosphor-icons/react/dist/ssr/Pencil";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import dayjs from "dayjs";

import { useSelection } from "@/hooks/use-selection";

import { deleteUser, GetUsersBySuperadmin } from "../../../app/QueryCommon";

function applyPagination<T>(rows: T[] = [], page: number, rowsPerPage: number): T[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export function CustomersTable(): React.JSX.Element {
	const loginUser = localStorage.getItem("login_id");
	const [deleteUsers] = useMutation(deleteUser, {
		refetchQueries: [{ query: GetUsersBySuperadmin, variables: { superadminId: loginUser } }],
		onCompleted: (data) => {
			if (data.deleteUser.success) {
				setSnackbar({
					open: true,
					message: "User deleted successfully!",
					severity: "success",
				});
			} else {
				setSnackbar({
					open: true,
					message: data.deleteUser.message || "Failed to delete user",
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

	const { data, loading, error } = useQuery(GetUsersBySuperadmin, {
		variables: { superadminId: loginUser },
		fetchPolicy: "network-only",
	});

	const router = useRouter();

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
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
	const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);

	const rows = React.useMemo(() => {
		const users = data?.getUsersBySuperadmin?.users ?? [];
		return applyPagination(users, page, rowsPerPage);
	}, [data, page, rowsPerPage]);

	const rowIds = React.useMemo(() => rows.map((r: any) => r.id), [rows]);
	const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

	const selectedSome = selected.size > 0 && selected.size < rows.length;
	const selectedAll = rows.length > 0 && selected.size === rows.length;

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(Number.parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleNavigate = (row: any) => {
		router.push(`/dashboard/customers/permission/${row}`);
	};

	const handleEditUser = (userId: string) => {
		router.push(`/dashboard/customers/update/${userId}`);
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
					deleteUserId: deleteDialog.userId,
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
		return (
			<Card>
				<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
					<CircularProgress />
				</Box>
			</Card>
		);
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

	return (
		<>
			<Card>
				<Box sx={{ overflowX: "auto" }}>
					<Table sx={{ minWidth: "800px" }}>
						<TableHead>
							<TableRow>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedAll}
										indeterminate={selectedSome}
										onChange={(event) => {
											if (event.target.checked) selectAll();
											else deselectAll();
										}}
									/>
								</TableCell>
								<TableCell>Name</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>Country</TableCell>
								<TableCell>Phone</TableCell>
								<TableCell>Signed Up</TableCell>
								<TableCell align="center">Permission</TableCell>
								<TableCell align="center">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row: any) => {
								const isSelected = selected.has(row.id);
								const isDeleting = deletingUserId === row.id;

								return (
									<TableRow hover key={row.id} selected={isSelected}>
										<TableCell padding="checkbox">
											<Checkbox
												checked={isSelected}
												onChange={(event) => (event.target.checked ? selectOne(row.id) : deselectOne(row.id))}
											/>
										</TableCell>
										<TableCell>
											<Stack direction="row" spacing={2} alignItems="center">
												<Avatar src={`http://localhost:8000${row?.image}`} />
												<Typography variant="subtitle2">{row.name}</Typography>
											</Stack>
										</TableCell>
										<TableCell>{row.email}</TableCell>
										<TableCell>{row.country ?? "-"}</TableCell>
										<TableCell>{row.phone}</TableCell>
										<TableCell>{dayjs(row.createdAt).format("MMM D, YYYY")}</TableCell>
										<TableCell align="center">
											<Tooltip title="Manage Permissions">
												<IconButton onClick={() => handleNavigate(row.id)} color="primary" size="small">
													<GearSixIcon fontSize="var(--icon-fontSize-md)" />
												</IconButton>
											</Tooltip>
										</TableCell>
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
							})}
						</TableBody>
					</Table>
				</Box>
				<Divider />
				<TablePagination
					component="div"
					count={data?.getUsersBySuperadmin?.users?.length ?? 0}
					onPageChange={handlePageChange}
					onRowsPerPageChange={handleRowsPerPageChange}
					page={page}
					rowsPerPage={rowsPerPage}
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
						Are you sure you want to delete user &quot;<strong>{deleteDialog.userName}</strong>&quot;? This action
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
