import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

export function RoleTable({ roles }) {
    const navigate = useNavigate();

    return (
        <TableContainer component={Paper} sx={{ maxWidth: 650 }}>
            <Table size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">
                            <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/roles/create")}>
                                Create Role
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {roles && roles.map((row) => (
                        <TableRow
                            key={row._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell component="th" scope="row" align="right">
                                <Button variant="outlined" size="small" onClick={() => navigate(`/dashboard/roles/update/${row._id}`)}>
                                    Update
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}