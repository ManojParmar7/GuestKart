"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { Delete, PhotoCamera } from "@mui/icons-material";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Divider,
	FormControl,
	FormHelperText,
	InputLabel,
	OutlinedInput,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

import { showToast } from "@/hooks/toast-message"; // adjust the path accordingly

import { createSubadmin } from "../../../app/QueryCommon";

export function CreateForm(): React.JSX.Element {
	const loginUser = localStorage.getItem("login_id");

	const [createUser] = useMutation(createSubadmin);
	const [formData, setFormData] = React.useState({
		name: "",
		username: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		website: "",
		role: "",
		superadminId: "",
	});

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
			reader.onload = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview("");
		setErrors((prev) => ({ ...prev, image: "" }));

		// Reset file input
		const fileInput = document.getElementById("image-upload") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name) newErrors.name = "Name is required";
		if (!formData.username) newErrors.username = "Username is required";
		if (!formData.email) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
		if (!formData.phone) newErrors.phone = "Phone is required";
		if (!formData.website) newErrors.website = "Website is required";
		if (!formData.password) newErrors.password = "Password is required";
		if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
		if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords do not match";
		if (!formData.role) newErrors.role = "Role is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			const payload = {
				name: formData.name,
				username: formData.username,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
				website: formData.website,
				role: "68834193879abef2a86727fe",
				superadminId: loginUser,
				// Add image to payload if selected
				...(selectedImage && { profileImage: selectedImage }),
			};

			console.log("Payload:", payload);
			console.log("Selected Image:", selectedImage);

			try {
				// If you need to upload image separately or create FormData
				let imageUrl = "";
				if (selectedImage) {
					const formData = new FormData();
					formData.append("image", selectedImage);

					// Example: Upload image to your server first
					// const imageResponse = await fetch('/api/upload-image', {
					//   method: 'POST',
					//   body: formData,
					// });
					// const imageData = await imageResponse.json();
					// imageUrl = imageData.url;
				}

				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { data } = await createUser({
					variables: {
						...payload,
						profileImage: imageUrl, // Use uploaded image URL
					},
				});

				showToast({
					message: data?.createUser?.message || "Sub admin created successfully.",
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
				<CardHeader title="Create Admin Account" subheader="Fill in the details to create a new admin" sx={{ mb: 2 }} />

				<CardContent>
					<Stack spacing={4}>
						{/* Profile Image Upload Section */}
						<Box>
							<Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
								Profile Image
							</Typography>
							<Stack direction="row" spacing={3} alignItems="center">
								<Avatar
									src={imagePreview}
									sx={{
										width: 100,
										height: 100,
										border: "2px dashed #ddd",
										bgcolor: "grey.100",
									}}
								>
									{!imagePreview && <PhotoCamera sx={{ fontSize: 40, color: "grey.500" }} />}
								</Avatar>

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
								label="Full Name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								error={!!errors.name}
								helperText={errors.name}
							/>
							<TextField
								fullWidth
								label="Username"
								name="username"
								value={formData.username}
								onChange={handleChange}
								error={!!errors.username}
								helperText={errors.username}
							/>
							<TextField
								fullWidth
								label="Email Address"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								error={!!errors.email}
								helperText={errors.email}
							/>
							<TextField
								fullWidth
								label="Phone Number"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								error={!!errors.phone}
								helperText={errors.phone}
							/>
							<TextField
								fullWidth
								label="Website"
								name="website"
								value={formData.website}
								onChange={handleChange}
								error={!!errors.website}
								helperText={errors.website}
							/>
						</Stack>

						<Divider />

						{/* Security Section */}
						<Stack spacing={2}>
							<FormControl fullWidth error={!!errors.password}>
								<InputLabel>Password</InputLabel>
								<OutlinedInput
									label="Password"
									name="password"
									type="password"
									value={formData.password}
									onChange={handleChange}
								/>
								<FormHelperText>{errors.password}</FormHelperText>
							</FormControl>

							<FormControl fullWidth error={!!errors.confirmPassword}>
								<InputLabel>Confirm Password</InputLabel>
								<OutlinedInput
									label="Confirm Password"
									name="confirmPassword"
									type="password"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
								<FormHelperText>{errors.confirmPassword}</FormHelperText>
							</FormControl>
						</Stack>
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
