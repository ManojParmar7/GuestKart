"use client";

import React from "react";
import { Box, Card, CardContent, Divider, Grid, Skeleton, Stack } from "@mui/material";

export default function BannerUpdateSkeleton() {
	return (
		<Box sx={{ width: "100%", p: 2 }}>
			<Stack spacing={3}>
				<Card elevation={2}>
					<CardContent sx={{ p: 4 }}>
						<Stack spacing={4}>
							{/* Banner Image Skeleton */}
							<Box>
								<Skeleton variant="text" width={220} height={28} />
								<Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 2 }}>
									<Skeleton variant="circular" width={120} height={120} />
									<Stack spacing={2}>
										<Skeleton variant="rectangular" width={150} height={40} />
										<Skeleton variant="text" width={150} height={20} />
									</Stack>
								</Stack>
							</Box>

							<Divider />

							{/* Title Skeleton */}
							<Box>
								<Skeleton variant="text" width={180} height={28} />
								<Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
							</Box>

							{/* Sub Title Skeleton */}
							<Box>
								<Skeleton variant="text" width={200} height={28} />
								<Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
							</Box>

							{/* Description Skeleton */}
							<Box>
								<Skeleton variant="text" width={180} height={28} />
								<Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
							</Box>

							<Divider />

							{/* Action Buttons Skeleton */}
							<Grid container justifyContent="flex-end" spacing={2}>
								<Grid item>
									<Skeleton variant="rectangular" width={100} height={40} />
								</Grid>
								<Grid item>
									<Skeleton variant="rectangular" width={140} height={40} />
								</Grid>
							</Grid>
						</Stack>
					</CardContent>
				</Card>
			</Stack>
		</Box>
	);
}
