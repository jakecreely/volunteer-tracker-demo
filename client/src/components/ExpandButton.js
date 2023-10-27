import { IconButton } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export function ExpandButton (props) {
    if (props.expanded) {
        return (
            <IconButton onClick={() => props.setExpanded(!props.expanded)}>
                <ExpandMoreIcon />
            </IconButton>
        )
    } else {
        return (
            <IconButton onClick={() => props.setExpanded(!props.expanded)}>
                <ExpandLessIcon />
            </IconButton>
        )
    }
}