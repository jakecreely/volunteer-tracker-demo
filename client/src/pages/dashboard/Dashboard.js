import * as React from 'react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { SidebarMenu } from '../../components/navigation/SidebarMenu';
import { SecondarySidebarMenu } from '../../components/navigation/SecondarySidebarMenu'
import { Routes, Route } from "react-router-dom";
import { OverviewContent } from './overview/OverviewContent';
import { TrainingContainer } from './training/TrainingContainer';
import { VolunteerContainer } from './volunteer/VolunteerContainer';
import { AwardContainer } from './awards/AwardContainer';
import { DocumentContainer } from './documents/DocumentContainer';
import { VolunteerProfile } from '../profile/VolunteerProfile';
import { CreateVolunteerForm } from '../create-volunteer/CreateVolunteerForm';
import { Copyright } from '../../components/Copyright';
import { RoleContainer } from './roles/RoleContainer';

const drawerWidth = 200;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

function DashboardContent(props) {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{display: 'flex'}}>
      <CssBaseline />
      <AppBar position="absolute" elevation={0} open={open}>
        <Toolbar
          sx={{
            pr: '24px',
            // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="white"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Volunteer Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          <SidebarMenu />
          <Divider sx={{ my: 1 }} />
          <SecondarySidebarMenu />
        </List>
      </Drawer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Box
          component="header"
          sx={{
            // Header styles
          }}
        >
          <Toolbar />
        </Box>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flex: '1 0 auto',
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/overview" element={<OverviewContent {...props} />} />
            <Route path="/volunteers" element={<VolunteerContainer volunteers={props.volunteers} roles={props.roles} />} />
            <Route path="/volunteer/:id" element={<VolunteerProfile setUpdate={props.setUpdate} fetchedAwards={props.awards} fetchedTraining={props.training} fetchedRoles={props.roles} />} />
            <Route path="/training/*" element={<TrainingContainer setUpdate={props.setUpdate} volunteers={props.volunteers} training={props.training} />} />
            <Route path="/awards/*" element={<AwardContainer setUpdate={props.setUpdate} volunteers={props.volunteers} awards={props.awards} />} />
            <Route path="/documents/*" element={<DocumentContainer />} />
            <Route path="/roles/*" element={<RoleContainer />} />
            <Route path="/create-volunteer" element={<CreateVolunteerForm setUpdate={props.setUpdate} fetchedAwards={props.awards} fetchedTraining={props.training} fetchedRoles={props.roles} />} />
          </Routes>
        </Box>
        <Box
          component="footer"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            paddingBottom: 4,
          }}
        >
          <Container>
            <Typography variant="body2" color="text.secondary" align="center">
              <Copyright />
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default function Dashboard(props) {
  return (
    <DashboardContent {...props} />
  )
}