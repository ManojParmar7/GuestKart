"use client";

// eslint-disable-next-line unicorn/no-abusive-eslint-disable
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import {
	Cancel as CancelIcon,
	Delete,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Email as EmailIcon,
	Language as LanguageIcon,
	Lock as LockIcon,
	Person as PersonIcon,
	Phone as PhoneIcon,
	PhotoCamera,
	Save as SaveIcon,
	AccountCircle as UserIcon,
	Visibility,
	VisibilityOff,
} from "@mui/icons-material";
import ImageIcon from "@mui/icons-material/Image";
import {
	Alert,
	alpha,
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Checkbox,
	Chip,
	CircularProgress,
	Collapse,
	Divider,
	FormControl,
	FormHelperText,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { Carousel } from "react-responsive-carousel";

import { authClient } from "@/lib/auth/client";
import { showToast } from "@/hooks/toast-message";

import "react-responsive-carousel/lib/styles/carousel.min.css";

import {
	GetAllCategories,
	getColors,
	getExtras,
	getProductById,
	getSizes,
	GetUsersBySuperadmin,
	updateProduct,
} from "../../../app/query-common";
import BannerUpdateSkeleton from "../../dashboard/loader/form-skeleton-loader";

interface FormData {
	description: any;
	subTitle: any;
	title: any;
}
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

interface UserData {
	id: string;
	title: string;
	subTitle: string;
	description: string;
	images?: string; // URL string of the current image
	avatar?: string; // optional, maybe same as image
	createdAt: string; // ISO date string
	superadminId?: string;
	subadminId?: string;
	name?: string; // For product name
	price?: number; // For product price
	stock?: number; // Product stock
	categoryId?: string; // Selected category ID
	sizes?: string[]; // Array of size IDs
	colors?: string[]; // Array of color IDs
	extras?: string[];
	category?: any; // Array of extra IDs
}

export function UpdateForm(): React.JSX.Element {
	const theme = useTheme();
	const router = useRouter();
	const params = useParams();
	const getProductId = params?.id as string;
	const [user, setUser] = useState<any>(null);
	const loginUser = localStorage.getItem("login_id");
	const [formData, setFormData] = React.useState({
		description: "",
		name: "",
		price: "",
		stock: "",
		categoryId: "",
		sizes: [] as string[],
		colors: [] as string[],
		extras: [] as string[],
		superadminId: "",
		subadminId: "",
	});
	// Apollo hooks
	const [updateUserMutation, { loading: updating }] = useMutation(updateProduct);
	const { data, loading, error } = useQuery(getProductById, {
		variables: { getProductId },
		skip: !getProductId,
		onCompleted: (data) => {
			if (data?.getProduct) {
				const products = data.getProduct?.product;
				console.log("products: ", products);
				setFormData({
					description: products.description || "",
					name: products.name || "",
					price: products.price || "",
					stock: products.stock || "",
					categoryId: products.category?.id || "",
					sizes: products.sizes?.map((s: any) => s.id) || [],
					colors: products.colors?.map((c: any) => c.id) || [],
					extras: products.extras?.map((e: any) => e.id) || [],
					superadminId: products.superadminId || "",
					subadminId: products.subadminId || "",
				});
				setOriginalData(products);

				if (products.avatar) {
					setImagePreview(products.avatar);
				}
			}
		},
		onError: (error) => {
			console.error("Error fetching user:", error);
			showToast({
				message: "Failed to load user data",
				type: "error",
			});
		},
	});
	const variables = {
		search: "",
		...(user?.role?.name === "superadmin"
			? {
					superadminId: loginUser,
					subadminId: formData?.subadminId || null,
				}
			: user?.role?.name === "subadmin"
				? {
						superadminId: user?.superadmin_id,
						subadminId: loginUser,
					}
				: {}),
	};

	const { data: subAdminsData, refetch: refetchSubAdmins } = useQuery(GetUsersBySuperadmin, {
		variables,
		fetchPolicy: "network-only",
	});
	const { data: categoriesData } = useQuery(GetAllCategories, { variables, fetchPolicy: "network-only" });
	const { data: sizesData } = useQuery(getSizes, { variables, fetchPolicy: "network-only" });
	const { data: colorsData } = useQuery(getColors, { variables, fetchPolicy: "network-only" });
	const { data: extrasData } = useQuery(getExtras, { variables, fetchPolicy: "network-only" });

	useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
		})();
	}, []);

	useEffect(() => {
		refetchSubAdmins(variables);
	}, [user]);

	// State management

	const [originalData, setOriginalData] = React.useState<UserData | null>(null);
	console.log("originalData: ", originalData);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [passwordChange, setPasswordChange] = React.useState(false);

	const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

	// Image upload states
	const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string>("");
	const [imageChanged, setImageChanged] = React.useState(false);
	const [open, setOpen] = React.useState(false);

	// Check for unsaved changes
	React.useEffect(() => {
		if (!originalData) return;

		const hasChanges =
			formData.name !== originalData.name ||
			Number(formData.price) !== Number(originalData.price) ||
			Number(formData.stock) !== Number(originalData.stock) ||
			formData.description !== originalData.description ||
			formData.categoryId !== originalData.category?.id ||
			formData.superadminId !== originalData.superadminId ||
			formData.subadminId !== originalData.subadminId ||
			// Compare arrays: sizes, colors, extras
			JSON.stringify(formData.sizes) !== JSON.stringify(originalData.sizes) ||
			JSON.stringify(formData.colors) !== JSON.stringify(originalData.colors) ||
			JSON.stringify(formData.extras) !== JSON.stringify(originalData.extras) ||
			imageChanged;

		setHasUnsavedChanges(hasChanges);
	}, [formData, originalData, imageChanged]);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const validFiles: File[] = [];
			const previews: string[] = [];

			Array.from(files).forEach((file) => {
				const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
				if (allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024) {
					validFiles.push(file);
					previews.push(URL.createObjectURL(file));
				}
			});

			// Total images (already selected + new ones)
			const totalImages = (selectedImage?.length || 0) + validFiles.length;

			if (totalImages >= 2) {
				setSelectedImage((prev) => [...(prev || []), ...validFiles]);
				setImagePreview((prev) => [...(prev || []), ...previews]);
			} else {
				setOpen(true); // Modal open
				return;
			}
		}
	};
	const handleRemoveImage = (index: number) => {
		setSelectedImage((prev: any) => prev.filter((_, i: any) => i !== index));
		setImagePreview((prev: any) => prev.filter((_, i: any) => i !== index));
	};

	// Form handlers
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for the field being edited
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateField = (name: string, value: any): string => {
		switch (name) {
			case "description":
				if (!value?.trim()) return "Description is required";
				if (value.trim().length < 3) return "Description must be at least 3 characters";
				return "";
			case "price":
				return !value ? "Price is required" : isNaN(Number(value)) ? "Price must be a number" : "";
			case "stock":
				return !value ? "Stock is required" : isNaN(Number(value)) ? "Stock must be a number" : "";
			case "categoryId":
				return !value ? "Category is required" : "";
			case "sizes":
			case "colors":
			case "extras":
				return !value || value.length === 0 ? `${name} must have at least one item` : "";
			case "superadminId":
			case "subadminId":
				return !value ? `${name} is required` : "";
			default:
				return "";
		}
	};

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};

		Object.keys(formData).forEach((key) => {
			const error = validateField(key, formData[key as keyof FormData]);
			if (error) newErrors[key] = error;
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			const payload = {
				...formData,
				price: Number(formData.price),
				stock: Number(formData.stock),
				...(user?.role?.name === "superadmin"
					? { superadminId: loginUser, subadminId: formData.subadminId, updateProductId: getProductId }
					: user?.role?.name === "subadmin"
						? { subadminId: loginUser, superadminId: user?.superadmin_id, updateProductId: getProductId }
						: {}),
			};
			try {
				const { data } = await updateUserMutation({
					variables: {
						...payload,
						images: selectedImage,
					},
				});
				showToast({
					message: data?.updateProduct?.message || "Product update successfully.",
					type: "success",
				});
				router.push(`/dashboard/products`);
			} catch (error) {
				console.error("Error creating product:", error);
				showToast({ message: "Error creating product. Please try again.", type: "error" });
			}
		}
	};

	const handleCancel = () => {
		if (hasUnsavedChanges) {
			const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
			if (!confirmed) return;
		}
		router.push("/dashboard/categories");
	};

	// Loading state
	if (loading) {
		return (
			<>
				<BannerUpdateSkeleton />
			</>
		);
	}

	if (error) {
		return (
			<Alert
				severity="error"
				sx={{ mt: 2, p: 3 }}
				action={
					<Button color="inherit" size="small" onClick={() => router.push("/dashboard/customers")}>
						Go Back
					</Button>
				}
			>
				<Typography variant="h6" gutterBottom>
					Error loading user data
				</Typography>
				<Typography variant="body2">{error.message}</Typography>
			</Alert>
		);
	}

	// User not found state
	if (!originalData) {
		return (
			<Alert
				severity="warning"
				sx={{ mt: 2, p: 3 }}
				action={
					<Button color="inherit" size="small" onClick={() => router.push("/dashboard/products")}>
						Go Back
					</Button>
				}
			>
				<Typography variant="h6">Product not found</Typography>
				<Typography variant="body2">The requested Product could not be found.</Typography>
			</Alert>
		);
	}

	return (
		<Box sx={{ width: "100%", p: 2 }}>
			<form onSubmit={handleSubmit}>
				<Card elevation={3} sx={{ p: 2 }}>
					<CardHeader title="Create Product" subheader="Fill in the details to create a new product" sx={{ mb: 2 }} />
					<CardContent>
						<Stack spacing={4}>
							{/* IMAGE UPLOAD */}
							<Box>
								<Stack direction="row" spacing={3} alignItems="center">
									<Box sx={{ width: "100%" }}>
										<Carousel
											showThumbs={false}
											showStatus={false}
											infiniteLoop
											swipeable
											emulateTouch
											dynamicHeight={false}
											centerMode={imagePreview.length > 1}
											centerSlidePercentage={imagePreview.length > 1 ? 33.33 : 100}
										>
											{imagePreview.length > 0 ? (
												imagePreview.map((src: string, index: number) => (
													<label htmlFor="image-upload" style={{ width: "100%" }}>
														<input
															accept="image/*"
															multiple
															type="file"
															id="image-upload"
															style={{ display: "none" }}
															onChange={handleImageUpload}
														/>
														<Box key={index} sx={{ position: "relative", px: 1 }}>
															<Box
																component="img"
																src={src}
																alt={`Image ${index + 1}`}
																sx={{
																	width: "100%",
																	height: 200,
																	objectFit: "cover",
																	borderRadius: 2,
																}}
															/>
															<Button
																variant="contained"
																color="error"
																size="small"
																disabled={imagePreview.length <= 2} // 2 ya kam images pe disable
																onClick={() => handleRemoveImage(index)}
																sx={{
																	position: "absolute",
																	top: 8,
																	right: 8,
																	zIndex: 10,
																}}
															>
																Remove
															</Button>
														</Box>
													</label>
												))
											) : originalData?.images?.length > 0 ? (
												originalData?.images.map((src: string, index: number) => (
													<label htmlFor="image-upload" style={{ width: "100%" }}>
														<input
															accept="image/*"
															multiple
															type="file"
															id="image-upload"
															style={{ display: "none" }}
															onChange={handleImageUpload}
														/>
														<Box key={index} sx={{ position: "relative", px: 1 }}>
															<Box
																component="img"
																src={`http://localhost:8000${src}`}
																alt={`Image ${index + 1}`}
																sx={{
																	width: "100%",
																	height: 200,
																	objectFit: "cover",
																	borderRadius: 2,
																}}
															/>
															<Button
																variant="contained"
																color="error"
																size="small"
																disabled={originalData?.images.length <= 2} // 2 ya kam images pe disable
																onClick={() => handleRemoveImage(index)}
																sx={{
																	position: "absolute",
																	top: 8,
																	right: 8,
																	zIndex: 10,
																}}
															>
																Remove
															</Button>
														</Box>
													</label>
												))
											) : (
												<label htmlFor="image-upload" style={{ width: "100%" }}>
													<input
														accept="image/*"
														multiple
														type="file"
														id="image-upload"
														style={{ display: "none" }}
														onChange={handleImageUpload}
													/>
													<Box
														sx={{
															width: "100%",
															height: 200,
															border: "2px dashed #ccc",
															borderRadius: 2,
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															justifyContent: "center",
															color: "text.secondary",
															cursor: "pointer",
															"&:hover": {
																borderColor: "primary.main",
																backgroundColor: "action.hover",
															},
														}}
													>
														<ImageIcon sx={{ fontSize: 48, mb: 1 }} />
														<Typography variant="body2">Choose Images</Typography>
													</Box>
												</label>
											)}
										</Carousel>
									</Box>
								</Stack>

								{errors?.image && <FormHelperText error>{errors.image}</FormHelperText>}
							</Box>

							<Divider />

							{/* PRODUCT FIELDS */}
							<Stack spacing={2}>
								{/* SUBADMIN (IF SUPERADMIN) */}
								{user?.role?.name === "superadmin" && (
									<FormControl fullWidth>
										<InputLabel>Sub Admin</InputLabel>
										<Select name="subadminId" value={formData.subadminId} onChange={handleChange}>
											<MenuItem value="">Select Sub Admin</MenuItem>
											{subAdminsData?.getUsersBySuperadmin?.users?.map((u: any) => (
												<MenuItem key={u.id} value={u.id}>
													{u.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								)}

								<TextField
									fullWidth
									label="Product Name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									error={!!errors.name}
									helperText={errors.name}
								/>
								<TextField
									fullWidth
									label="Price"
									name="price"
									type="number"
									value={formData.price}
									onChange={handleChange}
									error={!!errors.price}
									helperText={errors.price}
								/>
								<TextField
									fullWidth
									label="Stock"
									name="stock"
									type="number"
									value={formData.stock}
									onChange={handleChange}
									error={!!errors.stock}
									helperText={errors.stock}
								/>
								<TextField
									fullWidth
									label="Description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									error={!!errors.description}
									helperText={errors.description}
								/>

								{/* CATEGORY */}
								<FormControl fullWidth>
									<InputLabel>Category</InputLabel>
									<Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
										{categoriesData?.getAllCategories?.categories?.map((cat: any) => (
											<MenuItem key={cat.id} value={cat.id}>
												{cat.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>

								{/* MULTI SELECTS */}
								{/* SIZES */}
								<FormControl fullWidth>
									<InputLabel>Sizes</InputLabel>
									<Select
										multiple
										name="sizes"
										value={formData.sizes}
										onChange={handleChange}
										input={<OutlinedInput label="Sizes" />}
										renderValue={(selected) =>
											sizesData?.getSizes?.sizes
												?.filter((s: any) => selected.includes(s.id))
												.map((s: any) => s.name)
												.join(", ")
										}
										MenuProps={MenuProps}
									>
										{sizesData?.getSizes?.sizes?.map((size: any) => (
											<MenuItem key={size.id} value={size.id}>
												<Checkbox checked={formData.sizes.includes(size.id)} />
												<ListItemText primary={size.name} />
											</MenuItem>
										))}
									</Select>
								</FormControl>

								{/* COLORS */}
								<FormControl fullWidth>
									<InputLabel>Colors</InputLabel>
									<Select
										multiple
										name="colors"
										value={formData.colors}
										onChange={handleChange}
										input={<OutlinedInput label="Colors" />}
										renderValue={(selected) =>
											colorsData?.getColors?.colors
												?.filter((c: any) => selected.includes(c.id))
												.map((c: any) => c.name)
												.join(", ")
										}
										MenuProps={MenuProps}
									>
										{colorsData?.getColors?.colors?.map((color: any) => (
											<MenuItem key={color.id} value={color.id}>
												<Checkbox checked={formData.colors.includes(color.id)} />
												<ListItemText primary={color.name} />
											</MenuItem>
										))}
									</Select>
								</FormControl>

								{/* EXTRAS */}
								<FormControl fullWidth>
									<InputLabel>Extras</InputLabel>
									<Select
										multiple
										name="extras"
										value={formData.extras}
										onChange={handleChange}
										input={<OutlinedInput label="Extras" />}
										renderValue={(selected) =>
											extrasData?.getExtras?.extras
												?.filter((e: any) => selected.includes(e.id))
												.map((e: any) => e.name)
												.join(", ")
										}
										MenuProps={MenuProps}
									>
										{extrasData?.getExtras?.extras?.map((extra: any) => (
											<MenuItem key={extra.id} value={extra.id}>
												<Checkbox checked={formData.extras.includes(extra.id)} />
												<ListItemText primary={extra.name} />
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Stack>
						</Stack>
					</CardContent>

					<Divider sx={{ my: 2 }} />
					<CardActions sx={{ justifyContent: "flex-end", gap: 2 }}>
						<Button variant="outlined" color="error" onClick={() => router.push(`/dashboard/products`)}>
							Cancel
						</Button>
						<Button
							variant="contained"
							type="submit"
							disabled={updating || !hasUnsavedChanges}
							startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
							size="large"
							sx={{ minWidth: 140 }}
						>
							{updating ? "Updating..." : "Update User"}
						</Button>
					</CardActions>
				</Card>
			</form>
		</Box>
	);
}
