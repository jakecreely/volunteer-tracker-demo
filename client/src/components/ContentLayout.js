import { Box } from "@mui/material";

export const ContentLayout = ({ children }) => {
    return (
    <Box p={3}>
        {children}
    </Box>
    );
}