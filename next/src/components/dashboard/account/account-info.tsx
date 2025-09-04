import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
	user: any | null;
	onImageChange: (imageUrl: string | null, file: File | null) => void;
};

export function AccountInfo({ user, onImageChange }: Props): React.JSX.Element {
	const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		onImageChange(url, file);
	};

	// Reset preview when user is updated
	React.useEffect(() => {
		if (user?.image && !previewUrl) {
			setPreviewUrl(null);
		}
	}, [user?.image]);

	const isLoading = !user;

	return (
		<Card>
			<CardContent>
				<Stack spacing={2} sx={{ alignItems: "center" }}>
					<div>
						{isLoading ? (
							<Skeleton variant="circular" width={80} height={80} />
						) : (
							<Avatar
								src={previewUrl || (user?.image && `${process.env.NEXT_PUBLIC_API_URL}${user?.image}`)}
								sx={{ height: "80px", width: "80px" }}
							/>
						)}
					</div>
					<Stack spacing={1} sx={{ textAlign: "center", width: "100%" }}>
						{isLoading ? (
							<>
								<Skeleton variant="text" width="60%" height={30} sx={{ mx: "auto" }} />
								<Skeleton variant="text" width="40%" height={20} sx={{ mx: "auto" }} />
							</>
						) : (
							<>
								<Typography variant="h5">{user?.name || "No Name"}</Typography>
								<Typography color="text.secondary" variant="body2">
									{user?.country || "-"}
								</Typography>
							</>
						)}
					</Stack>
				</Stack>
			</CardContent>
			<Divider />
			<CardActions>
				<Button component="label" fullWidth variant="text" disabled={isLoading}>
					Upload picture
					<input type="file" accept="image/*" hidden onChange={handleImageUpload} />
				</Button>
			</CardActions>
		</Card>
	);
}
