import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material/';
import { useNavigate } from "react-router-dom";

export function TrainingTable({ training }) {
  let navigate = useNavigate();

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Length (Years)</TableCell>
            <TableCell>Roles Excluded From Training</TableCell>
            <TableCell align="right">
              <Button variant="outlined" size="small" onClick={() => navigate("/dashboard/training/create")}>
                Create Training
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {training && training.map((row) => (
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
                <Button variant="outlined" size="small" onClick={() => navigate(`/dashboard/training/update/${row._id}`)}>
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