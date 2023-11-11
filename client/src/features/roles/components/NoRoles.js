import { Box, Button, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

export const NoRoles = () => {
    const navigate = useNavigate()

    return (
        <Box sx={{ textAlign: 'center'}}>
            <Typography variant='body'>No Roles. Why not add one!</Typography>
            <br /> <br />
            <Button variant="outlined" onClick={() => navigate("/dashboard/roles/create")}>
                Create Role
            </Button>
        </Box>
    )
}