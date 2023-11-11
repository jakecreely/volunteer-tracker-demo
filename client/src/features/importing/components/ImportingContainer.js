import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAddVolunteerMutation, useImportVolunteersMutation } from "../../../lib/apiSlice";
import Title from "../../../components/Title";
import { VolunteerModal } from "./VolunteerModal";
import { useCreateFeedbackDisplay } from "../../../hooks/useCreateFeedbackDisplay";
import { ImportedVolunteersContainer } from "./ImportedVolunteersContainer";

export function ImportingContainer() {
    const [file, setFile] = useState(null)
    const [editedVolunteers, setEditedVolunteers] = useState(null)
    const [selectedVolunteer, setSelectedVolunteer] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    const [
        importVolunteers,
        {
            data: importedVolunteers,
            isLoading: importingVolunteers,
            isSuccess: importVolunteersSuccess,
            isError: importVolunteersFailed,
            error: importVolunteersErrorData

        }
    ] = useImportVolunteersMutation()

    const [
        createVolunteer,
        {
            data: createdVolunteer,
            isLoading: creatingVolunteers,
            isSuccess: createVounteersSuccess,
            isError: createVolunteersFailed,
            error: createVolunteersErrorData
        }
    ] = useAddVolunteerMutation()

    const feedbackDisplay = useCreateFeedbackDisplay('Volunteer', creatingVolunteers, createVounteersSuccess, createVolunteersFailed, createVolunteersErrorData)

    useEffect(() => {
        if (importVolunteersSuccess) {
            // set all errors fixed to false
            let data = JSON.parse(JSON.stringify(importedVolunteers))
            data.volunteersFromData.forEach((elem) => {
                elem.errors.forEach((error) => {
                    error.fixed = false
                })
            })

            // added skipped if errors contain duplicate volunteer
            data.volunteersFromData.forEach((elem) => {
                elem.errors.forEach((error) => {
                    if (error.type === 'duplicateVolunteer') {
                        elem.skipped = true
                    }
                })
            })

            // sort based on amount of errors - most first - least last
            data.volunteersFromData.sort((a, b) => {
                return b.errors.length - a.errors.length
            })


            setEditedVolunteers(data.volunteersFromData)
        }
    }, [importVolunteersSuccess])

    const handleFileUpload = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleAwardChange = (e, selectedAward) => {
        // Check that the award being updated is one with an error
        let data = JSON.parse(JSON.stringify(editedVolunteers))
        //let errors = JSON.parse(JSON.stringify(editedVolunteers.volunteersFromData[passedIndex].errors))

        editedVolunteers[selectedIndex].errors.forEach((elem, index) => {
            if (elem.field === selectedAward.name) {
                if (elem.type === 'notGiven') {
                    if (selectedAward.isGiven && selectedAward.givenDate !== null) {
                        data[selectedIndex].errors[index].fixed = true
                        setEditedVolunteers(data)
                    } else if (data[selectedIndex].errors[index].fixed) {
                        data[selectedIndex].errors[index].fixed = false
                        setEditedVolunteers(data)
                    }
                } else if (elem.type === 'missingValue' || elem.type === 'formatError') {
                    if (selectedAward.achievedDate !== null && selectedAward.achievedDate !== "") {
                        data[selectedIndex].errors[index].fixed = true
                        setEditedVolunteers(data)
                    } else {
                        data[selectedIndex].errors[index].fixed = false
                        setEditedVolunteers(data)
                    }
                }
            }
        })
        // Check that is given is now true and has a valid date
        // If so, remove the error from the list of errors
    }

    const handleRoleChange = (e, selectedRoles) => {
        let data = JSON.parse(JSON.stringify(editedVolunteers))

        if (selectedRoles.length > 0) {
            // set role error to fixed
            editedVolunteers[selectedIndex].errors.forEach((elem, index) => {
                if (elem.type === 'invalidRole') {
                    data[selectedIndex].errors[index].fixed = true
                    setEditedVolunteers(data)
                }
            })
        } else {
            // set role error to not fixed
            editedVolunteers[selectedIndex].errors.forEach((elem, index) => {
                if (elem.type === 'invalidRole') {
                    data[selectedIndex].errors[index].fixed = false
                    setEditedVolunteers(data)
                }
            })
        }
    }

    const handleTrainingChange = (e, chosenTraining, selectedTraining) => {
        let data = JSON.parse(JSON.stringify(editedVolunteers))
        data[selectedIndex].errors.forEach((elem, index) => {
            if (elem.type === 'formatError' && elem.field === chosenTraining.name) {
                if (chosenTraining.completedOn !== null && chosenTraining.completedOn !== "") {
                    data[selectedIndex].errors[index].fixed = true
                    setEditedVolunteers(data)
                } else if (chosenTraining.completedOn === "") {
                    data[selectedIndex].errors[index].fixed = false
                    setEditedVolunteers(data)
                }
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // upload file to server
        const formData = new FormData();
        formData.append('file', file);
        importVolunteers(formData)
    }

    const handleChange = (e) => {
        e.preventDefault()

        let data = JSON.parse(JSON.stringify(editedVolunteers))
        const errorIndex = data[selectedIndex].errors.findIndex((elem) => { return elem.field === e.target.id })

        if (errorIndex !== -1) {
            const error = data[selectedIndex].errors[errorIndex]
            if (error.field === 'breakDuration') {
                if (parseInt(e.target.value) >= 0) {
                    data[selectedIndex].errors[errorIndex].fixed = true
                    setEditedVolunteers(data)
                } else {
                    data[selectedIndex].errors[errorIndex].fixed = false
                    setEditedVolunteers(data)
                }
            } else {
                if (e.target.value !== "" && e.target.value !== null) {
                    data[selectedIndex].errors[errorIndex].fixed = true
                    setEditedVolunteers(data)
                } else {
                    data[selectedIndex].errors[errorIndex].fixed = false
                    setEditedVolunteers(data)
                }
            }
        }

        // e.target.id = error.field
        // e.target.value needs to be filled
    }

    const handleSaveAll = (e) => {
        e.preventDefault()

        // Save all volunteers
        editedVolunteers.forEach((elem, index) => {
            const allErrorsFixed = elem.errors.every((elem) => { return elem.fixed === true })
            if (allErrorsFixed && !elem.skipped) {
                createVolunteer(elem.volunteer)
                    .unwrap()
                    .then((payload) => {
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
        })
    }

    const handleUpdate = (e, volunteer, index) => {
        e.preventDefault()
        let data = JSON.parse(JSON.stringify(editedVolunteers));
        data[index].volunteer = volunteer
        setEditedVolunteers(data)
        setModalOpen(false)
    }

    const handleCancel = () => {
        handleModalClose()
    }

    const handleSkipVolunteer = (index) => {
        // set all errors for selected volunteer to false
        let data = JSON.parse(JSON.stringify(editedVolunteers))
        data[index].skipped = !data[index].skipped
        setEditedVolunteers(data)
    }

    const handleIgnore = (errorIndex) => {
        let data = JSON.parse(JSON.stringify(editedVolunteers))
        data[selectedIndex].errors[errorIndex].fixed = true
        setEditedVolunteers(data)
    }

    const handleModalClose = () => {
        // set all errors for selected volunteer to false
        let data = JSON.parse(JSON.stringify(editedVolunteers))
        data[selectedIndex].errors.forEach((elem) => {
            elem.fixed = false
        })
        setEditedVolunteers(data)
        setModalOpen(false)
    }

    return (
        <Box p={3}>
            <Card>
                <CardContent>
                    <ImportProcessDisplay
                        file={file}
                        handleSubmit={(e) => handleSubmit(e)}
                        setFile={setFile}
                        isLoading={importingVolunteers || importVolunteersFailed || importVolunteersSuccess}
                        handleFileUpload={(e) => handleFileUpload(e)}
                    />
                    <Box pt={3}>
                        {editedVolunteers && <ImportedVolunteersContainer
                            importingVolunteers={importingVolunteers}
                            importVolunteersFailed={importVolunteersFailed}
                            importVolunteersErrorData={importVolunteersErrorData}
                            editedVolunteers={editedVolunteers}
                            setSelectedVolunteer={setSelectedVolunteer}
                            setSelectedIndex={setSelectedIndex}
                            setModalOpen={setModalOpen}
                            handleSkipVolunteer={handleSkipVolunteer}
                            handleSaveAll={handleSaveAll}
                        />}
                        {selectedVolunteer && <VolunteerModal
                            data={selectedVolunteer}
                            volunteerErrors={editedVolunteers[selectedIndex].errors}
                            handleSubmit={(e, volunteer, index) => handleUpdate(e, volunteer, index)}
                            selectedIndex={selectedIndex}
                            handleAwardChange={(e, selectedAward) => handleAwardChange(e, selectedAward)}
                            handleCancel={() => handleCancel()}
                            handleChange={(e) => handleChange(e)}
                            modalOpen={modalOpen}
                            handleIgnore={(errorIndex) => handleIgnore(errorIndex)}
                            handleRoleChange={(e, selectedRoles) => handleRoleChange(e, selectedRoles)}
                            handleTrainingChange={(e, chosenTraining, selectedTraining) => handleTrainingChange(e, chosenTraining, selectedTraining)}
                            handleModalClose={() => handleModalClose()}
                        />}
                        {feedbackDisplay}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}


// name this function 
function ImportProcessDisplay(props) {
    return (
        <React.Fragment>
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item alignContent="center">
                    <Title>Import Volunteer Data from CSV</Title>
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        component="label"
                        disabled={props.file !== null}
                    >
                        Upload File
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            onChange={(e) => props.handleFileUpload(e)}
                        />
                    </Button>
                </Grid>
            </Grid>
            {props.file && <Grid container direction="row" justifyContent="space-between" rowSpacing={1} pt={2}>
                <Grid item>
                    <Typography variant="body1">{props.file.name} Uploaded Successfully</Typography>
                </Grid>
                <Grid item>
                    <Grid container spacing={3} justifyContent="right">
                        <Grid item>
                            <Button
                                variant="contained"
                                component="label"
                                disabled={props.isLoading}
                                onClick={(e) => props.handleSubmit(e)}
                            >
                                Start Import
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                component="label"
                                disabled={props.isLoading}
                                onClick={() => props.setFile(null)}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>}
        </React.Fragment>
    )
}