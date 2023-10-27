// import { Select, MenuItem, FormControlLabel, Checkbox, TextField, FormLabel, FormGroup, Grid, InputLabel, FormControl, Card, Typography, CardContent } from '@mui/material'
// import { Box } from '@mui/system';
// import React from 'react';
// import { useGetAwardsQuery, useGetDocumentsQuery, useGetRolesQuery, useGetTrainingQuery } from '../../features/api/apiSlice';
// import { AwardCard } from './detailCards/AwardDetailCard'
// import { TrainingCard } from './detailCards/TrainingDetailCard';
// import { DocumentCard } from './detailCards/DocumentDetailCard';

// export function ProfileDetailCard(props) {

//     const {
//         data: fetchedAwards,
//         isLoading: fetchedAwardsLoading,
//         isSuccess: fetchedAwardsSuccess,
//         error: fetchedAwardsError
//     } = useGetAwardsQuery()

//     const {
//         data: fetchedTraining,
//         isLoading: fetchedTrainingLoading,
//         isSuccess: fetchedTrainingSuccess,
//         error: fetchedTrainingError
//     } = useGetTrainingQuery()

//     const {
//         data: fetchedRoles,
//         isLoading: fetchedRolesLoading,
//         isSuccess: fetchedRolesSuccess,
//         error: fetchedRolesError
//     } = useGetRolesQuery()

//     const {
//         data: fetchedDocuments,
//         isLoading: fetchedDocumentsLoading,
//         isSuccess: fetchedDocumentsSuccess,
//         error: fetchedDocumentsError
//     } = useGetDocumentsQuery()

//     if (props.edit) {

//         let filteredAwards = props.volunteer.awards.filter(elem => {
//             return props.selectedAwards.includes(elem.name)
//         })

//         // Update the selected awards - just the names of the awards
//         // Add the new awards to the volunteer object - with the default values

//         let filteredTraining = props.volunteer.training.filter(elem => {
//             return props.selectedTraining.includes(elem.name)
//         })

//         return (
//             props.volunteer &&
//             <Grid container marginTop={2}>
//                 <Grid item xs={12} sx={{ paddingTop: 0, paddingBottom: 1 }}>
//                     <FormControlLabel
//                         control={<Checkbox
//                             checked={props.volunteer.isArchived}
//                             onChange={(e) => props.handleCheckboxChange(e)}
//                             name="isArchived"
//                             id="isArchived"
//                         />}
//                         label="Archived"
//                     />
//                 </Grid>
//                 <Grid item xs={12}>
//                     <FormControl fullWidth>
//                         <InputLabel id="role-select-helper-text" size="small">Roles</InputLabel>
//                         <Select
//                             multiple
//                             required
//                             id="role-select"
//                             value={props.volunteer.roles.map(role => { return role.name })}
//                             onChange={props.handleSelectedRoles}
//                             label="Role"
//                             size="small"
//                             displayEmpty
//                             renderValue={(selected) => {
//                                 if (selected.length === 0) {
//                                     return <em key={0}>{"No Roles"}</em>;
//                                 } else {
//                                     return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                         {selected.map((value, index) => {
//                                             if (index === selected.length - 1) {
//                                                 return (
//                                                     <Box key={value}>{value}</Box>
//                                                 )
//                                             } else {
//                                                 return (
//                                                     <Box key={value}>{value + ", "}</Box>
//                                                 )
//                                             }
//                                         })}
//                                     </Box>
//                                 }
//                             }}
//                         >
//                             {fetchedRolesSuccess && fetchedRoles.map((role) => {
//                                 return (
//                                     <MenuItem value={role.name}>
//                                         {role.name}
//                                     </MenuItem>
//                                 )
//                             })}
//                         </Select>
//                     </FormControl>
//                 </Grid>

//                 <Grid item sx={{ paddingInline: 3 }}>
//                     <Grid
//                         container
//                         rowSpacing={2}
//                         columnSpacing={2}
//                         sx={{ paddingTop: 2 }}
//                         alignItems="center"
//                         justify="center"
//                     >
//                         {/* TODO: This should be like the other, dropdown whatever is selected has been provided */}
//                         {fetchedDocuments.map(document => {
//                             // find the document in the volunteer object
//                             let foundDocument = props.volunteer.documents.find(elem => {
//                                 return elem.name === document.name
//                             })

