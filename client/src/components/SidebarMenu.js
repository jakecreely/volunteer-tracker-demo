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
import { Tooltip } from '@mui/material';

export function SidebarMenu(props) {

  const navigate = useNavigate()

  const listSection = (isOpen, title, icon, navigationUrl) => {return (isOpen ? (
    <React.Fragment>
      <ListItemButton onClick={() => navigate(navigationUrl)}>
        <ListItemIcon>
          {icon} 
        </ListItemIcon>
        <ListItemText primary={title} />
      </ListItemButton>
    </React.Fragment>
  ) : <React.Fragment>
    <Tooltip title={title} placement="right">
      <ListItemButton onClick={() => navigate(navigationUrl)}>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={title} />
      </ListItemButton>
    </Tooltip>
  </React.Fragment>
  )}

  return (
    <React.Fragment>
      {listSection(props.isOpen, "Dashboard", <DashboardIcon/>, "/dashboard/overview")}
      {listSection(props.isOpen, "Training", <SchoolIcon/>, "/dashboard/training")}
      {listSection(props.isOpen, "Awards", <EmojiEventsIcon/>, "/dashboard/awards")}
      {listSection(props.isOpen, "Documents", <AssignmentIcon/>, "/dashboard/documents")}
      {listSection(props.isOpen, "Roles", <WorkIcon/>, "/dashboard/roles")}
      {listSection(props.isOpen, "Volunteers", <PeopleIcon/>, "/dashboard/volunteers")}
    </React.Fragment>
  )
}