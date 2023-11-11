import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export function UpcomingBirthdayTable(props) {
    const moment = require('moment');

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Birthday</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.birthdays.map((row) => (
                    <TableRow key={row._id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{moment(row.birthday).format('DD-MM-YYYY')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}