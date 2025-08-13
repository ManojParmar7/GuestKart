"use client";

// eslint-disable-next-line unicorn/no-abusive-eslint-disable
/* eslint-disable */
import * as React from "react";
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
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import dayjs from "dayjs";

import { showToast } from "@/hooks/toast-message";

import { GetCategotyById, UpdateCategory } from "../../../app/query-common";
import CategoriesUpdateSkeleton from "../../dashboard/loader/form-skeleton-loader";

interface FormData {
	description: any;
	slug: any;
	name: any;
	superadminId?: any;
	subadminId?: any;
}

interface UserData {
	image: string;
	id: string;
	description: any;
	slug: any;
	name: any;
	avatar?: string;
	createdAt: string;
	superadminId?: any;
	subadminId?: any;
}

export function UpdateForm(): React.JSX.Element {
	const theme = useTheme();
	const router = useRouter();
	const params = useParams();
	const getCategoryId = params?.id as string;

	// Apollo hooks
	const [updateUserMutation, { loading: updating }] = useMutation(UpdateCategory);
	const { data, loading, error } = useQuery(GetCategotyById, {
		variables: { getCategoryId: getCategoryId },
		skip: !getCategoryId,
		onCompleted: (data) => {
			if (data?.getCategory) {
				const categories = data.getCategory;
				setFormData({
					name: categories.name || "",
					slug: categories.slug || "",
					description: categories.description || "",
				});
				setOriginalData(categories);
				// Set current avatar as preview if exists
				if (categories.avatar) {
					setImagePreview(categories.avatar);
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
	const [formData, setFormData] = React.useState({
		name: "",
		slug: "",
		description: "",
		superadminId: "",
		subadminId: "",
	});

	const [originalData, setOriginalData] = React.useState<UserData | null>(null);
	console.log("originalData: ", originalData);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [passwordChange, setPasswordChange] = React.useState(false);

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
			formData.slug !== originalData.slug ||
			formData.description !== originalData.description ||
			imageChanged;
		setHasUnsavedChanges(hasChanges);
	}, [formData, originalData, imageChanged]);

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
		console.log("name: ", name);
		switch (name) {
			case "name":
				return !value.trim() ? "name is required" : "";
			case "slug":
				return !value.trim() ? "slug is required" : value.length < 3 ? "slug must be at least 3 characters" : "";
			case "discription":
				return !value.trim() ? "discription must be at least 3 characters" : "";

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
		const payload: any = {
			updateCategoryId: getCategoryId,
			subadminId: originalData?.subadminId,
			superadminId: originalData?.superadminId,
		};
		let changeCount = 0;

		// Check for changes and add to payload
		if (formData.name !== originalData?.name) {
			payload.name = formData.name;
			changeCount++;
		}
		if (formData.slug !== originalData?.slug) {
			payload.slug = formData.slug;
			changeCount++;
		}
		if (formData.description !== originalData?.description) {
			payload.description = formData.description;
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

			if (responseData?.updateCategory?.success) {
				showToast({
					message: `${responseData?.updateCategory?.message}`,
					type: "success",
				});
				router.push("/dashboard/categories");
			} else {
				showToast({
					message: responseData?.updateCategory?.message || "An error occurred while updating user",
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

	// Loading state
	if (loading) {
		return (
			<>
				<CategoriesUpdateSkeleton />
			</>
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
				<Typography variant="h6">Categories not found</Typography>
				<Typography variant="body2">The requested Categories could not be found.</Typography>
			</Alert>
		);
	}

	return (
		<Box sx={{ width: "100%", p: 2 }}>
			<form onSubmit={handleSubmit}>
				<Card elevation={3} sx={{ p: 2 }}>
					<CardHeader
						name="Update Categories Information"
						subheader="Modify Categories details and preferences"
						sx={{ mb: 2 }}
					/>

					<CardContent>
						<Stack spacing={4}>
							{/* Profile Image Upload Section */}
							<Box>
								<Typography variant="slug1" gutterBottom sx={{ fontWeight: 600 }}>
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
										{imagePreview || originalData?.image ? (
											<Box
												component="img"
												src={imagePreview || `http://localhost:8000${originalData?.image}`}
												alt="Categories Preview"
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
									label="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									error={!!errors.name}
									helperText={errors.name}
								/>
								<TextField
									fullWidth
									label="Sub name"
									name="slug"
									value={formData.slug}
									onChange={handleChange}
									error={!!errors.slug}
									helperText={errors.slug}
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
							</Stack>
						</Stack>
					</CardContent>

					<Divider sx={{ my: 2 }} />

					<CardActions sx={{ justifyContent: "flex-end", gap: 2 }}>
						<Button variant="outlined" color="error" onClick={handleCancel} disabled={updating}>
							Cancel
						</Button>
						<Button
							variant="contained"
							type="submit"
							disabled={updating || !hasUnsavedChanges}
							startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
						>
							{updating ? "Updating..." : "Update"}
						</Button>
					</CardActions>
				</Card>
			</form>
		</Box>
	);
}
