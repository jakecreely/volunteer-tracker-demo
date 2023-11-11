import { Alert, Grid, Snackbar } from "@mui/material";

export function StatusSnackbar(props) {
    return (
        <Snackbar open={true} autoHideDuration={6000} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <Alert severity={props.statusType} sx={{ width: '100%' }} >
                <Grid container direction="row" gap={1}>
                    <Grid item>
                        {props.statusTitle}
                    </Grid>
                    {props.errorMessage && <Grid item>
                        {props.errorMessage}
                    </Grid>}
                </Grid>
            </Alert>
        </Snackbar>
    )
}