//                             return (
//                                 <DocumentCard
//                                     foundDocument={foundDocument}
//                                     document={document}
//                                     isArchived={props.volunteer.isArchived}
//                                     edit={props.edit}
//                                     handleChange={props.handleDocumentChange}
//                                 />
//                                 // <Grid
//                                 //     item
//                                 //     xs={6}
//                                 // >
//                                 //     <FormControlLabel
//                                 //         label={document.name}
//                                 //         labelPlacement={'end'}
//                                 //         control={
//                                 //             <Checkbox
//                                 //                 checked={foundDocument ? foundDocument.isProvided : false}
//                                 //                 name={document.name}
//                                 //                 id={document.name}
//                                 //                 onChange={(e) => props.handleDocumentChange(e)}
//                                 //             />
//                                 //         }
//                                 //     />
//                                 // </Grid>
//                             )
//                         }
//                         )}
//                     </Grid>
//                 </Grid>

//                 <Grid item xs={12} sx={{ marginTop: 3 }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="award-select-helper-text" size="small">Awards</InputLabel>
//                         <Select
//                             multiple
//                             id="award-select"
//                             value={props.selectedAwards.map(elem => { return elem })}
//                             onChange={props.handleSelectedAwardChange}
//                             size='small'
//                             label="Awards"
//                             fullWidth
//                             displayEmpty
//                             renderValue={(selected) => {
//                                 if (selected.length === 0) {
//                                     return <em key={0}>{"No Awards"}</em>;
//                                 } else {
//                                     return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                         {selected.map((value, index) => {
//                                             if (index === selected.length - 1) {
//                                                 return (
//                                                     <Box key={value}>{value}</Box>
//                                                 )
//                                             } else {
//                                                 return (
//                                                     <Box key={value}>{value + ", "}</Box>
//                                                 )
//                                             }
//                                         })}
//                                     </Box>
//                                 }
//                             }}
//                         >
//                             {fetchedAwardsSuccess && fetchedAwards.map(award => {
//                                 return <MenuItem value={award.name}>{award.name}</MenuItem>
//                             })}
//                         </Select>
//                     </FormControl>

//                     <Grid container spacing={3} sx={{ marginTop: 0.5 }}>
//                         {filteredAwards.map(awardElem => {
//                             return (
//                                 <AwardCard
//                                     award={awardElem}
//                                     isArchived={props.volunteer.isArchived}
//                                     edit={props.edit}
//                                     handleAwardChange={props.handleAwardChange}
//                                 />
//                             )
//                         })}
//                     </Grid>
//                 </Grid>

//                 <Grid item xs={12} sx={{ marginTop: 3 }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="training-select-helper-text" size="small">Training</InputLabel>
//                         <Select
//                             multiple
//                             value={props.selectedTraining.map(elem => { return elem })}
//                             onChange={props.handleSelectedTrainingChange}
//                             size='small'
//                             fullWidth
//                             label="Training"
//                             displayEmpty
//                             renderValue={(selected) => {
//                                 if (selected.length === 0) {
//                                     return <em key={0}>{"No Training"}</em>;
//                                 } else {
//                                     return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                         {selected.map((value, index) => {
//                                             if (index === selected.length - 1) {
//                                                 return (
//                                                     <Box key={value}>{value}</Box>
//                                                 )
//                                             } else {
//                                                 return (
//                                                     <Box key={value}>{value + ", "}</Box>
//                                                 )
//                                             }
//                                         })}
//                                     </Box>
//                                 }
//                             }}
//                         >
//                             {fetchedTrainingSuccess && fetchedTraining.map((training) => {
//                                 return <MenuItem value={training.name}>{training.name}</MenuItem>
//                             })}
//                         </Select>
//                     </FormControl>

//                     <Grid container spacing={3} sx={{ marginTop: 0.5 }}>
//                         {filteredTraining.map((trainingElem) => {
//                             return (
//                                 <TrainingCard
//                                     training={trainingElem}
//                                     isArchived={props.volunteer.isArchived}
//                                     edit={props.edit}
//                                     handleTrainingChange={props.handleTrainingChange}
//                                 />
//                             )
//                         })}
//                     </Grid>
//                 </Grid>
//             </Grid>
//         )
//     } else if (props.volunteer && !props.edit && fetchedAwards && fetchedDocuments) {
//         let detailComponent = <Grid container marginTop={2}>
//             <Grid item sx={{ paddingTop: 0, paddingBottom: 1 }}>
//                 <FormControlLabel
//                     control={<Checkbox
//                         checked={props.volunteer.isArchived}
//                         name="isArchived"
//                         id="isArchived"
//                         disabled
//                     />}
//                     label="Archived"
//                 />
//             </Grid>
//             <Grid item xs={12}>
//                 <FormControl fullWidth>
//                     <InputLabel id="role-select-helper-text">Roles</InputLabel>
//                     <Select
//                         multiple
//                         id="role-select"
//                         value={props.volunteer.roles.map(elem => elem.name)}
//                         label="Role"
//                         size="small"
//                         renderValue={(selected) => {
//                             if (selected.length === 0) {
//                                 return <em key={0}>{"No Role"}</em>;
//                             } else {
//                                 return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                     {selected.map((value, index) => {
//                                         if (index === selected.length - 1) {
//                                             return (
//                                                 <Box key={value}>{value}</Box>
//                                             )
//                                         } else {
//                                             return (
//                                                 <Box key={value}>{value + ", "}</Box>
//                                             )
//                                         }
//                                     })}
//                                 </Box>
//                             }
//                         }}
//                         inputProps={{
//                             readOnly: true
//                         }}
//                     >
//                         {fetchedRolesSuccess && fetchedRoles.map((role) => {
//                             return (
//                                 <MenuItem value={role.name}>
//                                     {role.name}
//                                 </MenuItem>
//                             )
//                         })}
//                     </Select>
//                 </FormControl>
//             </Grid>

