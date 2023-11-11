import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material"
import { Fragment } from "react"
import { useNavigate } from "react-router-dom"

export function MenuItem({ isOpen, title, icon, navigationUrl }) {
    const navigate = useNavigate()

    if (isOpen) {
        return (
            <Fragment>
                <ListItemButton onClick={() => navigate(navigationUrl)}>
                    <ListItemIcon>
                        {icon}
                    </ListItemIcon>
                    <ListItemText primary={title} />
                </ListItemButton>
            </Fragment>
        )
    } else {
        return (
            <Fragment>
                <Tooltip title={title} placement="right">
                    <ListItemButton onClick={() => navigate(navigationUrl)}>
                        <ListItemIcon>
                            {icon}
                        </ListItemIcon>
                        <ListItemText primary={title} />
                    </ListItemButton>
                </Tooltip>
            </Fragment>
        )
    }
}