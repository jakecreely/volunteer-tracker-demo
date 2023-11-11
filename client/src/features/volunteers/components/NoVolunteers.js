import { Box, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function NoVolunteers() {
    const navigate = useNavigate()

    return (
        <Grid container justifyContent={'center'}>
            <Grid item xs={12} md={10} lg={8}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant='body'>No Volunteers. Why not add one!</Typography>
                    <br /> <br />
                    <Button variant="outlined" onClick={() => navigate("/dashboard/volunteers/create")}>
                        Create Volunteer
                    </Button>
                </Box>
            </Grid>
        </Grid>
    )
}