import { Box, Button, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

export const NoTrainings = () => {
    const navigate = useNavigate()

    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant='body'>No Training. Why not add one!</Typography>
            <br /> <br />
            <Button variant="outlined" onClick={() => navigate("/dashboard/training/create")}>
                Create Training
            </Button>
        </Box>
    )
}