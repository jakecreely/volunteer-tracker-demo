import { Grid, LinearProgress } from "@mui/material"

export const LoadingTableSkeleton = (props) => {
    return (
        <Grid container justifyContent={'center'}>
        <Grid item xs={12} md={6}>
            <LinearProgress />
        </Grid>
    </Grid>
    )
}