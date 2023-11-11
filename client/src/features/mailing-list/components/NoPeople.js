import { Box, Button, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

export function NoPeople() {
    const navigate = useNavigate()

    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant='body'>No One In The Mailing List. Why not add someone!</Typography>
            <br /> <br />
            <Button variant="outlined" onClick={() => navigate("/dashboard/mailing-list/add")}>
                Add Person
            </Button>
        </Box>
    )
}