import React, { useEffect, useState } from "react";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CircularProgress,
	Divider,
	FormControl,
	Grid,
	InputLabel,
	OutlinedInput,
} from "@mui/material";

import { AccountDetailsFormSkeleton } from "../account/loaderSkeleton/account-details-form"; // Adjust path

type User = {
	id: string;
	name: string;
	username: string;
	email: string;
	phone: string;
	website: string;
	country: string;
	currency: string;
	createdBy?: string | null;
	superadmin_id?: string | null;
};

export function AccountDetailsForm({
	user,
	onUpdate,
	loading,
}: {
	user: User | null;
	onUpdate: (updatedPayload: Partial<User>) => void;
	loading?: boolean;
}): React.JSX.Element {
	const [formData, setFormData] = useState<Partial<User>>({});

	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name,
				username: user.username,
				email: user.email,
				phone: user.phone,
				website: user.website,
			});
		}
	}, [user]);

	const handleChange = (field: keyof User) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
		setFormData((prev) => ({
			...prev,
			[field]: typeof e.target.value === "string" ? e.target.value.trim() : e.target.value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onUpdate(formData);
	};

	if (!user) return <AccountDetailsFormSkeleton />;

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader subheader="The information can be edited" title="Profile" />
				<Divider />
				<CardContent>
					<Grid container spacing={3}>
						<Grid item md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Name</InputLabel>
								<OutlinedInput
									label="Name"
									value={formData.name || ""}
									onChange={handleChange("name")}
									disabled={loading}
								/>
							</FormControl>
						</Grid>

						<Grid item md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Username</InputLabel>
								<OutlinedInput
									label="Username"
									value={formData.username || ""}
									onChange={handleChange("username")}
									disabled={loading}
								/>
							</FormControl>
						</Grid>

						<Grid item md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Email</InputLabel>
								<OutlinedInput
									label="Email"
									type="email"
									value={formData.email || ""}
									onChange={handleChange("email")}
									disabled={loading}
								/>
							</FormControl>
						</Grid>

						<Grid item md={6} xs={12}>
							<FormControl fullWidth>
								<InputLabel>Phone</InputLabel>
								<OutlinedInput
									label="Phone"
									type="tel"
									value={formData.phone || ""}
									onChange={handleChange("phone")}
									disabled={loading}
								/>
							</FormControl>
						</Grid>

						<Grid item md={6} xs={12}>
							<FormControl fullWidth>
								<InputLabel>Website</InputLabel>
								<OutlinedInput
									label="Website"
									value={formData.website || ""}
									onChange={handleChange("website")}
									disabled={loading}
								/>
							</FormControl>
						</Grid>
					</Grid>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button
						type="submit"
						variant="contained"
						disabled={loading}
						startIcon={loading ? <CircularProgress size={20} /> : null}
					>
						{loading ? "Saving..." : "Save Details"}
					</Button>
				</CardActions>
			</Card>
		</form>
	);
}
