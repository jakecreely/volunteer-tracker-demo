import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NotFoundPage(props) {
    return (
        <Box justifyContent={'center'} display={'flex'} flexDirection={"column"} alignItems={'center'} height={'100vh'}>
            <Box item>
                    <Typography variant={'h5'}>404 - Page Not Found</Typography>
            </Box>
            <Box item>
                <Typography variant={'h6'}>
                    You seem to be lost... head back to the <Link to="/dashboard/overview">Dashboard</Link>
                </Typography>
            </Box>
      </Box>
    )
}