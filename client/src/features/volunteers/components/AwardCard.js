import { Button, Card, CardContent, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@mui/material"
import { formatDate } from "../../../utils/dateUtils";

export function AwardCard(props) {
  const getEditProps = (edit) => {
    if (edit) {
      return {
        onChange: (e) => props.handleAwardChange(e),
        inputProps: { readOnly: false }

      }
    } else {
      return {
        inputProps: { readOnly: true }
      }
    }
  }

  let dateGivenField = <TextField
    type="date"
    helperText="Date Given"
    name="givenDate"
    id={props.award.name}
    value={formatDate(props.award.givenDate)}
    size="small"
    disabled={props.isArchived || props.isUpcoming}
    {...getEditProps(props.edit)}
  />

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container direction="column" alignItems="center" spacing={1}>
          <Grid item>
            <Grid container spacing={1}>
              <Grid item>
                <Typography gutterBottom variant="h6" component="div" color={props.isUpcoming ? 'gray' : 'black'}>
                  {props.award.name}
                </Typography>
              </Grid>
              {props.isUpcoming && <Grid item>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                  props.handleAddingUpcomingAward(props.award)
                  }}
                  disabled={props.isArchived}
                >
                  Add Due
                </Button>
              </Grid>}
            </Grid>
          </Grid>
          <Grid item>
            <TextField
              type="date"
              helperText="Date Achieved"
              name="achievedDate"
              required
              id={props.award.name}
              value={formatDate(props.award.achievedDate)}
              size="small"
              disabled={props.isArchived || props.isUpcoming}
              {...getEditProps(props.edit)}
            />
          </Grid>
          <Grid item>{dateGivenField}</Grid>
        </Grid>
      </CardContent>
    </Card>
  );


}