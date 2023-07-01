import React from "react"
import { Grid, InputAdornment, TextField } from '@mui/material'

export function ProfileCard(props) {

   let profileCard

   const moment = require('moment')

   if (props.edit) {
      profileCard = <Grid container spacing={2}>
         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="text"
               id="name"
               value={props.formVolunteer.name}
               label={"Name: " + props.fetchedVolunteer.name}
               onChange={props.handleChange}
               size="small"
            />
         </Grid>

         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="number"
               id="breakDuration"
               value={props.formVolunteer.breakDuration}
               label={"Break Duration: " + props.fetchedVolunteer.breakDuration}
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
               value={moment(props.formVolunteer.birthday).format('YYYY-MM-DD')}
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
               value={moment(props.formVolunteer.startDate).format('YYYY-MM-DD')}
               label={"Start Date"}
               onChange={props.handleChange}
               size="small"
            />
         </Grid>
      </Grid>
   } else if (props.fetchedVolunteer) {
      profileCard = <Grid container spacing={2}>
         <Grid item md={6} sm={12}>
            <TextField
               fullWidth
               type="text"
               id="name"
               value={props.fetchedVolunteer.name}
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
               value={props.fetchedVolunteer.breakDuration}
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
               value={moment(props.fetchedVolunteer.birthday).format('YYYY-MM-DD')}
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
               value={moment(props.fetchedVolunteer.startDate).format('YYYY-MM-DD')}
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