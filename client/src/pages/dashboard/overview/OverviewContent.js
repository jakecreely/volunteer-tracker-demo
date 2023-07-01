import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import BirthdayCard from './BirthdayCard'
import { UpdateContainer } from '../UpdateContainer';
import TrainingCard from '../training/TrainingCard';
import AwardCard from '../awards/AwardCard';
import DocumentCard from '../documents/DocumentCard';

export function OverviewContent(props) {

    return (
      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <UpdateContainer
          setRefresh={props.setRefresh}
          setFilterTime={props.setFilterTime}
          applyFilter={(e) => props.applyFilter(e)}
          resetFilter={props.resetFilter}
          filterTime={props.filterTime}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={8}>
            <Grid container columns={1} spacing={3}>
              <Grid item xs={1} md={1} lg={1}>
                <Paper
                  sx={{ display: 'flex', flexDirection: 'column',}}
                >
                  <TrainingCard title="Upcoming Training" filterTime={props.filterTime} />
                </Paper>
              </Grid>
              <Grid item xs={1} md={1} lg={1}>
                <Paper
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <AwardCard title="Upcoming Awards" filterTime={props.filterTime} />
                </Paper>
              </Grid>
              <Grid item xs={1} md={1} lg={1}>
                <Paper
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <DocumentCard title="Oustanding Documents" />
                </Paper>
              </Grid>
              {/* Recent Orders */}
            </Grid>
          </Grid>
          <Grid item xs={12} md={12} lg={4}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <BirthdayCard handleBirthdaySubmit={props.handleBirthdaySubmit} birthdayLength={props.birthdayLength} birthdays={props.birthdays} setBirthdayLength={props.setBirthdayLength} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    )
  
}
