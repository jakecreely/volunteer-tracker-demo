import Title from '../../../components/Title.js';
import { Grid, Paper, TableContainer } from '@mui/material';
import { FormControl, MenuItem, Select } from '@mui/material'
import { Box } from '@mui/system';
import { useGetUpcomingVolunteerBirthdaysQuery } from '../../../lib/apiSlice.js';
import { UpcomingEmpty } from '../../../components/UpcomingEmpty.js';
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton.js';
import { UpcomingBirthdayTable } from './UpcomingBirthdayTable.js';
import { BasicError } from '../../../components/BasicError.js';
import { Fragment } from 'react';
import { ContentLayout } from '../../../components/ContentLayout.js';

export function UpcomingBirthdayCard(props) {
  const {
    data: upcomingBirthdays,
    isLoading: fetchingUpcomingBirthdays,
    isSuccess: upcomingBirthdaysSuccess,
    isError: upcomingBirthdaysFailed,
    error: upcomingBirthdaysErrorData,
  } = useGetUpcomingVolunteerBirthdaysQuery(props.birthdayLength)

  const handleInput = (e) => {
    props.setBirthdayLength(e.target.value)
  }

  if (props.birthdayLength) {
    return (
      <Paper sx={{p: 2, display: 'flex', flexDirection: 'column'}}>
        <Title>Upcoming Birthdays</Title>
        <Box>
          <FormControl fullWidth>
            <Grid alignItems="center" container spacing={2}>
              <Grid item xs={12}>
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
            </Grid>
          </FormControl>
        </Box>
        {upcomingBirthdaysSuccess && <UpcomingBirthdaysDisplay
          upcomingBirthdays={upcomingBirthdays}
          fetchingUpcomingBirthdays={fetchingUpcomingBirthdays}
          upcomingBirthdaysFailed={upcomingBirthdaysFailed}
          upcomingBirthdaysErrorData={upcomingBirthdaysErrorData} 
        />}
      </Paper>
    );
  } else {
    return <LoadingTableSkeleton />
  }
}

function UpcomingBirthdaysDisplay(props) {
  if (props.fetchingUpcomingBirthdays) return <LoadingTableSkeleton />
  if (props.upcomingBirthdaysFailed) return <BasicError error={props.upcomingBirthdaysErrorData} />

  if (props.upcomingBirthdays && props.upcomingBirthdays.length > 0) {
    return (
      <TableContainer>
        <UpcomingBirthdayTable birthdays={props.upcomingBirthdays} />
      </TableContainer>
    )
  } else {
    return <UpcomingEmpty message="No Upcoming Birthdays" />
  }
}