import { Box, Typography } from "@mui/material";

export function UpcomingEmpty(props) {
    return (
        <Box>
            <Typography variant="body" color="text.secondary" align="center" {...props}>
                {props.message}
            </Typography>
        </Box>
    )
}