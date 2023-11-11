import { TableCell, TableSortLabel } from '@mui/material'

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
