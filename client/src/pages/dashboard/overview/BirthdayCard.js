import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from '../../../components/Title.js';
import { Button, FormHelperText, Grid, Input, TableContainer } from '@mui/material';
import { FormControl, MenuItem, InputLabel, Select } from '@mui/material'
import { Box } from '@mui/system';
import { useGetUpcomingVolunteerBirthdaysQuery } from '../../../features/api/apiSlice.js';
import { UpcomingEmpty } from '../../../components/Empty.js';
import { LoadingTableSkeleton } from '../LoadingTableSkeleton.js';

export default function BirthdayCard(props) {

  const moment = require('moment');

  const {
    data: upcomingBirthdays,
    error: upcomingBirthdaysError,
    isLoading: upcomingBirthdaysLoading,
    isSuccess: upcomingBirthdaysSuccess
  } = useGetUpcomingVolunteerBirthdaysQuery(props.birthdayLength)

  const handleInput = (e) => {
    props.setBirthdayLength(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    props.handleBirthdaySubmit(e)
  }

  if (props.birthdayLength) {
    return (
      <React.Fragment>
        <Title>Upcoming Birthdays</Title>
        <Box>
          <FormControl fullWidth>
            <Grid alignItems="center" container spacing={2}>
              <Grid item xs={8}>
                <Select
                  labelId="filter-label"
                  id="filter-select"
                  size="small"
                  fullWidth
                  value={props.birthdayLength}
                  onChange={(e) => handleInput(e)}
                >
                  <MenuItem value={7}>Next 7 Days</MenuItem>
                  <MenuItem value={14}>Two Weeks</MenuItem>
                  <MenuItem value={31}>1 Month</MenuItem>
                  <MenuItem value={93}>3 Months</MenuItem>
                  <MenuItem value={186}>6 Months</MenuItem>
                  <MenuItem value={365}>12 Months</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={4}>
                <Button fullWidth variant="outlined" onClick={(e) => handleSubmit(e)}>Find</Button>
              </Grid>
            </Grid>
          </FormControl>
        </Box>
        {upcomingBirthdaysSuccess ?
          (upcomingBirthdays && upcomingBirthdays.length > 0 ?
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Birthday</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingBirthdaysSuccess && upcomingBirthdays.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{moment(row.birthday).format('DD-MM-YYYY')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            :
            <UpcomingEmpty message="No Upcoming Birthdays" />
          )
          :
          <LoadingTableSkeleton />
        }
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        Loading Birthdays...
      </React.Fragment>
    )
  }
}