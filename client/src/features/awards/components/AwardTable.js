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

export default function AwardTable(props) {
    let navigate = useNavigate();

    return (
        <TableContainer component={Paper} sx={{ maxWidth: 650 }}>
            <Table size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Length (Months)</TableCell>
                        <TableCell align="right">
                            <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/awards/create")}>
                                Create Award
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.awards && props.awards.map((row) => (
                        <TableRow
                            key={row._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {row.requiredServiceLength}
                            </TableCell>
                            <TableCell component="th" scope="row" align="right">
                                <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/awards/update/" + row._id)}>Update</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}