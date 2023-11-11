import { Grid } from "@mui/material"
import { ContentLayout } from "../../../components/ContentLayout"

export const AwardContainer = ({ children }) => {
    return (
        <ContentLayout>
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} md={6} lg={5}>
                    {children}
                </Grid>
            </Grid>
        </ContentLayout>
    )
}