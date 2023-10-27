import { Select, MenuItem, FormControlLabel, Checkbox, TextField, FormLabel, FormGroup, Grid, InputLabel, FormControl, Card, Typography, CardContent, InputAdornment } from '@mui/material'
import { Box } from '@mui/system';
import React from 'react';

export function ProfileCard(props) {

   let profileCard

   const moment = require('moment')

   if (props.isEditing) {
      profileCard = <Grid container spacing={2}>
         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="text"
               id="name"
               value={props.editedVolunteer.name}
               label={"Name: " + props.initialVolunteer.name}
               onChange={props.handleChange}
               size="small"
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="number"
               id="breakDuration"
               value={props.editedVolunteer.breakDuration}
               label={"Break Duration: " + props.initialVolunteer.breakDuration}
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
               value={moment(props.editedVolunteer.birthday).format('YYYY-MM-DD')}
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
               value={moment(props.editedVolunteer.startDate).format('YYYY-MM-DD')}
               label={"Start Date"}
               onChange={props.handleChange}
               size="small"
            />
         </Grid>
      </Grid>
   } else if (props.initialVolunteer) {
      profileCard = <Grid container spacing={2}>
         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="text"
               id="name"
               value={props.initialVolunteer.name}
               label={"Name"}
               size="small"
               InputProps={{
                  readOnly: true
               }}
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="number"
               id="breakDuration"
               value={props.initialVolunteer.breakDuration}
               label={"Break Duration"}
               InputProps={{
                  endAdornment: <InputAdornment position="end">Days</InputAdornment>,
                  readOnly: true
               }}
               size="small"
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="date"
               id="birthday"
               value={moment(props.initialVolunteer.birthday).format('YYYY-MM-DD')}
               label={"Birthday"}
               InputProps={{
                  readOnly: true
               }}
               size="small"
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="date"
               id="startDate"
               value={moment(props.initialVolunteer.startDate).format('YYYY-MM-DD')}
               label={"Start Date"}
               InputProps={{
                  readOnly: true
               }}
               size="small"
            />
         </Grid>
      </Grid>
   }

   return (
      profileCard
   )
}