import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function NoAwards() {
    const navigate = useNavigate()

    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant='body'>No Awards Here. Why not add one!</Typography>
            <br /> <br />
            <Button variant="outlined" onClick={() => navigate("/dashboard/awards/create")}>
                Create Award
            </Button>
        </Box>
    )
}