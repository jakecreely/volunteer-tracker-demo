import { Card, CardContent, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material"

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


    return (<Grid item xs={6}>
        <Card variant="outlined">
            <CardContent>
                <Grid >
                    <Grid item>
                        {props.training.name}
                    </Grid>
                    <Grid item>
                        {props.training.completedOn ?
                            <TextField
                                type="date"
                                name="completedOn"
                                value={moment(props.training.completedOn).format('YYYY-MM-DD')}
                                size="small"
                                id={props.training.name}
                                {...getPropsBasedOnEditValue(props.edit)}
                            /> : 
                            <TextField
                            type="date"
                            name="completedOn"
                            size="small"
                            id={props.training.name}
                            {...getPropsBasedOnEditValue(props.edit)}
                            />}

                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    </Grid>)
}