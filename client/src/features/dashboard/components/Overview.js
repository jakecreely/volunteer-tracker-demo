import { Container, Grid, Paper } from '@mui/material';
import { UpcomingBirthdayCard } from '../../birthdays'
import { SearchBar } from './SearchBar';
import { UpcomingTrainingCard } from '../../training';
import { UpcomingAwardCard } from '../../awards';
import { OutstandingDocumentsCard } from '../../documents';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export function Overview(props) {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    setSearchParams({ daysAhead: props.filterTime })
  }, [props.filterTime])

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <SearchBar
        setRefresh={props.setRefresh}
        setFilterTime={props.setFilterTime}
        applyFilter={(e) => props.applyFilter(e)}
        resetFilter={props.resetFilter}
        filterTime={props.filterTime}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={8}>
          <Grid container columns={1} spacing={3}>
            <UpcomingContainer>
              <UpcomingTrainingCard filterTime={props.filterTime} />
            </UpcomingContainer>
            <UpcomingContainer>
              <UpcomingAwardCard filterTime={props.filterTime} />
            </UpcomingContainer>
            <UpcomingContainer>
              <OutstandingDocumentsCard />
            </UpcomingContainer>
          </Grid>
        </Grid>
      <Grid item xs={12} md={12} lg={4}>
        <Grid item xs={12}>
            <UpcomingBirthdayCard handleBirthdaySubmit={props.handleBirthdaySubmit} birthdayLength={props.birthdayLength} birthdays={props.birthdays} setBirthdayLength={props.setBirthdayLength} />
        </Grid>
      </Grid>
      </Grid>
    </Container>
  )
}

function UpcomingContainer({ children }) {
  return (
    <Grid item xs={1} md={1} lg={1}>
      <Paper display="flex" flexDirection="column">
        {children}
      </Paper>
    </Grid>
  )
}