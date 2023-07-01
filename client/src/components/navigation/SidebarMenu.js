import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';

export function SidebarMenu() {

  const navigate = useNavigate()

  return (
  <React.Fragment>
    <ListItemButton onClick={() => navigate('/dashboard/overview')}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary={"Dashboard"}/>
    </ListItemButton>
    <ListItemButton onClick={() => navigate('/dashboard/training')}>
      <ListItemIcon>
        <SchoolIcon />
      </ListItemIcon>
      <ListItemText primary={"Training"} />
    </ListItemButton>
    <ListItemButton onClick={() => navigate('/dashboard/awards')}>
      <ListItemIcon>
        <EmojiEventsIcon />
      </ListItemIcon>
      <ListItemText primary={"Awards"} />
    </ListItemButton>
    <ListItemButton onClick={() => navigate('/dashboard/documents')}>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary={"Documents"} />
    </ListItemButton>
    <ListItemButton onClick={() => navigate('/dashboard/roles')}>
      <ListItemIcon>
        <WorkIcon />
      </ListItemIcon>
      <ListItemText primary={"Roles"} />
    </ListItemButton>
    <ListItemButton onClick={() => navigate('/dashboard/volunteers')}>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary={"Volunteers"} />
    </ListItemButton>
  </React.Fragment>
  )
}