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

import { getRole, updateRole } from "../../../app/query-common";
import BannerUpdateSkeleton from "../../dashboard/loader/form-skeleton-loader";

interface FormData {
	description: any;

	name: any;
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
	const getRolesId = params?.id as string;

	// Apollo hooks
	const [updateUserMutation, { loading: updating }] = useMutation(updateRole);
	const { data, loading, error } = useQuery(getRole, {
		variables: { getRoleId: getRolesId },
		skip: !getRolesId,
		onCompleted: (data) => {
			if (data?.getRole) {
				const role = data.getRole;
				setFormData({
					name: role.name || "",

					description: role.description || "",
				});
				setOriginalData(role);
				// Set current avatar as preview if exists
				if (role.avatar) {
					setImagePreview(role.avatar);
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

		description: "",
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

		const hasChanges = formData.name !== originalData.name || formData.description !== originalData.description;
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
			updateRoleId: getRolesId,
		};
		let changeCount = 0;

		// Check for changes and add to payload
		if (formData.name !== originalData?.name) {
			payload.name = formData.name;
			changeCount++;
		}

		if (formData.description !== originalData?.description) {
			payload.description = formData.description;
			changeCount++;
		}

		// Handle image upload

		try {
			// If you need to upload image separately

			const { data: responseData } = await updateUserMutation({
				variables: {
					...payload,
					image: selectedImage,
					// Use uploaded image URL
				},
			});

			if (responseData?.updateRole?.success) {
				showToast({
					message: `${responseData?.updateRole?.message}`,
					type: "success",
				});
				router.push("/dashboard/roles");
			} else {
				showToast({
					message: responseData?.updateRole?.message || "An error occurred while updating user",
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
		router.push("/dashboard/roles");
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
				<Typography variant="h6">Roles not found</Typography>
				<Typography variant="body2">The requested Roles could not be found.</Typography>
			</Alert>
		);
	}

	return (
		<Box sx={{ width: "100%", p: 2 }}>
			<form onSubmit={handleSubmit}>
				<Card elevation={3} sx={{ p: 2 }}>
					<CardHeader name="Update Roles Information" subheader="Modify Roles details and preferences" sx={{ mb: 2 }} />

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
