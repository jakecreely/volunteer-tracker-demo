import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function NoDocuments() {
    const navigate = useNavigate()

    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant='body'>No Documents. Why not add one!</Typography>
            <br /> <br />
            <Button variant="outlined" onClick={() => navigate("/dashboard/documents/create")}>
                Create Document
            </Button>
        </Box>
    )
}