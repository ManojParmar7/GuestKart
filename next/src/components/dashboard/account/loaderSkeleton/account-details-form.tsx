import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Divider, Grid, Skeleton } from "@mui/material";

export function AccountDetailsFormSkeleton(): React.JSX.Element {
	return (
		<Card>
			<CardHeader title={<Skeleton width="30%" />} subheader={<Skeleton width="50%" />} />
			<Divider />
			<CardContent>
				<Grid container spacing={3}>
					{Array.from({ length: 5 }).map((_, i) => (
						<Grid item md={6} xs={12} key={i}>
							<Skeleton height={56} />
						</Grid>
					))}
				</Grid>
			</CardContent>
			<Divider />
			<CardActions sx={{ justifyContent: "flex-end" }}>
				<Button disabled variant="contained">
					<Skeleton width={100} height={24} />
				</Button>
			</CardActions>
		</Card>
	);
}
