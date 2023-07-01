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

export function TrainingTable(props) {
  let navigate = useNavigate();

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Length (Years)</TableCell>
            <TableCell>Excluded Roles</TableCell>
            <TableCell align="right">
              <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/training/create")}>
                Create Training
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.training && props.training.map((row) => (
            <TableRow
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row" >
                {row.name}
              </TableCell>
              <TableCell component="th" scope="row" >
                {row.renewalFrequency}
              </TableCell>
              <TableCell>
                {row.excludedRoles.map((role) => (
                  <div key={role.name}>{role.name}</div>
                ))}
              </TableCell>
              <TableCell component="th" scope="row" align="right" >
                <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/training/update/" + row._id)}>Update</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}