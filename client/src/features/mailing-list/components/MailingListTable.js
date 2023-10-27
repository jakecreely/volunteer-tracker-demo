import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

export default function MailingListTable(props) {
    let navigate = useNavigate();

    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email Address</TableCell>
                        <TableCell>Email Frequency (Days)</TableCell>
                        <TableCell>Days To Search Ahead By</TableCell>
                        <TableCell>Subscribed</TableCell>
                        <TableCell align="right">
                            <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/mailing-list/add")}>
                                Add Person
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.mailingList && props.mailingList.map((row) => (
                        <TableRow
                            key={row._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {row.emailAddress}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {row.frequency}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {row.upcomingDays}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {row.subscribed ? "Yes" : "No"}
                            </TableCell>
                            <TableCell component="th" scope="row" align="right">
                                <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/mailing-list/update/" + row._id)}>Update</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}