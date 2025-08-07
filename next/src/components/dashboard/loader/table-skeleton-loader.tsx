import React from "react";
import { Box, Card, Divider, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const TableSkeletonLoader = ({ rowsPerPage = 5 }) => {
	const skeletonRows = Array.from({ length: rowsPerPage });

	return (
		<Card>
			<Box sx={{ overflowX: "auto" }}>
				<Table sx={{ minWidth: "1500px" }}>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Skeleton variant="rectangular" width={20} height={20} />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" width={80} height={20} />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" width={100} height={20} />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" width={80} height={20} />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" width={80} height={20} />
							</TableCell>
							<TableCell>
								<Skeleton variant="text" width={90} height={20} />
							</TableCell>
							<TableCell align="center">
								<Skeleton variant="text" width={70} height={20} />
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{skeletonRows.map((_, index) => (
							<TableRow key={index}>
								<TableCell padding="checkbox">
									<Skeleton variant="rectangular" width={20} height={20} />
								</TableCell>
								<TableCell>
									<Stack direction="row" spacing={2} alignItems="center">
										<Skeleton variant="circular" width={40} height={40} />
										<Skeleton variant="text" width={100} height={20} />
									</Stack>
								</TableCell>
								<TableCell>
									<Skeleton variant="text" width={140} />
								</TableCell>
								<TableCell>
									<Skeleton variant="text" width={100} />
								</TableCell>
								<TableCell>
									<Skeleton variant="text" width={100} />
								</TableCell>
								<TableCell>
									<Skeleton variant="text" width={80} />
								</TableCell>
								<TableCell align="center">
									<Stack direction="row" spacing={1} justifyContent="center">
										<Skeleton variant="circular" width={24} height={24} />
										<Skeleton variant="circular" width={24} height={24} />
									</Stack>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Box>
			<Divider />
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					p: 2,
				}}
			>
				<Skeleton variant="text" width={100} height={30} />
				<Stack direction="row" spacing={2}>
					<Skeleton variant="circular" width={30} height={30} />
					<Skeleton variant="circular" width={30} height={30} />
				</Stack>
			</Box>
		</Card>
	);
};

export default TableSkeletonLoader;
