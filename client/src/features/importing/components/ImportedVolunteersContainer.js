import { Alert, AlertTitle, Box, Button, Grid } from "@mui/material"
import { BasicError } from "../../../components/BasicError"
import { LoadingTableSkeleton } from "../../../components/LoadingTableSkeleton"
import { ImportedVolunteersList } from "./ImportedVolunteersList"

export function ImportedVolunteersContainer(props) {

    if (props.importVolunteersFailed) return <BasicError error={props.importVolunteersErrorData.data} />
    if (props.importingVolunteers) return <LoadingTableSkeleton />

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <Alert severity="error" >
                    <AlertTitle>
                        Import Failed For {props.editedVolunteers.filter(elem => elem.errors.length > 0).length} out of {props.editedVolunteers.length} volunteers!
                    </AlertTitle>
                    No volunteer have been created. You will need to fix each volunteer errors before you can create them.
                </Alert>
            </Grid>
            <Grid item>
                <ImportedVolunteersList editedVolunteers={props.editedVolunteers} setSelectedVolunteer={props.setSelectedVolunteer} setSelectedIndex={props.setSelectedIndex} setModalOpen={props.setModalOpen} handleSkipVolunteer={props.handleSkipVolunteer} />
            </Grid>
            <Grid item>
                <Box pt={1}>
                    <Grid container justifyContent="right">
                        {
                            props.editedVolunteers.every((elem) => {
                                return elem.errors.every((elem) => { return elem.fixed === true }) || elem.skipped
                            }) ?
                                <Button variant="contained" component="label" pt={3} onClick={(e) => props.handleSaveAll(e)}>
                                    Create Selected Volunteers
                                </Button>
                                :
                                <Button variant="contained" component="label" pt={3} disabled>
                                    Create Selected Volunteers
                                </Button>
                        }
                    </Grid>
                </Box>
            </Grid>
        </Grid>
    )
}