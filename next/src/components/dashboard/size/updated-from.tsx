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

import { getSizesById, updateSize } from "../../../app/query-common";
import BannerUpdateSkeleton from "../../dashboard/loader/form-skeleton-loader";

interface FormData {
	price: any;

	name: any;
}

interface UserData {
	id: string;
	name: any;
	price: any;
	createdAt: string;
	superadminId?: any;
	subadminId?: any;
}

export function UpdateForm(): React.JSX.Element {
	const theme = useTheme();
	const router = useRouter();
	const params = useParams();
	const getSizeId = params?.id as string;

	// Apollo hooks
	const [updateSizes, { loading: updating }] = useMutation(updateSize);
	const { data, loading, error } = useQuery(getSizesById, {
		variables: { getSizeId: getSizeId },
		skip: !getSizeId,
		onCompleted: (data) => {
			if (data?.getSize) {
				const size = data.getSize;
				setFormData({
					name: size.name || "",
					price: size.price || "",
				});
				setOriginalData(size);
				// Set current avatar as preview if exists
				if (size.avatar) {
					setImagePreview(size.avatar);
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

		price: "",
	});

	const [originalData, setOriginalData] = React.useState<UserData | null>(null);
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

	// Image upload states
	const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string>("");
	const [imageChanged, setImageChanged] = React.useState(false);

	// Check for unsaved changes
	React.useEffect(() => {
		if (!originalData) return;

		const hasChanges = formData.name !== originalData.name || formData.price !== originalData.price;
		setHasUnsavedChanges(hasChanges);
	}, [formData, originalData]);

	// Image upload handlers

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

			case "price":
				return value.toString().length < 1 ? "Price must be at least 1 digits" : "";

				return !value.trim() ? "price must be at least 3 characters" : "";

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
			updateSizeId: getSizeId,
			subadminId: originalData?.subadminId,
			superadminId: originalData?.superadminId,
		};
		let changeCount = 0;

		// Check for changes and add to payload
		if (formData.name !== originalData?.name) {
			payload.name = formData.name;
			changeCount++;
		}

		if (formData.price !== originalData?.price) {
			payload.price = Number(formData.price);
			changeCount++;
		}

		// Handle image upload

		try {
			// If you need to upload image separately

			const { data: responseData } = await updateSizes({
				variables: {
					...payload,
				},
			});

			if (responseData?.updateSize?.success) {
				showToast({
					message: `${responseData?.updateSize?.message}`,
					type: "success",
				});
				router.push("/dashboard/size");
			} else {
				showToast({
					message: responseData?.updateSize?.message || "An error occurred while updating user",
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
		router.push("/dashboard/size");
	};

	// Loading state
	if (loading) {
		return (
			<>
				<BannerUpdateSkeleton />
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
					<Button color="inherit" size="small" onClick={() => router.push("/dashboard/size")}>
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
					<Button color="inherit" size="small" onClick={() => router.push("/dashboard/size")}>
						Go Back
					</Button>
				}
			>
				<Typography variant="h6">Size not found</Typography>
				<Typography variant="body2">The requested Size could not be found.</Typography>
			</Alert>
		);
	}

	return (
		<Box sx={{ width: "100%", p: 2 }}>
			<form onSubmit={handleSubmit}>
				<Card elevation={3} sx={{ p: 2 }}>
					<CardHeader name="Update Size Information" subheader="Modify Size details and preferences" sx={{ mb: 2 }} />

					<CardContent>
						<Stack spacing={4}>
							{/* Profile Image Upload Section */}

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
									label="price"
									name="price"
									value={formData.price}
									onChange={handleChange}
									error={!!errors.price}
									helperText={errors.price}
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
