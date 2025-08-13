"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { Delete, PhotoCamera } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Divider,
	FormHelperText,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

import { authClient } from "@/lib/auth/client";
import { showToast } from "@/hooks/toast-message"; // adjust the path accordingly

import { createCategory, GetUsersBySuperadmin } from "../../../app/query-common";

export function CreateForm(): React.JSX.Element {
	const loginUser = localStorage.getItem("login_id");
	const [CreateCategory] = useMutation(createCategory);
	const [formData, setFormData] = React.useState({
		name: "",
		slug: "",
		description: "",
		superadminId: "",
		subadminId: "",
	});
	const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string>("");
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [user, setUser] = useState<any>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name as string]: value,
		}));
		setErrors((prev) => ({ ...prev, [name as string]: "" }));
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
			if (!allowedTypes.includes(file.type)) {
				setErrors((prev) => ({ ...prev, image: "Please select a valid image file (JPEG, PNG, GIF)" }));
				return;
			}

			// Validate file size (5MB limit)
			const maxSize = 5 * 1024 * 1024; // 5MB in bytes
			if (file.size > maxSize) {
				setErrors((prev) => ({ ...prev, image: "Image size should be less than 5MB" }));
				return;
			}

			setSelectedImage(file);
			setErrors((prev) => ({ ...prev, image: "" }));

			// Create preview URL
			const reader = new FileReader();
			reader.addEventListener("load", () => {
				setImagePreview(reader.result as string);
			});
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview("");
		setErrors((prev) => ({ ...prev, image: "" }));

		// Reset file input
		const fileInput = document.querySelector("#image-upload") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name) newErrors.name = "name is required";
		if (!formData.slug) newErrors.slug = "Sub name is required";
		if (!formData?.description) newErrors.description = "description is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const router = useRouter();
	const variables = {
		search: "",
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

	const { data, refetch } = useQuery(GetUsersBySuperadmin, {
		variables,
		fetchPolicy: "network-only",
	});
	React.useEffect(() => {
		refetch(variables);
	}, []);

	useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
		})();

		// emitUserUpdate();
	}, []);
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			const payload = {
				name: formData.name,
				slug: formData.slug,
				description: formData.description, // spelling fix
				...(selectedImage && { image: selectedImage }),

				...(user?.role?.name === "superadmin"
					? {
							superadminId: loginUser,
							subadminId: formData?.subadminId,
						}
					: user?.role?.name === "subadmin"
						? {
								subadminId: loginUser,
								superadminId: user?.superadmin_id,
							}
						: {}),
			};

			console.log("Payload:", payload);
			console.log("Selected Image:", selectedImage);

			try {
				const { data } = await CreateCategory({
					variables: {
						...payload,
						image: selectedImage,
					},
				});

				showToast({
					message: data?.createCategory?.message || " created successfully.",
					type: "success",
				});
				router.push(`/dashboard/categories`);
			} catch (error) {
				console.error("Error submitting permissions:", error);
				showToast({
					message: "Error creating sub admin. Please try again.",
					type: "error",
				});
			}
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card elevation={3} sx={{ p: 2 }}>
				<CardHeader
					name="Create Categories"
					subheader="Fill in the details to create a new categories"
					sx={{ mb: 2 }}
				/>

				<CardContent>
					<Stack spacing={4}>
						{/* Profile Image Upload Section */}
						<Box>
							<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
								Categories Image
							</Typography>
							<Stack direction="row" spacing={3} alignItems="center">
								<Box
									sx={{
										width: "100%",
										maxWidth: 300,
										height: 150,
										border: "2px dashed #ccc",
										bgcolor: "grey.50",
										borderRadius: 2,
										overflow: "hidden",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									{imagePreview ? (
										<Box
											component="img"
											src={imagePreview}
											alt="Category Preview"
											sx={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
											}}
										/>
									) : (
										<PhotoCamera sx={{ fontSize: 40, color: "grey.400" }} />
									)}
								</Box>

								<Stack spacing={1}>
									<input
										accept="image/*"
										style={{ display: "none" }}
										id="category-image-upload"
										type="file"
										onChange={handleImageUpload}
									/>
									<label htmlFor="category-image-upload">
										<Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small">
											Choose Image
										</Button>
									</label>

									{selectedImage && (
										<Button
											variant="text"
											color="error"
											size="small"
											startIcon={<Delete />}
											onClick={handleRemoveImage}
										>
											Remove Image
										</Button>
									)}

									<Typography variant="caption" color="textSecondary">
										Allowed: JPG, PNG, GIF up to 5MB
									</Typography>
								</Stack>
							</Stack>

							{errors.image && (
								<FormHelperText error sx={{ mt: 1 }}>
									{errors.image}
								</FormHelperText>
							)}
						</Box>

						<Divider />

						{/* Basic Information */}
						<Stack spacing={2}>
							<TextField
								fullWidth
								label="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								error={!!errors.name}
								helperText={errors.name}
							/>
							<TextField
								fullWidth
								label="Slug"
								name="slug"
								value={formData.slug}
								onChange={handleChange}
								error={!!errors.slug}
								helperText={errors.slug}
							/>
							<TextField
								fullWidth
								label="description"
								name="description"
								type="textarea"
								value={formData.description}
								onChange={handleChange}
								error={!!errors.description}
								helperText={errors.description}
							/>

							{user?.role?.name === "superadmin" && (
								<TextField
									fullWidth
									select
									label="Sub Admin"
									name="subadminId"
									value={formData.subadminId}
									onChange={handleChange}
									error={!!errors.subAdmin}
									helperText={errors.subAdmin}
								>
									<MenuItem value="">Select Sub Admin</MenuItem>

									{data?.getUsersBySuperadmin?.users?.map((user: { name: string; id: string }) => (
										// eslint-disable-next-line react/jsx-key
										<MenuItem value={user?.id}>{user?.name}</MenuItem>
									))}
								</TextField>
							)}
						</Stack>

						{/* Security Section */}
					</Stack>
				</CardContent>

				<Divider sx={{ my: 2 }} />

				<CardActions sx={{ justifyContent: "flex-end", gap: 2 }}>
					<Button variant="outlined" color="error" onClick={() => router.push(`/dashboard/customers`)}>
						Cancel
					</Button>
					<Button variant="contained" type="submit">
						Create
					</Button>
				</CardActions>
			</Card>
		</form>
	);
}
