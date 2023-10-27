import { Button, Card, CardContent, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material"
import { formatDate } from "../../../utils/dateUtils";

export function TrainingCard(props) {

    const moment = require('moment');

    const getPropsBasedOnEditValue = (edit) => {
        if (edit) {
            return {
                onChange: (e) => props.handleTrainingChange(e),
                required: true
            }
        } else {
            return {
                inputProps: { readOnly: true }
            }
        }
    }


    return (
        <Card variant="outlined">
            <CardContent>
                <Grid container justifyContent="space-between" direction="row">
                    <Grid item>
                        <Grid container spacing={1} direction='column'>
                            <Grid item>
                        <Typography gutterBottom component="div" color={props.isMissing ? "gray" : "black"}>
                            {props.training.name}
                        </Typography>
                        </Grid>
                        {props.overdueTraining && <Grid item>
                            <Typography variant="body2" color="error">Overdue by {moment().diff(moment(props.overdueTraining.dateDue), 'days')} days</Typography>
                        </Grid>}
                        {props.isMissing && <Grid item>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={() => { 
                                    props.handleAddingMissingTraining(props.training)
                                }}
                                disabled={props.isArchived}
                                >
                                    Add Missing Training
                                </Button>
                        </Grid>}
                        </Grid>
                    </Grid>
                    <Grid item>
                        {props.training.completedOn ?
                            <TextField
                                type="date"
                                name="completedOn"
                                helperText="Date Completed"
                                value={formatDate(props.training.completedOn)}
                                size="small"
                                id={props.training.name}
                                {...getPropsBasedOnEditValue(props.edit)}
                                disabled={props.isArchived || props.isMissing}
                            /> :
                            <TextField
                                type="date"
                                name="completedOn"
                                size="small"
                                helperText="Date Completed"
                                id={props.training.name}
                                {...getPropsBasedOnEditValue(props.edit)}
                                disabled={props.isArchived || props.isMissing}
                            />}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>)
}