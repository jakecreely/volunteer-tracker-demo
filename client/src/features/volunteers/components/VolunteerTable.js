import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, IconButton, Typography, Box, Button, TablePagination } from '@mui/material/';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
const moment = require('moment');

export function VolunteerTable({ volunteers }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [noOfEmptyRows, setNoOfEmptyRows] = useState(0);

  useEffect(() => {
    setPage(0)
  }, [volunteers])

  useEffect(() => {
    const noOfEmptyRows = page >= 0 ? Math.max(0, (1 + page) * rowsPerPage - volunteers.length) : 0;
    setNoOfEmptyRows(noOfEmptyRows)
  }, [page, rowsPerPage, volunteers])

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

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
          {volunteers !== null && volunteers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                  <TableCell align="right"><Button variant="outlined" size="small" onClick={() => navigate(`/dashboard/volunteers/${row._id}`)}>View Profile</Button></TableCell>
                </TableRow>
                <TableRow key={row._id + "sub"}>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open[row._id]} timeout="auto" unmountOnExit>
                      <RolesSubTable roles={row.roles} />
                      <AwardSubTable awards={row.awards} />
                      <TrainingSubTable training={row.training} />
                      <DocumentsSubTable documents={row.documents} />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            )
          })}
          <EmptyRows noOfEmptyRows={noOfEmptyRows} />
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={volunteers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  )
}

function EmptyRows({ noOfEmptyRows }) {
  if (noOfEmptyRows > 0) {
    return (
      <TableRow
        style={{
          height: 48 * noOfEmptyRows,
        }}
      >
        <TableCell colSpan={6} />
      </TableRow>
    )
  }
}


function SubTableContainer({ children }) {
  return (
    <Box sx={{ margin: 1 }}>
      {children}
    </Box>
  )
}

function DocumentsSubTable({ documents }) {
  return (
    <SubTableContainer>
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
          {documents.map((documentRow) => (
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
    </SubTableContainer>
  )
}

function TrainingSubTable({ training }) {
  return (
    <SubTableContainer>
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
          {training.map((trainingRow) => (
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
    </SubTableContainer>
  )
}

function AwardSubTable({ awards }) {
  return (
    <SubTableContainer>
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
          {awards.map((awardRow) => (
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
    </SubTableContainer>
  )
}

function RolesSubTable({ roles }) {
  return (
    <SubTableContainer>
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
          {roles.map((roleRow) => (
            <TableRow key={roleRow.roleId}>
              <TableCell component="th" scope="row">
                {roleRow.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SubTableContainer>
  )
}