"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { Button, Card, CardActions, CardContent, CardHeader, Divider, Stack, TextField } from "@mui/material";

import { showToast } from "@/hooks/toast-message"; // adjust the path accordingly

import { createRole } from "../../../app/query-common";

export function CreateForm(): React.JSX.Element {
	const [CreateRoles] = useMutation(createRole);
	const [formData, setFormData] = React.useState({
		name: "",
		description: "",
	});
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

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

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name) newErrors.name = "name is required";

		if (!formData?.description) newErrors.description = "description is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			const payload = {
				name: formData.name,

				description: formData.description,
			};

			try {
				const { data } = await CreateRoles({
					variables: {
						...payload,
					},
				});

				showToast({
					message: data?.createRole?.message || " created successfully.",
					type: "success",
				});
				router.push(`/dashboard/roles`);
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
				<CardHeader name="Create Roles" subheader="Fill in the details to create a new roles" sx={{ mb: 2 }} />

				<CardContent>
					<Stack spacing={4}>
						{/* Profile Image Upload Section */}

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
								label="description"
								name="description"
								type="textarea"
								value={formData.description}
								onChange={handleChange}
								error={!!errors.description}
								helperText={errors.description}
							/>
						</Stack>

						{/* Security Section */}
					</Stack>
				</CardContent>

				<Divider sx={{ my: 2 }} />

				<CardActions sx={{ justifyContent: "flex-end", gap: 2 }}>
					<Button variant="outlined" color="error" onClick={() => router.push(`/dashboard/roles`)}>
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
