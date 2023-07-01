import { Checkbox, FormControlLabel, Grid } from "@mui/material";

export function DocumentCard(props) {

    const getPropsBasedOnEditValue = (edit) => {
        if (edit) {
            return {
                onChange: (e) => props.handleChange(e)
            }
        } else {
            return { 
                inputProps: {readOnly: true}
            }
        }
    }

    return (
        <Grid item xs={6} >
            <FormControlLabel
                label={props.document.name}
                labelPlacement={'end'}
                control={
                    <Checkbox
                        checked={props.foundDocument ? props.foundDocument.isProvided : false}
                        name={props.document.name}
                        id={props.document.name}
                        {...getPropsBasedOnEditValue(props.edit)}
                    />
                }
            />
        </Grid>
    )
}