//             <Grid item sx={{ paddingInline: 3 }}>
//                 <Grid
//                     container
//                     rowSpacing={2}
//                     columnSpacing={2}
//                     sx={{ paddingTop: 2 }}
//                     alignItems="center"
//                     justify="center"
//                 >
//                     {fetchedDocuments.map(document => {
//                         let foundDocument = props.volunteer.documents.find(elem => {
//                             return elem.name === document.name
//                         })
//                         return (
//                             <DocumentCard
//                                 foundDocument={foundDocument}
//                                 document={document}
//                                 isArchived={props.volunteer.isArchived}
//                                 edit={props.edit}
//                                 handleChange={props.handleDocumentChange}
//                             />
//                         )
//                     }
//                     )}
//                 </Grid>
//             </Grid>

//             <Grid item xs={12} sx={{ marginTop: 3 }}>
//                 <Select
//                     multiple
//                     value={props.volunteer.awards.map(elem => elem.name)}
//                     size='small'
//                     fullWidth
//                     displayEmpty
//                     renderValue={(selected) => {
//                         if (selected.length === 0) {
//                             return <em key={0}>{"No Awards"}</em>;
//                         } else {
//                             return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                 {selected.map((value, index) => {
//                                     if (index === selected.length - 1) {
//                                         return (
//                                             <Box key={value}>{value}</Box>
//                                         )
//                                     } else {
//                                         return (
//                                             <Box key={value}>{value + ", "}</Box>
//                                         )
//                                     }
//                                 })}
//                             </Box>
//                         }
//                     }}
//                     inputProps={{
//                         readOnly: true
//                     }}
//                 >
//                     {fetchedAwardsSuccess && fetchedAwards.map(award => {
//                         return <MenuItem value={award.name}>{award.name}</MenuItem>
//                     })}
//                 </Select>

//                 <Grid container spacing={3} sx={{ marginTop: 0.5 }}>
//                     {props.volunteer.awards.map(awardElem => {
//                         return (
//                             <AwardCard
//                                 award={awardElem}
//                                 isArchived={props.volunteer.isArchived}
//                                 edit={props.edit}
//                                 handleAwardChange={props.handleAwardChange}
//                             />
//                         )
//                     })}
//                 </Grid>
//             </Grid>

//             <Grid item xs={12} sx={{ marginTop: 3 }}>
//                 <Select
//                     multiple
//                     value={props.volunteer.training.map(elem => elem.name)}
//                     size='small'
//                     fullWidth
//                     displayEmpty
//                     renderValue={(selected) => {
//                         if (selected.length === 0) {
//                             return <em key={0}>{"No Training"}</em>;
//                         } else {
//                             return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                 {selected.map((value, index) => {
//                                     if (index === selected.length - 1) {
//                                         return (
//                                             <Box key={value}>{value}</Box>
//                                         )
//                                     } else {
//                                         return (
//                                             <Box key={value}>{value + ", "}</Box>
//                                         )
//                                     }
//                                 })}
//                             </Box>
//                         }
//                     }}
//                     inputProps={{
//                         readOnly: true
//                     }}
//                 >
//                     {fetchedTrainingSuccess && fetchedTraining.map((training) => {
//                         return <MenuItem value={training.name}>{training.name}</MenuItem>
//                     })}
//                 </Select>

//                 <Grid container spacing={3} sx={{ marginTop: 0.5 }}>
//                     {props.volunteer.training.map((trainingElem) => {
//                         return (
//                             <TrainingCard
//                                 training={trainingElem}
//                                 isArchived={props.volunteer.isArchived}
//                                 edit={props.edit}
//                                 handleTrainingChange={props.handleTrainingChange}
//                             />
//                         )
//                     })}
//                 </Grid>
//             </Grid>
//         </Grid>

//         return detailComponent
//     }
// }