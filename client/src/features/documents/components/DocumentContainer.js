import { Grid } from "@mui/material"
import { ContentLayout } from "../../../components/ContentLayout"

export const DocumentContainer = ({ children }) => {
    return (
        <ContentLayout>
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={4}>
                    {children}
                </Grid>
            </Grid>
        </ContentLayout>
    )
}