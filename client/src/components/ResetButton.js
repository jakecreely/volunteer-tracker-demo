import { Button } from "@mui/material"

export const ResetButton = (props) => {
    return (
        <Button
            onClick={props.handleReset}
            variant="outlined"
            color="secondary"
        >
            Clear
        </Button>
    )
}