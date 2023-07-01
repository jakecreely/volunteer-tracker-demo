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
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export function VolunteerTable(props) {

  const [open, setOpen] = React.useState(false);

  const moment = require('moment');

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell/>
            <TableCell>Name</TableCell>
            <TableCell align="right">Birthday</TableCell>
            <TableCell align="right">Start Date</TableCell>
            <TableCell align="right">Break Duration</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.volunteers !== null && props.volunteers.map((row) => {
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
                  <TableCell align="right"><Link to={`/dashboard/volunteer/${row._id}`}>View</Link></TableCell>
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
                              <TableCell>Role Type</TableCell>
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
                              <TableCell>Award Type</TableCell>
                              <TableCell>Date Achieved</TableCell>
                              <TableCell>Date Given</TableCell>
                              <TableCell>Given</TableCell>
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
                                  {awardRow.isGiven ? 'True' : 'False'}
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
                              <TableCell>Type</TableCell>
                              <TableCell>Date Completed</TableCell>
                              <TableCell>Still Valid</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.training.map((trainingRow) => (
                              <TableRow key={trainingRow.trainingId}>
                                <TableCell component="th" scope="row">
                                  {trainingRow.name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {moment(trainingRow.completeDate).format('DD-MM-YYYY')}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                  {trainingRow.needsRetraining ? 'Invalid, renew ASAP!' : 'True'}
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
                              <TableCell>Type</TableCell>
                              <TableCell>Provided</TableCell>
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
                            {/* <TableRow>
                              <TableCell component="th" scope="row">
                                Induction
                              </TableCell>
                              <TableCell component="th" scope="row">
                                {row.recruitmentDocuments['induction'] ? "True" : "False"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Photo Consent
                              </TableCell>
                              <TableCell component="th" scope="row">
                                {row.recruitmentDocuments['photoConsent'] ? "True" : "False"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Reference Check One
                              </TableCell>
                              <TableCell component="th" scope="row">
                                {row.recruitmentDocuments['referenceCheckOne'] ? "True" : "False"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Reference Check Two
                              </TableCell>
                              <TableCell component="th" scope="row">
                                {row.recruitmentDocuments['referenceCheckTwo'] ? "True" : "False"}
                              </TableCell>
                            </TableRow> */}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}