"use client";

import React, { useEffect, useState } from "react";
import { updateUser } from "@/app/QueryCommon";
import { useMutation } from "@apollo/client";
import { Alert, Snackbar } from "@mui/material";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { config } from "@/config";
import { authClient } from "@/lib/auth/client";
import { emitUserUpdate } from "@/lib/events";
import { showToast } from "@/hooks/toast-message";
import { AccountDetailsForm } from "@/components/dashboard/account/account-details-form";
import { AccountInfo } from "@/components/dashboard/account/account-info";

export default function Page(): React.JSX.Element {
	const [user, setUser] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);

	const [notification, setNotification] = useState({
		open: false,
		message: "",
		severity: "success" as "success" | "error",
	});

	const [updateUserMutation, { loading: updating }] = useMutation(updateUser);

	useEffect(() => {
		document.title = `Dashboard | Account | ${config.site.name}`;

		(async () => {
			const { data } = await authClient.getUser();
			console.log("data: ", data);
			setUser(data);
		})();

		// emitUserUpdate();
	}, []);

	const onUpdate = async (updatedPayload: any) => {
		try {
			if (!user?.id) return;

			const variables = {
				updateUserId: user.id,
				name: updatedPayload.name,
				username: updatedPayload.username,
				email: updatedPayload.email,
				phone: updatedPayload.phone,
				website: updatedPayload.website,
				createdBy: updatedPayload.createdBy,
				password: user.password,
				image: selectedImage,
			};
			emitUserUpdate();

			console.log("payload: ", variables);
			const { data: responseData } = await updateUserMutation({
				variables,
			});
			console.log("responseData", responseData);
			if (responseData?.updateUser) {
				showToast({
					message: `${responseData?.updateUser?.message || "Updated successfully"}`,
					type: "success",
				});
			} else {
				showToast({
					message: responseData?.updateUser?.message || "An error occurred while updating user",
					type: "error",
				});
			}
		} catch (error) {
			console.error("Update error:", error);
			showToast({
				message: "Something went wrong while updating",
				type: "error",
			});
		}
	};

	const handleImageChange = (previewUrl: string | null, file: File | null) => {
		console.log("Preview URL: ", previewUrl);
		console.log("File to upload: ", file);
		setSelectedImage(file);
	};

	const handleCloseNotification = () => {
		setNotification({ ...notification, open: false });
	};

	return (
		<>
			<Stack spacing={3}>
				<div>
					<Typography variant="h4">Account</Typography>
				</div>
				<Grid container spacing={3}>
					<Grid
						size={{
							lg: 4,
							md: 6,
							xs: 12,
						}}
					>
						<AccountInfo user={user} onImageChange={handleImageChange} />
					</Grid>
					<Grid
						size={{
							lg: 8,
							md: 6,
							xs: 12,
						}}
					>
						<AccountDetailsForm user={user} onUpdate={onUpdate} loading={updating} />
					</Grid>
				</Grid>
			</Stack>

			<Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
				<Alert onClose={handleCloseNotification} severity={notification.severity}>
					{notification.message}
				</Alert>
			</Snackbar>
		</>
	);
}
