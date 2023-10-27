import { Alert, AlertTitle } from "@mui/material";

export default function AuthenticationAlert(props) {
    return (
        <Alert sx={{p: 2}} severity="error">
            <AlertTitle>
                Authentication Required
            </AlertTitle>
            User Authentication required to view volunteers - please login
        </Alert>
    )
}