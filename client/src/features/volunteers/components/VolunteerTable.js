import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, TablePagination } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

export function VolunteerTable(props) {

  const [open, setOpen] = React.useState(false);
  const moment = require('moment');
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    setPage(0)
  }, [props.volunteers])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - props.volunteers.length) : 0;

  let emptyRowsFilled = []
  if (emptyRows > 0) {
    for (let i = 0; i < emptyRows; i++) {
      emptyRowsFilled.push(<TableRow style={{ border: 'none' }} />)
    }
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell align="right">Birthday</TableCell>
            <TableCell align="right">Start Date</TableCell>
            <TableCell align="right">Break Duration</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.volunteers !== null && props.volunteers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
            let rowColour = row.isArchived ? "#f4f5f7" : "white"
            return (
              <React.Fragment>
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, "backgroundColor": rowColour }}
                  key={row._id}
                >
                  <TableCell>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => setOpen((prev) => ({ ...prev, [row._id]: !prev[row._id] }))}
                    >
                      {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{moment(row.birthday).format("DD-MM-YYYY")}</TableCell>
                  <TableCell align="right">{moment(row.startDate).format("DD-MM-YYYY")}</TableCell>
                  <TableCell align="right">{row.breakDuration} Days</TableCell>
                  <TableCell align="right"><Button variant="outlined" size="small" onClick={() => navigate(`/dashboard/volunteer/${row._id}`)}>View Profile</Button></TableCell>
                </TableRow>
                <TableRow key={row._id + "sub"}>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open[row._id]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Roles
                        </Typography>
                        <Table size="small" aria-label="roles">
                          <TableHead>
                            <TableRow>
                              <TableCell>Role Name</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.roles.map((roleRow) => (
                              <TableRow key={roleRow.roleId}>
                                <TableCell component="th" scope="row">
                                  {roleRow.name}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>

                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Awards
                        </Typography>
                        <Table size="small" aria-label="roles">
                          <TableHead>
                            <TableRow>
                              <TableCell>Award Name</TableCell>
                              <TableCell>Date Achieved</TableCell>
                              <TableCell>Date Given</TableCell>
                              <TableCell>Award Given</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.awards.map((awardRow) => (
                              <TableRow key={awardRow.awardId}>
                                <TableCell component="th" scope="row">
                                  {awardRow.name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {moment(awardRow.achievedDate).format("DD-MM-YYYY")}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {moment(awardRow.givenDate).format("DD-MM-YYYY")}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {awardRow.isGiven ? 'Given' : 'Not Given'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>

                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Training
                        </Typography>
                        <Table size="small" aria-label="roles">
                          <TableHead>
                            <TableRow>
                              <TableCell>Training Name</TableCell>
                              <TableCell>Date Completed</TableCell>
                              <TableCell>Needs Retraining</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.training.map((trainingRow) => (
                              <TableRow key={trainingRow.trainingId}>
                                <TableCell component="th" scope="row">
                                  {trainingRow.name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {moment(trainingRow.completedOn).format('DD-MM-YYYY')}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {trainingRow.needsRetraining ? 'Yes' : 'No'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>

                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Recruitment Documents
                        </Typography>
                        <Table size="small" aria-label="roles">
                          <TableHead>
                            <TableRow>
                              <TableCell>Document Name</TableCell>
                              <TableCell>Document Provided</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.documents.map((documentRow) => (
                              <TableRow key={documentRow.documentId}>
                                <TableCell component="th" scope="row">
                                  {documentRow.name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {documentRow.isProvided ? 'Provided' : 'Not Provided'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            )
          })}
          {emptyRows > 0 && (
            <TableRow
              style={{
                height: 48 * emptyRows,
              }}
            >
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={props.volunteers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  )
}