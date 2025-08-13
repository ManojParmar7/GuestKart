"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { PhotoCamera } from "@mui/icons-material";
import ImageIcon from "@mui/icons-material/Image";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormHelperText,
	InputLabel,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Select,
	SelectChangeEvent,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Carousel } from "react-responsive-carousel";

import "react-responsive-carousel/lib/styles/carousel.min.css";

import { authClient } from "@/lib/auth/client";
import { showToast } from "@/hooks/toast-message";

import {
	createProduct,
	GetAllCategories,
	getColors,
	getExtras,
	getSizes,
	GetUsersBySuperadmin,
} from "../../../app/query-common";

// <- apne queries yahan define karein

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

export function CreateForm(): React.JSX.Element {
	const loginUser = localStorage.getItem("login_id");
	const [createProductMutation] = useMutation(createProduct);

	const [formData, setFormData] = useState({
		name: "",
		price: "",
		stock: "",
		description: "",
		categoryId: "",
		sizes: [] as string[],
		colors: [] as string[],
		extras: [] as string[],
		superadminId: "",
		subadminId: "",
	});

	console.log("formData", formData);
	const [selectedImage, setSelectedImage] = useState<File[]>([]);
	const [imagePreview, setImagePreview] = useState<string[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [user, setUser] = useState<any>(null);
	const [open, setOpen] = useState(false);
	// ====== BACKEND QUERIES ======
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

	// ====== HANDLERS ======
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | string[]>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

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

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name) newErrors.name = "Product name is required";
		if (!formData.price) newErrors.price = "Price is required";
		if (!formData.stock) newErrors.stock = "Stock is required";
		if (!formData.description) newErrors.description = "Description is required";
		if (!formData.categoryId) newErrors.categoryId = "Category is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			const payload = {
				...formData,
				price: Number(formData.price),
				stock: Number(formData.stock),
				...(user?.role?.name === "superadmin"
					? { superadminId: loginUser, subadminId: formData.subadminId }
					: user?.role?.name === "subadmin"
						? { subadminId: loginUser, superadminId: user?.superadmin_id }
						: {}),
			};
			try {
				const { data } = await createProductMutation({
					variables: {
						...payload,
						images: selectedImage,
					},
				});
				showToast({
					message: data?.createProduct?.message || "Product created successfully.",
					type: "success",
				});
				router.push(`/dashboard/products`);
			} catch (error) {
				console.error("Error creating product:", error);
				showToast({ message: "Error creating product. Please try again.", type: "error" });
			}
		}
	};
	const handleClose = () => {
		setOpen(false);
	};
	// ====== UI ======
	return (
		<>
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
						<Button variant="contained" type="submit">
							Create
						</Button>
					</CardActions>
				</Card>
			</form>

			<Dialog open={open} onClose={handleClose}>
				<DialogTitle sx={{ color: "warning.main", fontWeight: "bold" }}>Warning</DialogTitle>
				<DialogContent>
					<Typography> You must select at least 2 images to create a product.</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="warning" variant="contained">
						OK
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
