import { Grid } from '@mui/material';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export function Copyright(props) {
  return (
    <Grid container direction="column" gap={1}>
      <Grid item>
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
          {"For demo purposes only."}
          <Link color="inherit" href='https://linkedin.com/in/jake-creely/'>
          {"Feel free to contact me for more information."}
          </Link>
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
          {"Developed by "}
          <Link color="inherit" href="https://github.com/jakecreely">
            Jake Creely
          </Link>
        </Typography>
      </Grid>
    </Grid>
  );
}