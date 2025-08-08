"use client";

import * as React from "react";
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

import { showToast } from "@/hooks/toast-message"; // adjust the path accordingly

import { createBanner, getAllBanner } from "../../../app/query-common";

export function CreateForm(): React.JSX.Element {
	const loginUser = localStorage.getItem("login_id");
	const [createUser] = useMutation(createBanner);
	const [formData, setFormData] = React.useState({
		title: "",
		subTitle: "",
		discription: "",
		superadminId: "",
		subadminId: "",
	});
	console.log("formData", formData);
	const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string>("");
	const [errors, setErrors] = React.useState<Record<string, string>>({});

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
		if (!formData.title) newErrors.title = "Title is required";
		if (!formData.subTitle) newErrors.subTitle = "Sub Title is required";
		if (!formData?.discription) newErrors.discription = "Discription is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const router = useRouter();
	const variables = {
		superadminId: loginUser,
		subadminId: null,
		search: "",
		limit: 100,
		page: 1,
	};

	const { data, refetch } = useQuery(getAllBanner, {
		variables,
		fetchPolicy: "network-only",
	});

	React.useEffect(() => {
		refetch(variables);
	}, []);
	console.log("bannerGetAll", data);
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			const payload = {
				title: formData.title,
				subTitle: formData.subTitle,
				description: formData.discription,
				superadminId: loginUser,
				...(selectedImage && { image: selectedImage }),
			};

			console.log("Payload:", payload);
			console.log("Selected Image:", selectedImage);

			try {
				const { data } = await createUser({
					variables: {
						...payload,
						image: selectedImage,
					},
				});

				showToast({
					message: data?.createUser?.message || "Banner created successfully.",
					type: "success",
				});
				router.push(`/dashboard/customers`);
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
				<CardHeader title="Create Banner" subheader="Fill in the details to create a new banner" sx={{ mb: 2 }} />

				<CardContent>
					<Stack spacing={4}>
						{/* Profile Image Upload Section */}
						<Box>
							<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
								Banner Image
							</Typography>
							<Stack direction="row" spacing={3} alignItems="center">
								<Box
									sx={{
										width: "100%",
										maxWidth: 600, // banner ki max width
										height: 200, // banner ki height
										border: "2px dashed #ddd",
										bgcolor: "grey.100",
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
											alt="Banner Preview"
											sx={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
											}}
										/>
									) : (
										<PhotoCamera sx={{ fontSize: 50, color: "grey.500" }} />
									)}
								</Box>

								<Stack spacing={1}>
									<input
										accept="image/*"
										style={{ display: "none" }}
										id="image-upload"
										type="file"
										onChange={handleImageUpload}
									/>
									<label htmlFor="image-upload">
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
								label="Title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								error={!!errors.title}
								helperText={errors.title}
							/>
							<TextField
								fullWidth
								label="Sub Title"
								name="subTitle"
								value={formData.subTitle}
								onChange={handleChange}
								error={!!errors.subTitle}
								helperText={errors.subTitle}
							/>
							<TextField
								fullWidth
								label="Discription"
								name="discription"
								type="textarea"
								value={formData.discription}
								onChange={handleChange}
								error={!!errors.discription}
								helperText={errors.discription}
							/>

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
								<MenuItem value="admin1">Admin 1</MenuItem>
								<MenuItem value="admin2">Admin 2</MenuItem>
								<MenuItem value="admin3">Admin 3</MenuItem>
							</TextField>
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
