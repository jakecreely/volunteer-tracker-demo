import React, { useEffect } from "react"
import { Grid, InputAdornment, TextField, useFormControl } from '@mui/material'

export function CreateCard(props) {

   const moment = require('moment')

   return (
      <Grid container spacing={2}>
         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               required
               type="text"
               id="name"
               value={props.volunteer.name}
               label="Name"
               onChange={props.handleChange}
               size="small"
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="number"
               id="breakDuration"
               required
               value={props.volunteer.breakDuration}
               label={"Break Duration"}
               onChange={props.handleChange}
               InputProps={{
                  endAdornment: <InputAdornment position="end">Days</InputAdornment>
               }}
               size="small"
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="date"
               id="birthday"
               required
               value={moment(props.volunteer.birthday).format('YYYY-MM-DD')}
               label={"Birthday"}
               onChange={props.handleChange}
               size="small"
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="date"
               id="startDate"
               required
               value={moment(props.volunteer.startDate).format('YYYY-MM-DD')}
               label={"Start Date"}
               onChange={props.handleChange}
               size="small"
            />
         </Grid>
      </Grid>
   )
}