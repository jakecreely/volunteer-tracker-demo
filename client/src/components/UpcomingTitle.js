import { Grid } from "@mui/material"
import Title from "./Title"
import { ExpandButton } from "./ExpandButton"

export function UpcomingTitle({ title, expanded, setExpanded}) {
    return (
        <Grid container paddingBottom={1} justifyContent="space-between">
            <Grid item>
                <Title>{title}</Title>
            </Grid>
            <Grid item>
                <ExpandButton expanded={expanded} setExpanded={setExpanded} />
            </Grid>
        </Grid>
    )
}