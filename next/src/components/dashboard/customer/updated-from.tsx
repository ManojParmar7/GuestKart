"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import {
	Cancel as CancelIcon,
	Check as CheckIcon,
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
	OutlinedInput,
	Paper,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import dayjs from "dayjs";

import { showToast } from "@/hooks/toast-message";

import { getUserById, updateUser } from "../../../app/QueryCommon";

interface FormData {
	name: string;
	username: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
	website: string;
	country: string;
	currency: string;
}

interface UserData {
	image: string;
	id: string;
	name: string;
	username: string;
	email: string;
	phone: string;
	website: string;
	country: string;
	currency: string;
	avatar?: string;
	createdAt: string;
}

export function UpdateForm(): React.JSX.Element {
	const theme = useTheme();
	const router = useRouter();
	const params = useParams();
	const userId = params?.id as string;

	// Apollo hooks
	const [updateUserMutation, { loading: updating }] = useMutation(updateUser);
	const { data, loading, error } = useQuery(getUserById, {
		variables: { getUserId: userId },
		skip: !userId,
		onCompleted: (data) => {
			if (data?.getUser) {
				const user = data.getUser;
				setFormData({
					name: user.name || "",
					username: user.username || "",
					email: user.email || "",
					phone: user.phone || "",
					password: user.password || "",
					confirmPassword: "",
					website: user.website || "",
					country: user.country || "",
					currency: user.currency || "",
				});
				setOriginalData(user);
				// Set current avatar as preview if exists
				if (user.avatar) {
					setImagePreview(user.avatar);
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

	// State management
	const [formData, setFormData] = React.useState<FormData>({
		name: "",
		username: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		website: "",
		country: "",
		currency: "",
	});

	const [originalData, setOriginalData] = React.useState<UserData | null>(null);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [passwordChange, setPasswordChange] = React.useState(false);
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

	// Image upload states
	const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string>("");
	const [imageChanged, setImageChanged] = React.useState(false);

	// Check for unsaved changes
	React.useEffect(() => {
		if (!originalData) return;

		const hasChanges =
			formData.name !== originalData.name ||
			formData.username !== originalData.username ||
			formData.email !== originalData.email ||
			formData.phone !== originalData.phone ||
			formData.website !== originalData.website ||
			formData.country !== originalData.country ||
			formData.currency !== originalData.currency ||
			passwordChange ||
			imageChanged;

		setHasUnsavedChanges(hasChanges);
	}, [formData, originalData, passwordChange, imageChanged]);

	// Image upload handlers
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
			setImageChanged(true);
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
		setImagePreview(originalData?.avatar || "");
		setImageChanged(originalData?.avatar ? true : false); // Mark as changed if removing existing image
		setErrors((prev) => ({ ...prev, image: "" }));

		// Reset file input
		const fileInput = document.getElementById("image-upload") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
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

	const validateField = (name: string, value: string): string => {
		switch (name) {
			case "name":
				return !value.trim() ? "Name is required" : "";
			case "username":
				return !value.trim()
					? "Username is required"
					: value.length < 3
						? "Username must be at least 3 characters"
						: "";
			case "email":
				return !value.trim()
					? "Email is required"
					: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
						? "Invalid email format"
						: "";
			case "phone":
				return !value.trim() ? "Phone is required" : !/^\+?[\d\s\-\(\)]+$/.test(value) ? "Invalid phone format" : "";
			case "website":
				return !value.trim() ? "Website is required" : !/^https?:\/\/.+\..+/.test(value) ? "Invalid website URL" : "";
			case "password":
				return passwordChange && !value
					? "Password is required"
					: passwordChange && value.length < 6
						? "Password must be at least 6 characters"
						: "";
			case "confirmPassword":
				return passwordChange && value !== formData.password ? "Passwords do not match" : "";
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

		if (!validate()) {
			showToast({
				message: "Please fix the errors before submitting",
				type: "error",
			});
			return;
		}

		// Prepare payload with only changed fields
		const payload: any = { updateUserId: userId };
		let changeCount = 0;

		// Check for changes and add to payload
		if (formData.name !== originalData?.name) {
			payload.name = formData.name;
			changeCount++;
		}
		if (formData.username !== originalData?.username) {
			payload.username = formData.username;
			changeCount++;
		}
		if (formData.email !== originalData?.email) {
			payload.email = formData.email;
			changeCount++;
		}
		if (formData.phone !== originalData?.phone) {
			payload.phone = formData.phone;
			changeCount++;
		}
		if (formData.website !== originalData?.website) {
			payload.website = formData.website;
			changeCount++;
		}
		if (formData.country !== originalData?.country) {
			payload.country = formData.country;
			changeCount++;
		}
		if (formData.currency !== originalData?.currency) {
			payload.currency = formData.currency;
			changeCount++;
		}

		if (passwordChange && formData.password) {
			payload.password = formData.password;
			changeCount++;
		}

		// Handle image upload
		if (imageChanged) {
			if (selectedImage) {
				// Upload new image
				payload.profileImage = selectedImage;
			} else {
				// Remove image
				payload.removeImage = true;
			}
			changeCount++;
		}

		try {
			// If you need to upload image separately

			const { data: responseData } = await updateUserMutation({
				variables: {
					...payload,
					image: selectedImage,
					// Use uploaded image URL
				},
			});

			if (responseData?.updateUser?.success) {
				showToast({
					message: `${responseData?.updateUser?.message}`,
					type: "success",
				});
				router.push("/dashboard/customers");
			} else {
				showToast({
					message: responseData?.updateUser?.message || "An error occurred while updating user",
					type: "error",
				});
			}
		} catch (error: any) {
			console.error("Error updating user:", error);
			showToast({
				message: error.message || "An error occurred while updating user",
				type: "error",
			});
		}
	};

	const handleCancel = () => {
		if (hasUnsavedChanges) {
			const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
			if (!confirmed) return;
		}
		router.push("/dashboard/customers");
	};

	const handlePasswordToggle = () => {
		setPasswordChange(!passwordChange);
		if (!passwordChange) {
			setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
			setErrors((prev) => ({ ...prev, password: "", confirmPassword: "" }));
		}
	};

	// Loading state
	if (loading) {
		return (
			<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh" gap={2}>
				<CircularProgress size={60} thickness={4} />
				<Typography variant="h6" color="text.secondary">
					Loading user data...
				</Typography>
			</Box>
		);
	}

	// Error state
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
					<Button color="inherit" size="small" onClick={() => router.push("/dashboard/customers")}>
						Go Back
					</Button>
				}
			>
				<Typography variant="h6">User not found</Typography>
				<Typography variant="body2">The requested user could not be found.</Typography>
			</Alert>
		);
	}

	return (
		<Box sx={{ width: "100%", p: 2 }}>
			<form onSubmit={handleSubmit}>
				<Stack spacing={3}>
					{/* User Info Header */}

					{/* Update Form */}
					<Card elevation={2}>
						<CardHeader
							avatar={<EditIcon />}
							title="Update User Information"
							subheader="Modify user details and preferences"
							sx={{
								bgcolor: alpha(theme.palette.primary.main, 0.1),
								borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
							}}
						></CardHeader>
						<CardContent sx={{ p: 4 }}>
							<Stack spacing={4}>
								{/* Profile Image Upload Section */}
								<Box>
									<Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
										Profile Image
									</Typography>
									<Stack direction="row" spacing={3} alignItems="center">
										<Avatar
											src={imagePreview || `http://localhost:8000${originalData?.image}`}
											sx={{
												width: 120,
												height: 120,
												border: "3px solid",
												borderColor: theme.palette.primary.light,
												bgcolor: "grey.100",
											}}
										>
											{!imagePreview && <PhotoCamera sx={{ fontSize: 50, color: "grey.500" }} />}
										</Avatar>

										<Stack spacing={2}>
											<input
												accept="image/*"
												style={{ display: "none" }}
												id="image-upload"
												type="file"
												onChange={handleImageUpload}
											/>
											<label htmlFor="image-upload">
												<Button
													variant="outlined"
													component="span"
													startIcon={<PhotoCamera />}
													size="medium"
													sx={{ minWidth: 150 }}
												>
													{imagePreview ? "Change Image" : "Upload Image"}
												</Button>
											</label>

											{imagePreview && (
												<Button
													variant="text"
													color="error"
													size="medium"
													startIcon={<DeleteIcon />}
													onClick={handleRemoveImage}
													sx={{ minWidth: 150 }}
												>
													Remove Image
												</Button>
											)}

											<Typography variant="caption" color="textSecondary" sx={{ maxWidth: 200 }}>
												Allowed formats: JPG, PNG, GIF up to 5MB
											</Typography>

											{imageChanged && (
												<Chip label="Image will be updated" size="small" color="info" variant="outlined" />
											)}
										</Stack>
									</Stack>

									{errors.image && (
										<FormHelperText error sx={{ mt: 1, ml: 0 }}>
											{errors.image}
										</FormHelperText>
									)}
								</Box>

								<Divider />

								{/* Basic Information */}
								<Box>
									<Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
										Basic Information
									</Typography>
									<Grid container spacing={3}>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Full Name"
												name="name"
												value={formData.name}
												onChange={handleChange}
												error={!!errors.name}
												helperText={errors.name}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<PersonIcon color="action" />
														</InputAdornment>
													),
												}}
												variant="outlined"
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Username"
												name="username"
												value={formData.username}
												onChange={handleChange}
												error={!!errors.username}
												helperText={errors.username}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<UserIcon color="action" />
														</InputAdornment>
													),
												}}
												variant="outlined"
											/>
										</Grid>
									</Grid>
								</Box>

								{/* Contact Information */}
								<Box>
									<Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
										Contact Information
									</Typography>
									<Grid container spacing={3}>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Email Address"
												name="email"
												type="email"
												value={formData.email}
												onChange={handleChange}
												error={!!errors.email}
												helperText={errors.email}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<EmailIcon color="action" />
														</InputAdornment>
													),
												}}
												variant="outlined"
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Phone Number"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												error={!!errors.phone}
												helperText={errors.phone}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<PhoneIcon color="action" />
														</InputAdornment>
													),
												}}
												variant="outlined"
											/>
										</Grid>
									</Grid>
								</Box>

								{/* Additional Information */}
								<Box>
									<Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
										Additional Information
									</Typography>
									<Grid container spacing={3}>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Website"
												name="website"
												value={formData.website}
												onChange={handleChange}
												error={!!errors.website}
												helperText={errors.website}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<LanguageIcon color="action" />
														</InputAdornment>
													),
												}}
												variant="outlined"
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<TextField
												fullWidth
												label="Country"
												name="country"
												value={formData.country}
												onChange={handleChange}
												variant="outlined"
											/>
										</Grid>
									</Grid>

									<Box sx={{ mt: 3 }}>
										<TextField
											fullWidth
											label="Currency"
											name="currency"
											value={formData.currency}
											onChange={handleChange}
											variant="outlined"
										/>
									</Box>
								</Box>

								<Divider sx={{ my: 3 }} />

								{/* Password Section */}
								<Box>
									<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
										<LockIcon color="action" />
										<Typography variant="h6" color="primary" fontWeight="bold">
											Password Settings
										</Typography>
										<Tooltip title={passwordChange ? "Cancel password change" : "Change password"}>
											<Button
												variant={passwordChange ? "contained" : "outlined"}
												size="small"
												onClick={handlePasswordToggle}
												startIcon={passwordChange ? <CancelIcon /> : <EditIcon />}
												color={passwordChange ? "secondary" : "primary"}
											>
												{passwordChange ? "Cancel Change" : "Change Password"}
											</Button>
										</Tooltip>
									</Stack>

									<Collapse in={passwordChange}>
										<Alert severity="info" sx={{ mb: 3 }}>
											<Typography variant="body2">
												Leave password fields empty to keep the current password unchanged.
											</Typography>
										</Alert>

										<Grid container spacing={3}>
											<Grid item xs={12} md={6}>
												<FormControl fullWidth variant="outlined" error={!!errors.password}>
													<InputLabel>New Password</InputLabel>
													<OutlinedInput
														label="New Password"
														name="password"
														type={showPassword ? "text" : "password"}
														value={formData.password}
														onChange={handleChange}
														endAdornment={
															<InputAdornment position="end">
																<IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
																	{showPassword ? <VisibilityOff /> : <Visibility />}
																</IconButton>
															</InputAdornment>
														}
													/>
													<FormHelperText>{errors.password}</FormHelperText>
												</FormControl>
											</Grid>
											<Grid item xs={12} md={6}>
												<FormControl fullWidth variant="outlined" error={!!errors.confirmPassword}>
													<InputLabel>Confirm New Password</InputLabel>
													<OutlinedInput
														label="Confirm New Password"
														name="confirmPassword"
														type={showConfirmPassword ? "text" : "password"}
														value={formData.confirmPassword}
														onChange={handleChange}
														endAdornment={
															<InputAdornment position="end">
																<IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
																	{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
																</IconButton>
															</InputAdornment>
														}
													/>
													<FormHelperText>{errors.confirmPassword}</FormHelperText>
												</FormControl>
											</Grid>
										</Grid>
									</Collapse>
								</Box>
							</Stack>
						</CardContent>

						<Divider />

						<CardActions sx={{ justifyContent: "space-between", p: 3 }}>
							<Box>
								{hasUnsavedChanges && (
									<Typography
										variant="body2"
										color="warning.main"
										sx={{ display: "flex", alignItems: "center", gap: 1 }}
									>
										<EditIcon fontSize="small" />
										You have unsaved changes
									</Typography>
								)}
							</Box>

							<Stack direction="row" spacing={2}>
								<Button
									variant="outlined"
									color="inherit"
									onClick={handleCancel}
									disabled={updating}
									startIcon={<CancelIcon />}
									size="large"
								>
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
							</Stack>
						</CardActions>
					</Card>
				</Stack>
			</form>
		</Box>
	);
}
