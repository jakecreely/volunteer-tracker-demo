import { Grid } from "@mui/material"
import { ContentLayout } from "../../../components/ContentLayout"

export const TrainingContainer = ({ children }) => {
    return (
        <ContentLayout>
            <Grid container justifyContent={'center'} >
                <Grid item xs={12} md={10} lg={8}>
                    {children}
                </Grid>
            </Grid>
        </ContentLayout>
    )
}