import { Select, MenuItem, FormControlLabel, Checkbox, TextField, FormLabel, FormGroup, Grid, InputLabel, FormControl, InputAdornment } from '@mui/material'
import { Box } from '@mui/system';
import React from 'react';
import { useGetAwardsQuery, useGetDocumentsQuery, useGetRolesQuery, useGetTrainingQuery } from '../../../lib/apiSlice';
import { AwardCard } from './AwardDetailCard';
import { TrainingCard } from './TrainingDetailCard';
import { DocumentCard } from './DocumentDetailCard';
const moment = require('moment')

export function EditProfileDetails(props) {

    const {
        data: fetchedAwards,
        isLoading: fetchedAwardsLoading,
        isSuccess: fetchedAwardsSuccess,
        error: fetchedAwardsError
    } = useGetAwardsQuery()

    const {
        data: fetchedTraining,
        isLoading: fetchedTrainingLoading,
        isSuccess: fetchedTrainingSuccess,
        error: fetchedTrainingError
    } = useGetTrainingQuery()

    const {
        data: fetchedRoles,
        isLoading: fetchedRolesLoading,
        isSuccess: fetchedRolesSuccess,
        error: fetchedRolesError
    } = useGetRolesQuery()

    const {
        data: fetchedDocuments,
        isLoading: fetchedDocumentsLoading,
        isSuccess: fetchedDocumentsSuccess,
        error: fetchedDocumentsError
    } = useGetDocumentsQuery()

    if (props.editedVolunteer && props.initialVolunteer && props.upcomingAwards) {
        let filteredAwards = props.editedVolunteer.awards.filter(elem => {
            return props.selectedAwards.includes(elem.name)
        })

        // Update the selected awards - just the names of the awards
        // Add the new awards to the volunteer object - with the default values

        let filteredTraining = props.editedVolunteer.training.filter(elem => {
            return props.selectedTraining.includes(elem.name)
        })

        return (
            <Grid container spacing={2}>
                <Grid item md={6} sm={12}>
                    <TextField
                        fullWidth
                        type="text"
                        id="name"
                        value={props.editedVolunteer.name}
                        label={"Name: " + props.initialVolunteer.name}
                        onChange={props.handleChange}
                        size="small"
                        disabled={props.editedVolunteer.isArchived}
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
                        disabled={props.editedVolunteer.isArchived}
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
                        disabled={props.editedVolunteer.isArchived}
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
                        disabled={props.editedVolunteer.isArchived}
                        size="small"
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="role-select-helper-text" size="small">Roles</InputLabel>
                        <Select
                            multiple
                            required
                            id="role-select"
                            value={props.editedVolunteer.roles.map(role => { return role.name })}
                            onChange={props.handleSelectedRoles}
                            label="Role"
                            size="small"
                            disabled={props.editedVolunteer.isArchived}
                            displayEmpty
                            renderValue={(selected) => {
                                return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value, index) => {
                                        if (index === selected.length - 1) {
                                            return (
                                                <Box key={value}>{value}</Box>
                                            )
                                        } else {
                                            return (
                                                <Box key={value}>{value + ", "}</Box>
                                            )
                                        }
                                    })}
                                </Box>
                            }}
                        >
                            {fetchedRolesSuccess && fetchedRoles.map((role) => {
                                return (
                                    <MenuItem value={role.name} key={role._id}>{role.name}</MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid
                    item
                    margin="auto"
                >
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        justifyContent="center" // Center content horizontally
                        alignItems="center" // Center content vertically
                    >
                        {/* TODO: This should be like the other, dropdown whatever is selected has been provided */}
                        {fetchedDocuments.map(document => {
                            // find the document in the volunteer object
                            let foundDocument = props.editedVolunteer.documents.find(elem => {
                                return elem.name === document.name
                            })

                            return (
                                <Grid item xs={6} md={4} lg={3} key={document._id}>
                                    <DocumentCard
                                        foundDocument={foundDocument}
                                        document={document}
                                        isArchived={props.editedVolunteer.isArchived}
                                        edit={true}
                                        handleChange={props.handleDocumentChange}
                                    />
                                </Grid>
                                // <Grid
                                //     item
                                //     xs={6}
                                // >
                                //     <FormControlLabel
                                //         label={document.name}
                                //         labelPlacement={'end'}
                                //         control={
                                //             <Checkbox
                                //                 checked={foundDocument ? foundDocument.isProvided : false}
                                //                 name={document.name}
                                //                 id={document.name}
                                //                 onChange={(e) => props.handleDocumentChange(e)}
                                //             />
                                //         }
                                //     />
                                // </Grid>
                            )
                        }
                        )}
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="award-select-helper-text" size="small">Awards</InputLabel>
                        <Select
                            multiple
                            id="award-select"
                            value={props.selectedAwards.map(elem => { return elem })}
                            onChange={props.handleSelectedAwardChange}
                            size='small'
                            label="Awards"
                            fullWidth
                            displayEmpty
                            disabled={props.editedVolunteer.isArchived}
                            renderValue={(selected) => {
                                return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value, index) => {
                                        if (index === selected.length - 1) {
                                            return (
                                                <Box key={value}>{value}</Box>
                                            )
                                        } else {
                                            return (
                                                <Box key={value}>{value + ", "}</Box>
                                            )
                                        }
                                    })}
                                </Box>
                            }}
                        >
                            {fetchedAwardsSuccess && fetchedAwards.map(award => {
                                return <MenuItem value={award.name} key={award._id}>{award.name}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <Grid container spacing={3} sx={{ marginTop: -1 }}>
                        {filteredAwards.map(awardElem => {
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={4} key={awardElem.awardId}>
                                    <AwardCard
                                        award={awardElem}
                                        isArchived={props.editedVolunteer.isArchived}
                                        edit={true}
                                        handleAwardChange={props.handleAwardChange}
                                    />
                                </Grid>
                            )
                        })}
                        {props.upcomingAwards.map(awardElem => {
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={4} key={awardElem.awardId}>
                                    <AwardCard
                                        award={awardElem}
                                        isArchived={props.editedVolunteer.isArchived}
                                        isUpcoming={true}
                                        handleAwardChange={props.handleAwardChange}
                                        handleAddingUpcomingAward={props.handleAddingUpcomingAward}
                                    />
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel id="training-select-helper-text" size="small">Training</InputLabel>
                        <Select
                            multiple
                            value={props.selectedTraining.map(elem => { return elem })}
                            onChange={props.handleSelectedTrainingChange}
                            size='small'
                            fullWidth
                            label="Training"
                            disabled={props.editedVolunteer.isArchived}
                            displayEmpty
                            renderValue={(selected) => {
                                return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value, index) => {
                                        if (index === selected.length - 1) {
                                            return (
                                                <Box key={value}>{value}</Box>
                                            )
                                        } else {
                                            return (
                                                <Box key={value}>{value + ", "}</Box>
                                            )
                                        }
                                    })}
                                </Box>
                            }}
                        >
                            {fetchedTrainingSuccess && fetchedTraining.map((training) => {
                                return <MenuItem value={training.name} key={training._id}>{training.name}</MenuItem>
                            })}
                        </Select>
                    </FormControl>

                    <Grid container spacing={1} sx={{ marginTop: 0.5 }}>
                        {filteredTraining.map((trainingElem) => {
                            const overdueTraining = props.overdueTraining.find(elem => {
                                return elem.trainingId === trainingElem.trainingId
                            })
                            return (
                                <Grid item xs={6} key={trainingElem.trainingId}>
                                    <TrainingCard
                                        training={trainingElem}
                                        isArchived={props.editedVolunteer.isArchived}
                                        edit={true}
                                        handleTrainingChange={props.handleTrainingChange}
                                        overdueTraining={overdueTraining}
                                    />
                                </Grid>
                            )
                        })}
                        {props.missingTraining.map((trainingElem) => {
                            return (
                                <Grid item xs={6} key={trainingElem.trainingId}>
                                    <TrainingCard
                                        training={trainingElem}
                                        isArchived={props.editedVolunteer.isArchived}
                                        edit={true}
                                        isMissing={true}
                                        handleAddingMissingTraining={props.handleAddingMissingTraining}
                                    />
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}