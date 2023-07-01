import * as React from 'react';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Title from '../Title';
import { useNavigate } from 'react-router-dom';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TableSortLabel } from '@mui/material'

export function SortableCell(props) {
    return (
        <TableCell onClick={() => props.handleSortChange(props.id)}>
            <TableSortLabel
                active={props.sorting.columnToSort === props.id}
                direction={props.sorting.columnToSort === props.id ? props.sorting.sortDirection : "asc"}
            >
                {props.label}
            </TableSortLabel>
        </TableCell>

    )
}
