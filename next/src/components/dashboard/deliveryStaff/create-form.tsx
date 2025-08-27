"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
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
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

import { authClient } from "@/lib/auth/client";
import { showToast } from "@/hooks/toast-message"; // adjust the path accordingly

import { createSubadmin, GetUsersBySuperadmin } from "../../../app/query-common";

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
		subadminId: "",
	});

	const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string>("");
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [user, setUser] = React.useState<any>(null);
	console.log("user: ", user);

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
		if (!formData.name) newErrors.name = "Name is required";
		if (!formData.username) newErrors.username = "Username is required";
		if (!formData.email) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
		if (!formData.phone) newErrors.phone = "Phone is required";
		if (!formData.website) newErrors.website = "Website is required";
		// if (!formData.subadminId) newErrors.subadminId = "Subadmin is required";
		if (!formData.password) newErrors.password = "Password is required";
		if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
		if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords do not match";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const router = useRouter();

	const variables = {
		search: "",
		roleName: "subadmin",
		superadminId: loginUser || null,
	};
	const { data: subAdminsData, refetch: refetchSubAdmins } = useQuery(GetUsersBySuperadmin, {
		variables,
		fetchPolicy: "network-only",
	});

	console.log("-=-=-=-=-=subAdminsData", subAdminsData);
	React.useEffect(() => {
		(async () => {
			const { data } = await authClient.getUser();
			setUser(data);
		})();
	}, []);

	React.useEffect(() => {
		refetchSubAdmins(variables);
	}, [user]);
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
				role: "68ad4f822e084212b5aeaa0f",
				superadminId: loginUser,
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

				// ✅ Image add karo agar selected hai
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
					message: data?.createUser?.message || "Delivery Staff created successfully.",
					type: "success",
				});
				router.push(`/dashboard/deliveryStaff`);
			} catch (error) {
				console.error("Error submitting permissions:", error);
				showToast({
					message: "Error creating Delivery Staff. Please try again.",
					type: "error",
				});
			}
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card elevation={3} sx={{ p: 2 }}>
				<CardHeader
					title="Create Delivery Staff Account"
					subheader="Fill in the details to create a new delivery staff"
					sx={{ mb: 2 }}
				/>

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
						<Stack spacing={2}>
							{user?.role?.name === "superadmin" && (
								<TextField
									fullWidth
									select
									label="Sub Admin"
									name="subadminId"
									value={formData.subadminId}
									onChange={handleChange}
									error={!!errors.subadminId}
									helperText={errors.subadminId}
								>
									<MenuItem value="">Select Sub Admin</MenuItem>

									{subAdminsData?.getUsersBySuperadmin?.users?.map((user: { name: string; id: string }) => (
										// eslint-disable-next-line react/jsx-key
										<MenuItem value={user?.id}>{user?.name}</MenuItem>
									))}
								</TextField>
							)}
						</Stack>
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
					<Button variant="outlined" color="error" onClick={() => router.push(`/dashboard/deliveryStaff`)}>
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
