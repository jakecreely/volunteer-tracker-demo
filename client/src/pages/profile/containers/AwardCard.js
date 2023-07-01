import { Card, CardContent, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material"

export function AwardCard(props) {

    const moment = require('moment');

    const getEditProps = (edit) => {
        if (edit) {
            return {
                onChange: (e) => props.handleAwardChange(e),
                inputProps: {readOnly: false} 

            }
        } else {
            return { 
                inputProps: {readOnly: true} 
            }
        }
    }

    let dateGivenField = <TextField
        type="date"
        helperText="Date Given"
        name="givenDate"
        id={props.award.name}
        value={moment(props.award.givenDate).format('YYYY-MM-DD')}
        size="small"
        required={props.award.isGiven}
        disabled={!props.award.isGiven}
        {...getEditProps(props.edit)}
    />

    return (<Grid item xs={6}>
        <Grid fullWidth xs={12}>
            <Card variant="outlined" >
                <CardContent>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item md={8} xs={6}>
                                <Typography
                                    gutterBottom
                                    variant="h6"
                                    component="div">
                                    {props.award.name}
                                </Typography>
                            </Grid>
                            <Grid item md={4} xs={6}>
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={props.award.isGiven}
                                        name="isGiven"
                                        id={props.award.name}
                                        {...getEditProps(props.edit)}
                                    />}
                                    label="Given"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <TextField
                            type="date"
                            helperText="Date Achieved"
                            name="achievedDate"
                            required
                            id={props.award.name}
                            value={moment(props.award.achievedDate).format('YYYY-MM-DD')}
                            size="small"
                            {...getEditProps(props.edit)}
                            />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        {dateGivenField}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    </Grid>)
}