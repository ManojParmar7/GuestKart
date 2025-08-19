"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, CardActions, CardContent, CardHeader, Divider, MenuItem, Stack, TextField } from "@mui/material";

import { authClient } from "@/lib/auth/client";
import { showToast } from "@/hooks/toast-message";

import { createExtra, GetUsersBySuperadmin } from "../../../app/query-common";

export function CreateForm(): React.JSX.Element {
	const [CreateExtra] = useMutation(createExtra);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [user, setUser] = useState<any>(null);
	const loginUser = localStorage.getItem("login_id");

	const [formData, setFormData] = React.useState({
		name: "",
		price: "",
		superadminId: "",
		subadminId: "",
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
	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name) newErrors.name = "name is required";

		if (!formData?.price) newErrors.price = "price is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (validate()) {
			const payload = {
				name: formData.name,

				price: Number(formData.price),
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

			try {
				const { data } = await CreateExtra({
					variables: {
						...payload,
					},
				});

				showToast({
					message: data?.createExtra?.message || " created successfully.",
					type: "success",
				});
				router.push(`/dashboard/accessories`);
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
					name="Create Accessories"
					subheader="Fill in the details to create a new Accessories"
					sx={{ mb: 2 }}
				/>

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
								label="price"
								name="price"
								value={formData.price}
								onChange={handleChange}
								error={!!errors.price}
								helperText={errors.price}
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
					<Button variant="outlined" color="error" onClick={() => router.push(`/dashboard/accessories`)}>
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
