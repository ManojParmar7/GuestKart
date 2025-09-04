/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import CancelIcon from "@mui/icons-material/Cancel";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	MenuItem,
	Paper,
	Snackbar,
	Stack,
	Step,
	StepLabel,
	Stepper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";

import { authClient } from "@/lib/auth/client";

// eslint-disable-next-line import/namespace
import { deleteBanner, GetUsersBySuperadmin } from "../../../app/query-common";
import TableSkeletonLoader from "../loader/table-skeleton-loader";
import { acceptOrder, assignDeliveryBoy, cancelOrder, getAllOrders } from "./commonquery";

function applyPagination<T>(rows: T[] = [], page: number, rowsPerPage: number): T[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

type OrdersTableProps = {
	search: string;
	setPermissionsData: any;
	setUserData: any;
};

export function TablePage({ search, setUserData }: OrdersTableProps): React.JSX.Element {
	const loginUser = localStorage.getItem("login_id");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [user, setUser] = useState<any>(null);
	// All possible statuses in order
	const steps = ["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
	// eslint-disable-next-line unicorn/consistent-function-scoping
	const getActiveStep = (status: string) => {
		switch (status) {
			case "ACCEPTED": {
				return 1;
			}
			case "PICKED_UP": {
				return 2;
			}
			case "OUT_FOR_DELIVERY": {
				return 3;
			}
			case "DELIVERED": {
				return 4;
			}
			default: {
				return -1;
			} // for cancelled or not started
		}
	};
	// Function: find active step

	// for cancelled or not starte
	const [deleteDialog, setDeleteDialog] = React.useState({
		open: false,
		orderId: null as string | null,
		orderName: "",
	});
	const [snackbar, setSnackbar] = React.useState({
		open: false,
		message: "",
		severity: "success" as "success" | "error" | "warning" | "info",
	});
	const [deletingOrderId, setDeletingOrderId] = React.useState<string | null>(null);

	useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
			setUserData(data);
		})();
	}, []);

	const variables = {
		search: search,
		...(user?.role?.name === "superadmin"
			? { superadminId: loginUser, subadminId: null }
			: user?.role?.name === "subadmin"
				? { superadminId: user?.superadmin_id, subadminId: loginUser }
				: {}),
	};

	const { data, loading, error, refetch } = useQuery(getAllOrders, {
		variables,
		fetchPolicy: "network-only",
	});

	React.useEffect(() => {
		refetch(variables);
	}, [search, page, rowsPerPage]);

	const deliveryBoyVariables = {
		filters: {
			name: search || null,
			email: null,
		},
		roleName: "deliveryBoy",

		...(user?.role?.name === "superadmin"
			? { superadminId: loginUser, subadminId: null }
			: user?.role?.name === "subadmin"
				? { superadminId: user?.superadmin_id, subadminId: loginUser }
				: {}),
	};

	const { data: deliveryBoyData, refetch: refetchDeliveryBoy } = useQuery(GetUsersBySuperadmin, {
		variables: deliveryBoyVariables,
		fetchPolicy: "network-only",
	});
	console.log("-=-=-=-=deliveryBoyData", deliveryBoyData);
	React.useEffect(() => {
		refetchDeliveryBoy(deliveryBoyVariables);
	}, [search, page, rowsPerPage]);
	const [deleteOrder] = useMutation(deleteBanner, {
		refetchQueries: [{ query: getAllOrders }],
		onCompleted: (data) => {
			if (data.deleteBanner.success) {
				setSnackbar({
					open: true,
					message: data.deleteBanner.message || "Order deleted successfully!",
					severity: "success",
				});
				refetch(variables);
			} else {
				setSnackbar({
					open: true,
					message: data.deleteBanner.message || "Failed to delete order",
					severity: "error",
				});
			}
			setDeleteDialog({ open: false, orderId: null, orderName: "" });
		},
		onError: (error) => {
			setSnackbar({
				open: true,
				message: "Error deleting order: " + error.message,
				severity: "error",
			});
			setDeleteDialog({ open: false, orderId: null, orderName: "" });
		},
	});

	const rows = React.useMemo(() => {
		const orders = data?.getAllOrders?.data ?? [];
		return applyPagination(orders, page, rowsPerPage);
	}, [data, page, rowsPerPage]);

	const totalCount = data?.getAllOrders?.total || 0;

	const handlePageChange = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(Number.parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleDeleteClick = (orderId: string, orderName: string) => {
		setDeleteDialog({
			open: true,
			orderId,
			orderName,
		});
	};

	const handleDeleteConfirm = async () => {
		if (!deleteDialog.orderId) return;
		setDeletingOrderId(deleteDialog.orderId);

		try {
			await deleteOrder({
				variables: {
					deleteProductId: deleteDialog.orderId,
				},
			});
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setDeletingOrderId(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialog({ open: false, orderId: null, orderName: "" });
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const [assignBoy] = useMutation(assignDeliveryBoy, {
		onCompleted: () => {
			refetch(variables);
			setSnackbar({
				open: true,
				message: "Delivery boy assigned successfully",
				severity: "success",
			});
		},
		onError: (error) => {
			setSnackbar({
				open: true,
				message: "Failed to assign delivery boy: " + error.message,
				severity: "error",
			});
		},
	});
	const [acceptOrders] = useMutation(acceptOrder, {
		onCompleted: () => {
			refetch(variables);
			setSnackbar({
				open: true,
				message: "Accept Order successfully",
				severity: "success",
			});
		},
		onError: (error) => {
			setSnackbar({
				open: true,
				message: "Failed to Accept Order: " + error.message,
				severity: "error",
			});
		},
	});

	const [cancelOrders] = useMutation(cancelOrder, {
		onCompleted: () => {
			refetch(variables);
			setSnackbar({
				open: true,
				message: "Cancelled Order successfully",
				severity: "success",
			});
		},
		onError: (error) => {
			setSnackbar({
				open: true,
				message: "Failed to Accept Order: " + error.message,
				severity: "error",
			});
		},
	});
	const handleUpdateOrderStatus = (orderId: any) => {
		acceptOrders({
			variables: {
				orderId: orderId,
				...(user?.role?.name === "superadmin"
					? { superadminId: loginUser }
					: user?.role?.name === "subadmin"
						? { superadminId: user?.superadmin_id, subadminId: loginUser }
						: {}),
			},
		});
	};
	const handleUpdateCancelOrderStatus = (orderId: any) => {
		cancelOrders({
			variables: {
				orderId: orderId,
				...(user?.role?.name === "superadmin"
					? { superadminId: loginUser }
					: user?.role?.name === "subadmin"
						? { superadminId: user?.superadmin_id, subadminId: loginUser }
						: {}),
			},
		});
	};
	const handleAssignDeliveryBoy = (orderId: any, deliveryBoyId: string) => {
		assignBoy({
			variables: {
				orderId: orderId,
				deliveryBoyId: deliveryBoyId,
			},
		});
	};
	if (loading) {
		return <TableSkeletonLoader />;
	}

	// if (error) {
	// 	return (
	// 		<Card>
	// 			<Box sx={{ p: 3 }}>
	// 				<Alert severity="error">Error loading orders: {error.message}</Alert>
	// 			</Box>
	// 		</Card>
	// 	);
	// }
	const statusColorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> =
		{
			PLACED: "secondary", // Just placed
			PENDING: "warning", // Waiting for payment
			CONFIRMED: "info", // Payment confirmed
			APPROVED: "primary", // Approved by admin
			PACKED: "info", // Packed, ready for dispatch
			ASSIGNED: "primary", // Assigned to delivery boy
			OUT_FOR_DELIVERY: "warning", // Delivery in progress
			DELIVERED: "success", // Completed successfully
			CANCELLED: "error", // Cancelled by user/admin
			REJECTED: "error", // Explicitly rejected
			RETURN_REQUESTED: "warning", // Customer requested return
			RETURNED: "info", // Return processed
			REFUNDED: "success", // Refund successful
			FAILED: "error", // Payment failed
			SHIPPED: "primary", // Shipped from warehouse
		};

	return (
		<>
			<Card>
				<Box sx={{ overflowX: "auto" }}>
					<Table sx={{ minWidth: "1200px" }}>
						<TableHead>
							<TableRow>
								<TableCell>Customer</TableCell>
								<TableCell>Items</TableCell>
								<TableCell>Total</TableCell>
								<TableCell>Discount</TableCell>
								<TableCell>Final</TableCell>
								<TableCell>Payment</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Delivery Person</TableCell>
								<TableCell align="center">Actions</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{rows?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} align="center">
										No orders found
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row: any) => {
									return (
										<TableRow hover key={row?.id}>
											{/* Customer */}
											<TableCell>
												<Typography fontWeight="bold">{row?.contactInfo?.name}</Typography>
												<Typography variant="body2" color="text.secondary">
													{row?.contactInfo?.phone}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{row?.contactInfo?.address}
												</Typography>
											</TableCell>

											{/* Items */}
											<TableCell>
												<Stack spacing={1}>
													{row?.items?.map((item: any, i: number) => (
														<Tooltip
															key={i}
															arrow
															placement="top"
															title={
																<Paper sx={{ p: 2, maxWidth: 320 }}>
																	{/* Product Header */}
																	<Stack direction="row" spacing={2} alignItems="center">
																		<Avatar
																			src={`${process.env.NEXT_PUBLIC_API_URL}${item.product?.images?.[0]}`}
																			variant="rounded"
																			sx={{ width: 48, height: 48 }}
																		/>
																		<Box>
																			<Typography variant="subtitle1" fontWeight="bold">
																				{item.product?.name}
																			</Typography>
																			<Typography variant="body2" color="text.secondary">
																				Qty: {item.quantity} × ₹{item.product?.price}
																			</Typography>
																		</Box>
																	</Stack>

																	<Divider sx={{ my: 1 }} />

																	{/* Sizes */}
																	{item?.selectedOptions?.size && (
																		<Box mb={1}>
																			<Typography variant="body2" fontWeight="bold">
																				Sizes:
																			</Typography>
																			<Stack direction="row" spacing={1} flexWrap="wrap">
																				{/* {item?.selectedOptions?.size.map((s: any) => ( */}
																				<Chip
																					key={item?.selectedOptions?.size?.id}
																					size="small"
																					label={item?.selectedOptions?.size?.name}
																				/>
																				{/* ))} */}
																			</Stack>
																		</Box>
																	)}

																	{/* Colors */}
																	{item?.selectedOptions?.color && (
																		<Box mb={1}>
																			<Typography variant="body2" fontWeight="bold">
																				Colors:
																			</Typography>
																			<Stack direction="row" spacing={1} flexWrap="wrap">
																				<Chip
																					key={item?.selectedOptions?.color?.id}
																					size="small"
																					label={item?.selectedOptions?.color?.name}
																				/>
																			</Stack>
																		</Box>
																	)}

																	{/* Extras */}
																	{item?.selectedOptions?.extras?.length > 0 && (
																		<Box mb={1}>
																			<Typography variant="body2" fontWeight="bold">
																				Extras:
																			</Typography>
																			<Stack direction="row" spacing={1} flexWrap="wrap">
																				{item.selectedOptions?.extras.map((ex: any) => (
																					<Chip key={ex.id} size="small" label={ex.name} />
																				))}
																			</Stack>
																		</Box>
																	)}

																	{/* Stock & Discount */}

																	{item.product?.discountPrice && (
																		<Typography variant="body2" color="error">
																			<strong>Discount Price:</strong> ₹{item.product?.discountPrice}
																		</Typography>
																	)}

																	<Divider sx={{ my: 1 }} />

																	{/* Final Amount */}
																	<Typography variant="subtitle1" fontWeight="bold" textAlign="right">
																		Final Amount: ₹{item.quantity * item.product?.price}
																	</Typography>
																</Paper>
															}
														>
															<Stack direction="row" spacing={1} alignItems="center">
																<Avatar
																	src={`${process.env.NEXT_PUBLIC_API_URL}${item.product?.images?.[0]}`}
																	variant="rounded"
																	sx={{ width: 40, height: 40 }}
																/>
																<Box>
																	<Typography>{item.product?.name}</Typography>
																	<Typography variant="body2" color="text.secondary">
																		Qty: {item.quantity} × ₹{item.product?.price}
																	</Typography>
																</Box>
															</Stack>
														</Tooltip>
													))}
												</Stack>
											</TableCell>

											<TableCell>₹{row?.totalAmount}</TableCell>
											<TableCell>₹{row?.discountAmount}</TableCell>
											<TableCell>
												<Typography fontWeight="bold">₹{row?.finalAmount}</Typography>
											</TableCell>

											<TableCell>
												<Chip
													label={row?.paymentMethod}
													color={row?.paymentMethod === "COD" ? "default" : "primary"}
													size="small"
													sx={{ mr: 1 }}
												/>
												<Chip
													label={row?.paymentStatus}
													color={row?.paymentStatus === "PAID" ? "success" : "warning"}
													size="small"
												/>
											</TableCell>

											<TableCell>
												<Chip
													label={row?.orderStatus?.replace(/_/g, " ")}
													color={statusColorMap[row?.orderStatus] || "default"}
													size="small"
													variant="outlined"
													sx={{
														fontWeight: 600,
														textTransform: "capitalize",
														borderRadius: "8px",
														px: 1,
														py: 0.5,
													}}
												/>
											</TableCell>

											<TableCell>
												{row.orderStatus === "PLACED" || row.orderStatus === "CANCELLED" ? (
													<Box display="flex" justifyContent="center">
														<Typography>-</Typography>
													</Box>
												) : row.deliveryBoy && row.deliveryStatus !== "CANCELLED" ? (
													<Tooltip
														arrow
														placement="top"
														componentsProps={{
															tooltip: {
																sx: {
																	bgcolor: "background.paper",
																	color: "text.primary",
																	boxShadow: 3,
																	p: 2,
																	borderRadius: 2,
																	maxWidth: 400,
																},
															},
														}}
														title={
															<Box>
																{/* Delivery boy info */}
																<Stack direction="row" spacing={2} alignItems="center">
																	<Avatar
																		src={`${process.env.NEXT_PUBLIC_API_URL}${row.deliveryBoy?.image}`}
																		sx={{ width: 40, height: 40 }}
																	/>
																	<Box>
																		<Typography variant="subtitle1" fontWeight="bold">
																			{row.deliveryBoy?.name}
																		</Typography>
																		<Typography variant="body2" color="text.secondary">
																			{row.deliveryBoy?.phone}
																		</Typography>
																	</Box>
																</Stack>

																{/* Delivery Status Steps */}
																{row.deliveryStatus === "CANCELLED" ? (
																	<Box mt={2}>
																		<Typography variant="body2" color="error">
																			❌ Cancelled
																		</Typography>
																	</Box>
																) : (
																	<Box mt={2}>
																		<Stepper activeStep={getActiveStep(row.deliveryStatus)} alternativeLabel>
																			{steps?.map((label) => (
																				<Step key={label}>
																					<StepLabel>{label.replaceAll("_", " ")}</StepLabel>
																				</Step>
																			))}
																		</Stepper>
																	</Box>
																)}
															</Box>
														}
													>
														{/* Trigger UI */}
														<Stack direction="row" spacing={1} alignItems="center">
															<Avatar
																src={`${process.env.NEXT_PUBLIC_API_URL}${row.deliveryBoy?.image}`}
																sx={{ width: 32, height: 32 }}
															/>
															<Box>
																<Typography>{row.deliveryBoy?.name || "Not Assigned"}</Typography>
																<Typography variant="body2" color="text.secondary">
																	{row.deliveryBoy?.phone}
																</Typography>
															</Box>
														</Stack>
													</Tooltip>
												) : row.deliveryStatus === "CANCELLED" && row.deliveryBoy ? (
													<Box>
														<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
															<Avatar
																src={`${process.env.NEXT_PUBLIC_API_URL}${row.deliveryBoy?.image}`}
																sx={{ width: 32, height: 32 }}
															/>
															<Box>
																<Typography>{row.deliveryBoy?.name}</Typography>
																<Typography variant="body2" color="text.secondary">
																	{row.deliveryBoy?.phone}
																</Typography>
																<Typography variant="caption" color="error">
																	Cancelled by this delivery boy
																</Typography>
															</Box>
														</Stack>

														<TextField
															fullWidth
															select
															label="Reassign Delivery Boy"
															onChange={(e) => handleAssignDeliveryBoy(row?.id, e.target.value)}
															defaultValue=""
														>
															<MenuItem value="">Select Delivery Boy</MenuItem>
															{deliveryBoyData?.getUsersBySuperadmin?.users.map((boy: any) => (
																<MenuItem key={boy.id} value={boy.id}>
																	{boy.name}
																</MenuItem>
															))}
														</TextField>
													</Box>
												) : (
													<TextField
														fullWidth
														select
														label="Select Delivery Boy"
														onChange={(e) => handleAssignDeliveryBoy(row?.id, e.target.value)}
														defaultValue=""
													>
														<MenuItem value="">Select Delivery Boy</MenuItem>
														{deliveryBoyData?.getUsersBySuperadmin?.users.map((boy: any) => (
															<MenuItem key={boy.id} value={boy.id}>
																{boy.name}
															</MenuItem>
														))}
													</TextField>
												)}
											</TableCell>

											{/* Actions */}
											<TableCell align="center">
												{row.orderStatus === "PLACED" ? (
													<Stack direction="row" spacing={1} justifyContent="center">
														{/* ✅ Accept Button */}
														<Tooltip title="Accept Order">
															<IconButton onClick={() => handleUpdateOrderStatus(row.id)} color="success" size="small">
																<CheckCircleIcon sx={{ fontSize: 35 }} />
															</IconButton>
														</Tooltip>

														<Tooltip title="Reject Order">
															<IconButton
																onClick={() => handleUpdateCancelOrderStatus(row.id)}
																color="error"
																size="small"
															>
																<CancelIcon sx={{ fontSize: 22 }} />
															</IconButton>
														</Tooltip>
													</Stack>
												) : (
													<>
														<Stack direction="row" spacing={1} justifyContent="center">
															<Tooltip title="Delete Order">
																<IconButton
																	onClick={() => handleDeleteClick(row.id, row.contactInfo?.name)}
																	color="error"
																	size="small"
																>
																	<TrashIcon fontSize="var(--icon-fontSize-sm)" />
																</IconButton>
															</Tooltip>
														</Stack>
													</>
												)}
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
			<Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete order<strong>{deleteDialog.orderName}</strong>&quot;? This action cannot be
						undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel}>Cancel</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
						disabled={deletingOrderId !== null}
						startIcon={deletingOrderId && <CircularProgress size={16} />}
					>
						{deletingOrderId ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar */}
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
