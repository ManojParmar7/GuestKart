"use client";

import React, { useState } from "react";
import {
	AccessTime,
	Assignment,
	AttachMoney,
	Cancel,
	CheckCircle,
	DeliveryDining,
	DirectionsBike,
	LocationOn,
	Notifications,
	Phone,
	Restaurant,
	Star,
} from "@mui/icons-material";
import {
	AppBar,
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	Divider,
	Grid,
	IconButton,
	Paper,
	Rating,
	Stack,
	Tab,
	Tabs,
	Toolbar,
	Typography,
} from "@mui/material";

// Types
interface DeliveryOrder {
	id: string;
	customerName: string;
	customerPhone: string;
	pickupAddress: string;
	deliveryAddress: string;
	items: string;
	amount: number;
	distance: string;
	estimatedTime: string;
	orderTime: string;
	restaurant: string;
	status: "assigned" | "picked" | "delivered";
}

interface Stats {
	todayDeliveries: number;
	todayEarnings: number;
	avgRating: number;
	activeOrders: number;
}

const DeliveryBoyUI: React.FC = () => {
	const [activeTab, setActiveTab] = useState<number>(0);
	const [deliveryBoyName] = useState<string>("Raj Kumar");
	const [isOnline, setIsOnline] = useState<boolean>(true);

	// Sample orders data
	const [orders, setOrders] = useState<DeliveryOrder[]>([
		{
			id: "ORD001",
			customerName: "Rahul Sharma",
			customerPhone: "+91 9876543210",
			pickupAddress: "Pizza Palace, Sector 18, Noida",
			deliveryAddress: "A-123, Sector 15, Noida",
			items: "Pizza, Coke, Garlic Bread",
			amount: 450,
			distance: "2.5 km",
			estimatedTime: "25 min",
			orderTime: "2:30 PM",
			restaurant: "Pizza Palace",
			status: "assigned",
		},
		{
			id: "ORD002",
			customerName: "Priya Gupta",
			customerPhone: "+91 9876543211",
			pickupAddress: "Biryani House, Model Town, Delhi",
			deliveryAddress: "B-456, Model Town, Delhi",
			items: "Biryani, Raita, Salad",
			amount: 320,
			distance: "1.8 km",
			estimatedTime: "20 min",
			orderTime: "3:45 PM",
			restaurant: "Biryani House",
			status: "picked",
		},
	]);

	const [completedOrders] = useState([
		{
			id: "ORD003",
			customerName: "Amit Kumar",
			deliveryAddress: "C-789, Janakpuri",
			items: "Burger, Fries, Shake",
			amount: 280,
			deliveredAt: "1:15 PM",
			rating: 5,
			tip: 20,
			restaurant: "Burger King",
		},
		{
			id: "ORD004",
			customerName: "Sunita Devi",
			deliveryAddress: "D-321, Lajpat Nagar",
			items: "Dal, Rice, Roti",
			amount: 180,
			deliveredAt: "12:30 PM",
			rating: 4,
			tip: 10,
			restaurant: "Home Kitchen",
		},
	]);

	// Calculate stats
	const stats: Stats = {
		todayDeliveries: completedOrders.length,
		todayEarnings: completedOrders.reduce((sum, order) => sum + order.amount + order.tip, 0),
		avgRating: completedOrders.reduce((sum, order) => sum + order.rating, 0) / completedOrders.length || 0,
		activeOrders: orders.filter((order) => order.status !== "delivered").length,
	};

	// Event handlers
	const handleAcceptOrder = (orderId: string): void => {
		setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "picked" as const } : order)));
	};

	const handleRejectOrder = (orderId: string): void => {
		setOrders((prev) => prev.filter((order) => order.id !== orderId));
	};

	const handleCompleteDelivery = (orderId: string): void => {
		setOrders((prev) =>
			prev.map((order) => (order.id === orderId ? { ...order, status: "delivered" as const } : order))
		);
	};

	const toggleOnlineStatus = (): void => {
		setIsOnline(!isOnline);
	};

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const getStatusColor = (status: string) => {
		switch (status) {
			case "assigned": {
				return "warning";
			}
			case "picked": {
				return "info";
			}
			case "delivered": {
				return "success";
			}
			default: {
				return "default";
			}
		}
	};

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const getStatusText = (status: string) => {
		switch (status) {
			case "assigned": {
				return "New Order";
			}
			case "picked": {
				return "Picked Up";
			}
			case "delivered": {
				return "Delivered";
			}
			default: {
				return status;
			}
		}
	};

	return (
		<Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
			{/* Header */}
			<AppBar position="static" elevation={1}>
				<Toolbar>
					<DirectionsBike sx={{ mr: 2 }} />
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						Delivery Partner
					</Typography>
					<Box display="flex" alignItems="center" gap={2}>
						<Badge badgeContent={orders.length} color="error">
							<Notifications />
						</Badge>
						<Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>{deliveryBoyName.charAt(0)}</Avatar>
					</Box>
				</Toolbar>
			</AppBar>

			<Container maxWidth="lg" sx={{ py: 2 }}>
				{/* Profile Section */}
				<Paper elevation={2} sx={{ p: 3, mb: 3 }}>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Box display="flex" alignItems="center" gap={2}>
							<Avatar sx={{ bgcolor: "primary.main", width: 60, height: 60 }}>
								<DeliveryDining fontSize="large" />
							</Avatar>
							<Box>
								<Typography variant="h5" fontWeight="bold">
									{deliveryBoyName}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Delivery Partner ID: DP001
								</Typography>
							</Box>
						</Box>
						<Box textAlign="right">
							<Button
								variant={isOnline ? "contained" : "outlined"}
								color={isOnline ? "success" : "primary"}
								onClick={toggleOnlineStatus}
								startIcon={
									<Box width={8} height={8} bgcolor={isOnline ? "success.main" : "grey.400"} borderRadius="50%" />
								}
							>
								{isOnline ? "Online" : "Offline"}
							</Button>
						</Box>
					</Box>
				</Paper>

				{/* Stats Cards */}
				<Grid container spacing={2} sx={{ mb: 3 }}>
					<Grid item xs={6} md={3}>
						<Card elevation={1}>
							<CardContent sx={{ textAlign: "center", py: 2 }}>
								<CheckCircle color="success" sx={{ fontSize: 32, mb: 1 }} />
								<Typography variant="h5" fontWeight="bold">
									{stats.todayDeliveries}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Today's Deliveries
								</Typography>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={6} md={3}>
						<Card elevation={1}>
							<CardContent sx={{ textAlign: "center", py: 2 }}>
								<Assignment color="warning" sx={{ fontSize: 32, mb: 1 }} />
								<Typography variant="h5" fontWeight="bold">
									{stats.activeOrders}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Active Orders
								</Typography>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={6} md={3}>
						<Card elevation={1}>
							<CardContent sx={{ textAlign: "center", py: 2 }}>
								<Star sx={{ color: "gold", fontSize: 32, mb: 1 }} />
								<Typography variant="h5" fontWeight="bold">
									{stats.avgRating.toFixed(1)}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Average Rating
								</Typography>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={6} md={3}>
						<Card elevation={1}>
							<CardContent sx={{ textAlign: "center", py: 2 }}>
								<AttachMoney color="success" sx={{ fontSize: 32, mb: 1 }} />
								<Typography variant="h5" fontWeight="bold">
									₹{stats.todayEarnings}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Today's Earnings
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				{/* Tabs Navigation */}
				<Paper elevation={1}>
					<Tabs
						value={activeTab}
						onChange={(_, newValue) => setActiveTab(newValue)}
						variant="fullWidth"
						sx={{ borderBottom: 1, borderColor: "divider" }}
					>
						<Tab label={`Active Orders (${orders.length})`} icon={<Assignment />} iconPosition="start" />
						<Tab label={`Completed (${completedOrders.length})`} icon={<CheckCircle />} iconPosition="start" />
					</Tabs>

					<Box sx={{ p: 2 }}>
						{/* Active Orders Tab */}
						{activeTab === 0 && (
							<Stack spacing={2}>
								{orders.length === 0 ? (
									<Box textAlign="center" py={4}>
										<Assignment sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
										<Typography variant="body1" color="text.secondary">
											No active orders
										</Typography>
									</Box>
								) : (
									orders.map((order) => (
										<Card
											key={order.id}
											variant="outlined"
											sx={{
												borderLeft: 4,
												borderLeftColor: `${getStatusColor(order.status)}.main`,
											}}
										>
											<CardContent>
												{/* Order Header */}
												<Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
													<Box>
														<Typography variant="h6" fontWeight="bold">
															Order #{order.id}
														</Typography>
														<Box display="flex" alignItems="center" gap={1} mb={1}>
															<Restaurant fontSize="small" color="action" />
															<Typography variant="body2" color="text.secondary">
																{order.restaurant}
															</Typography>
														</Box>
														<Chip
															label={getStatusText(order.status)}
															color={getStatusColor(order.status) as any}
															size="small"
														/>
													</Box>
													<Box textAlign="right">
														<Typography variant="h6" color="success.main" fontWeight="bold">
															₹{order.amount}
														</Typography>
														<Typography variant="caption" color="text.secondary">
															{order.orderTime}
														</Typography>
													</Box>
												</Box>

												{/* Customer Info */}
												<Box mb={2}>
													<Box display="flex" alignItems="center" gap={1} mb={1}>
														<Typography variant="body2" fontWeight="medium">
															{order.customerName}
														</Typography>
														<IconButton size="small" color="primary" href={`tel:${order.customerPhone}`}>
															<Phone fontSize="small" />
														</IconButton>
													</Box>
												</Box>

												{/* Addresses */}
												<Grid container spacing={2} sx={{ mb: 2 }}>
													<Grid item xs={12}>
														<Typography variant="caption" color="text.secondary">
															Pickup Address:
														</Typography>
														<Box display="flex" alignItems="start" gap={1} mb={1}>
															<Restaurant fontSize="small" color="action" />
															<Typography variant="body2">{order.pickupAddress}</Typography>
														</Box>
													</Grid>
													<Grid item xs={12}>
														<Typography variant="caption" color="text.secondary">
															Delivery Address:
														</Typography>
														<Box display="flex" alignItems="start" gap={1}>
															<LocationOn fontSize="small" color="action" />
															<Typography variant="body2">{order.deliveryAddress}</Typography>
														</Box>
													</Grid>
												</Grid>

												{/* Order Details */}
												<Box mb={2}>
													<Typography variant="caption" color="text.secondary">
														Items:
													</Typography>
													<Typography variant="body2" fontWeight="medium" mb={1}>
														{order.items}
													</Typography>
													<Box display="flex" gap={1}>
														<Chip icon={<LocationOn />} label={order.distance} size="small" variant="outlined" />
														<Chip icon={<AccessTime />} label={order.estimatedTime} size="small" variant="outlined" />
													</Box>
												</Box>

												{/* Action Buttons */}
												<Box display="flex" gap={1}>
													{order.status === "assigned" && (
														<>
															<Button
																variant="contained"
																color="success"
																startIcon={<CheckCircle />}
																size="small"
																onClick={() => handleAcceptOrder(order.id)}
															>
																Accept & Pickup
															</Button>
															<Button
																variant="outlined"
																color="error"
																startIcon={<Cancel />}
																size="small"
																onClick={() => handleRejectOrder(order.id)}
															>
																Reject
															</Button>
														</>
													)}
													{order.status === "picked" && (
														<Button
															variant="contained"
															color="primary"
															startIcon={<CheckCircle />}
															fullWidth
															onClick={() => handleCompleteDelivery(order.id)}
														>
															Mark as Delivered
														</Button>
													)}
												</Box>
											</CardContent>
										</Card>
									))
								)}
							</Stack>
						)}

						{/* Completed Orders Tab */}
						{activeTab === 1 && (
							<Stack spacing={2}>
								{completedOrders.length === 0 ? (
									<Box textAlign="center" py={4}>
										<CheckCircle sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
										<Typography variant="body1" color="text.secondary">
											No completed deliveries today
										</Typography>
									</Box>
								) : (
									completedOrders.map((order) => (
										<Card key={order.id} variant="outlined" sx={{ borderLeft: 4, borderLeftColor: "success.main" }}>
											<CardContent>
												<Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
													<Box>
														<Typography variant="h6" fontWeight="bold">
															Order #{order.id}
														</Typography>
														<Box display="flex" alignItems="center" gap={1}>
															<Restaurant fontSize="small" color="action" />
															<Typography variant="body2" color="text.secondary">
																{order.restaurant}
															</Typography>
														</Box>
													</Box>
													<Box textAlign="right">
														<Typography variant="h6" color="success.main" fontWeight="bold">
															₹{order.amount}
														</Typography>
														<Typography variant="caption" color="text.secondary">
															Delivered at {order.deliveredAt}
														</Typography>
													</Box>
												</Box>

												<Box mb={2}>
													<Typography variant="body2" fontWeight="medium" mb={1}>
														{order.customerName}
													</Typography>
													<Box display="flex" alignItems="start" gap={1}>
														<LocationOn fontSize="small" color="action" />
														<Typography variant="body2" color="text.secondary">
															{order.deliveryAddress}
														</Typography>
													</Box>
												</Box>

												<Typography variant="caption" color="text.secondary">
													Items:
												</Typography>
												<Typography variant="body2" fontWeight="medium" mb={2}>
													{order.items}
												</Typography>

												<Divider sx={{ my: 1 }} />

												<Box display="flex" justifyContent="space-between" alignItems="center">
													<Box display="flex" alignItems="center" gap={1}>
														<Rating value={order.rating} readOnly size="small" />
														<Typography variant="body2" color="text.secondary">
															({order.rating}/5)
														</Typography>
													</Box>
													<Box textAlign="right">
														<Typography variant="caption" color="text.secondary">
															Tip Received:
														</Typography>
														<Typography variant="body2" color="success.main" fontWeight="bold">
															₹{order.tip}
														</Typography>
													</Box>
												</Box>
											</CardContent>
										</Card>
									))
								)}
							</Stack>
						)}
					</Box>
				</Paper>
			</Container>
		</Box>
	);
};

export default DeliveryBoyUI;
