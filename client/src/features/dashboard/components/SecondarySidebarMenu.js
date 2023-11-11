import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import { Fragment } from 'react';
import { MenuItem } from './MenuItem';

export function SecondarySidebarMenu(props) {
  return (
    <Fragment>
      <MenuItem
        isOpen={props.isOpen}
        title="Import Data"
        icon={<SettingsIcon />}
        navigationUrl="/dashboard/importing"
      />
      <MenuItem
        isOpen={props.isOpen}
        title="Mailing List"
        icon={<EmailIcon />}
        navigationUrl="/dashboard/mailing-list"
      />
    </Fragment>
  )
}