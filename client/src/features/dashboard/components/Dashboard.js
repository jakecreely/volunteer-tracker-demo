import { CssBaseline, Box, Toolbar } from '@mui/material';
import { Copyright } from '../../../components/Copyright';
import { DashboardRoutes } from '../routes/DashboardRoutes';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

function DashboardContent(props) {
  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header open={open} toggleDrawer={toggleDrawer} />
      <Sidebar open={open} toggleDrawer={toggleDrawer} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Toolbar />
        <MainContainer>
          <DashboardRoutes {...props} />
        </MainContainer>
        <FooterContainer>
          <Copyright />
        </FooterContainer>
      </Box>
    </Box>
  );
}

export function Dashboard(props) {
  return (
    <DashboardContent {...props} />
  )
}

function MainContainer({ children }) {
  return (
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
      {children}
    </Box>
  )
}

function FooterContainer({ children }) {
  return (
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
      {children}
    </Box>
  )
}