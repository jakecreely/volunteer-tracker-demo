import {Application} from './Application'
import {BrowserRouter} from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'

function App() {

  const theme = createTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#2d2d7e',
      },
      secondary: {
        main: '#575797',
      },
      error: {
        main: '#1F1F58',
      },
    },
  });

  return (
    <BrowserRouter>
        <ThemeProvider theme={theme}>
        <Application />
        </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
