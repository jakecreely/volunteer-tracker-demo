import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';

export function SecondarySidebarMenu(props) {

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
      {listSection(props.isOpen, "Import Data", <SettingsIcon/>, "/dashboard/settings")}
      {listSection(props.isOpen, "Mailing List", <EmailIcon/>, "/dashboard/mailing-list")}
    </React.Fragment>
    )
  }