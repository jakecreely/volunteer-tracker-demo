import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Fragment } from 'react';
import { MenuItem } from './MenuItem';

export function SidebarMenu(props) {
  return (
    <Fragment>
      <MenuItem
        isOpen={props.isOpen}
        title="Dashboard"
        icon={<DashboardIcon />}
        navigationUrl="/dashboard/overview"
      />
      <MenuItem
        isOpen={props.isOpen}
        title="Training"
        icon={<SchoolIcon />}
        navigationUrl="/dashboard/training"
      />
      <MenuItem
        isOpen={props.isOpen}
        title="Awards"
        icon={<EmojiEventsIcon />}
        navigationUrl="/dashboard/awards"
      />
      <MenuItem
        isOpen={props.isOpen}
        title="Documents"
        icon={<AssignmentIcon />}
        navigationUrl="/dashboard/documents"
      />
      <MenuItem
        isOpen={props.isOpen}
        title="Roles"
        icon={<WorkIcon />}
        navigationUrl="/dashboard/roles"
      />
      <MenuItem
        isOpen={props.isOpen}
        title="Volunteers"
        icon={<PeopleIcon />}
        navigationUrl="/dashboard/volunteers"
      />
    </Fragment>
  )
}