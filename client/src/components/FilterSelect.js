import { MenuItem, OutlinedInput, Select } from "@mui/material";
import * as React from 'react';
import { Box } from '@mui/system';

export function FilterSelect(props) {
    if (props.options) {
        return (
            <Select
                value={props.selected}
                onChange={props.handleSelectedChange}
                multiple
                displayEmpty
                size="small"
                renderValue={(selected) => {
                    if (selected.length === 0) {
                        return <em key={0}>{props.emptyLabel}</em>;
                    } else {
                        return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value, index) => {
                                if (index === selected.length - 1) {
                                    return (
                                        <Box key={value}>{value}</Box>
                                    )
                                } else {
                                    return (
                                        <Box key={value}>{value + ", "}</Box>
                                    )
                                }
                            })}
                        </Box>
                    }
                }}
            >
                {props.options.map((option) => (
                    <MenuItem key={option.name} value={option.name}>{option.name}</MenuItem>
                ))}
            </Select >
        )
    }
}