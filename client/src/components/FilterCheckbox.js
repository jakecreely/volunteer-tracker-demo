import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import * as React from 'react';

export function FilterCheckbox(props) {
    return (
        <FormGroup>
            <FormControlLabel control={<Checkbox checked={props.checked} onChange={props.handleChange}/>} label={props.label} />
        </FormGroup>
    )
}