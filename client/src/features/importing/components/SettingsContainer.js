import { Alert, AlertTitle, Box, Button, Card, CardContent, Grid, LinearProgress, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAddVolunteerMutation, useImportVolunteersMutation } from "../../../lib/apiSlice";
import { CreateRoleForm } from "../../roles";
import { VolunteerProfile } from "../../volunteers/components/VolunteerProfile";
import Title from "../../../components/Title";
import { StatusSnackbar } from "../../../components/StatusSnackbar";

export function SettingsContainer() {

    const [file, setFile] = useState(null)
    const [editedVolunteers, setEditedVolunteers] = useState(null)
    const [selectedVolunteer, setSelectedVolunteer] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [
        importVolunteers,
        {
            data: importedVolunteers,
            isLoading: isImporting,
            isSuccess: importSuccess,
            isError: isImportError,
            error: importError

        }
    ] = useImportVolunteersMutation()

    const [
        createVolunteer,
        {
            data: createdVolunteer,
            isLoading: isCreating,
            isSuccess: createSuccess,
            isError: createError
        }
    ] = useAddVolunteerMutation()

    useEffect(() => {
        if (isCreating) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Creating Volunteer... Do Not Refresh Page"}
                    statusType={"info"}
                />
            )
        }
    }, [isCreating])

    useEffect(() => {
        if (createError) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Volunteers Creation Failed!"}
                    errorMessage={createError.data}
                    statusType={"error"}
                />
            )
        }
    }, [createError])

    useEffect(() => {
        if (createSuccess) {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Volunteers Created Successfully"}
                    statusType={"success"}
                />
            )
        }
    }, [createSuccess])

    useEffect(() => {
        if (importSuccess) {
            setPage(0)
        }
    }, [importSuccess])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - editedVolunteers.length) : 0;

    let emptyRowsFilled = []
    if (emptyRows > 0) {
        for (let i = 0; i < emptyRows; i++) {
            emptyRowsFilled.push(<TableRow style={{ border: 'none' }} />)
        }
    }

    useEffect(() => {
        if (importSuccess) {
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
    }, [importSuccess])

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
        //const allErrorsFixed = data.volunteersFromData[index].errors.every((elem) => { return elem.fixed === true })
        data[index].volunteer = volunteer
        setEditedVolunteers(data)
        setModalOpen(false)

        // if (allErrorsFixed) {
        //     console.log(volunteer)
        //     // Try and save the volunteers
        //     console.log("Handling Update")
        //     console.log("Index: " + index)
        //     createVolunteer(volunteer)
        //         .unwrap()
        //         .then((payload) => {
        //             // update volunteer in index using set hook and payload
        //             data.volunteersFromData[index].volunteer = payload
        //             data.volunteersFromData[index].errors = []
        //             setEditedVolunteers(data)
        //         })
        //         .catch((error) => {
        //             console.log(error)
        //         })
        // } else {
        //     console.log("Not all errors fixed")
        // }
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
        // let data = JSON.parse(JSON.stringify(editedVolunteers))
        // data.volunteersFromData[selectedIndex].errors.forEach((elem) => {
        //     elem.fixed = false
        // })
        //setEditedVolunteers(data)
        setModalOpen(false)
    }

    return (
        <Box p={3}>
            <Card>
                <CardContent>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item alignContent="center">
                            <Title>Import Volunteer Data from CSV</Title>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                component="label"
                                disabled={file !== null}
                            >
                                Upload File
                                <input
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={(e) => handleFileUpload(e)}
                                />
                            </Button>
                        </Grid>
                    </Grid>
                    {file && <Grid container direction="row" justifyContent="space-between" rowSpacing={1} pt={2}>
                        <Grid item>
                            <Typography variant="body1">{file.name} Uploaded Successfully</Typography>
                        </Grid>
                        <Grid item>
                            <Grid container spacing={3} justifyContent="right">
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        disabled={isImporting || isImportError || importSuccess}
                                        onClick={(e) => handleSubmit(e)}
                                    >
                                        Start Import
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={isImporting || isImportError || importSuccess}
                                        onClick={() => setFile(null)}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    }
                    {isImporting && <Box pt={3}><LinearProgress /></Box>}
                    {(isImportError && file) && <Box pt={3}>Error Importing: {importError.data}</Box>}
                    {editedVolunteers && <Box pt={3}>
                        <Grid container direction="column" spacing={2}>
                            <Grid item>
                                <Alert severity="error" >
                                    <AlertTitle>
                                        Import Failed For {editedVolunteers.filter(elem => elem.errors.length > 0).length} out of {editedVolunteers.length} volunteers!
                                    </AlertTitle>
                                    No volunteer have been created. You will need to fix each volunteer errors before you can create them.
                                </Alert>
                            </Grid>
                            <Grid item>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Volunteer Name</TableCell>
                                                <TableCell>Errors</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                editedVolunteers && editedVolunteers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage,).map((elem, index) => {
                                                    let newIndex = page * rowsPerPage + index
                                                    if (elem.errors.length === 0) {
                                                        return <TableRow key={elem.volunteer.name} sx={elem.skipped ? { backgroundColor: '#f5f5f5' } : {}}>
                                                            <TableCell>{elem.volunteer.name}</TableCell>
                                                            <TableCell>
                                                                <Alert severity="success">No Errors</Alert>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button variant="outlined" onClick={(e) => {
                                                                    setSelectedVolunteer(elem)
                                                                    setSelectedIndex(newIndex)
                                                                    setModalOpen(true)
                                                                }}>View Volunteer</Button>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button variant="outlined" onClick={() => handleSkipVolunteer(newIndex)}>
                                                                    {elem.skipped ? "Keep Volunteer" : "Skip Volunteer"}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    }

                                                    const allErrorsFixed = elem.errors.every((elem) => { return elem.fixed === true })
                                                    const errorIsDuplicateVolunteer = elem.errors.some((elem) => { return elem.type === 'duplicateVolunteer' })
                                                    if (errorIsDuplicateVolunteer) {
                                                        return <TableRow key={elem.volunteer.name} sx={elem.skipped ? { backgroundColor: '#f5f5f5' } : {}}>
                                                            <TableCell>{elem.volunteer.name}</TableCell>
                                                            <TableCell>
                                                                <Alert severity="warning">Duplicate of a volunteer already added</Alert>
                                                            </TableCell>
                                                            <TableCell>
                                                            </TableCell>
                                                            <TableCell>

                                                            </TableCell>
                                                        </TableRow>
                                                    }

                                                    const errorsFixed = elem.errors.filter((elem) => { return elem.fixed === true })
                                                    return <TableRow key={elem.volunteer.name} sx={elem.skipped ? { backgroundColor: '#f5f5f5' } : {}}>
                                                        <TableCell>{elem.volunteer.name}</TableCell>
                                                        <TableCell>
                                                            <Alert severity={allErrorsFixed ? "success" : "warning"}>
                                                                {errorsFixed.length} Out Of {elem.errors.length} Errors Fixed
                                                            </Alert>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="outlined" onClick={(e) => {
                                                                setSelectedVolunteer(elem)
                                                                setSelectedIndex(newIndex)
                                                                setModalOpen(true)
                                                            }}>Fix Errors</Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="outlined" onClick={() => {
                                                                handleSkipVolunteer(newIndex)
                                                            }}>
                                                                {elem.skipped ? "Keep Volunteer" : "Skip Volunteer"}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                })
                                            }
                                            {emptyRows > 0 && (
                                                <TableRow
                                                    style={{
                                                        height: 60 * emptyRows,
                                                    }}
                                                >
                                                    <TableCell colSpan={6} />
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={editedVolunteers.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </TableContainer>
                            </Grid>
                            <Grid item>
                                <Box pt={1}>
                                    <Grid container justifyContent="right">
                                        {
                                            editedVolunteers.every((elem) => {
                                                return elem.errors.every((elem) => { return elem.fixed === true }) || elem.skipped
                                            }) ?
                                                <Button variant="contained" component="label" pt={3} onClick={(e) => handleSaveAll(e)}>
                                                    Create Selected Volunteers
                                                </Button>
                                                :
                                                <Button variant="contained" component="label" pt={3} disabled>
                                                    Create Selected Volunteers
                                                </Button>
                                        }
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                        {feedbackDisplay}
                        {
                            selectedVolunteer && <VolunteerModal
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
                            />
                        }
                    </Box>}
                </CardContent>
            </Card>
        </Box>
    )
}

function VolunteerModal(props) {

    const style = {
        overflow: 'scroll',
        height: '90%',
        backgroundColor: 'white',
        marginTop: '50px',
        marginLeft: '150px',
        marginRight: '150px',
        position: 'relative'
    }

    if (!props.data) return null

    return (
        <Modal
            open={props.modalOpen}
        >
            <Box style={style}>
                <Box style={{
                    backgroundColor: 'white',
                    position: 'sticky',
                    top: '0', // Make sure top is set to 0 for sticky positioning
                    zIndex: '10', // Set a zIndex to ensure it's above other content
                }}>
                    {
                        props.volunteerErrors.map((elem, index) => {
                            if (elem.type === 'invalidRole') {
                                return <Alert severity={elem.fixed ? "success" : "warning"} action={!elem.fixed &&
                                    <RoleModal errors={elem} role={{ name: elem.field }} />
                                }>
                                    <div>Invalid Role: {elem.message}</div>
                                </Alert>
                            } else if (elem.type === 'notGiven' || elem.type === 'formatError' || elem.type === 'missingValue') {
                                return <Alert severity={elem.fixed ? "success" : "warning"} action={!elem.fixed &&
                                    <Button color="inherit" size="small" onClick={() => props.handleIgnore(index)}>Ignore</Button>
                                }>
                                    <div>{elem.message}</div>
                                </Alert>
                            } else {
                                return <Alert severity={elem.fixed ? "success" : "warning"}>
                                    <div>{elem.message}</div>
                                </Alert>
                            }
                        })
                    }
                </Box>
                {props.data && <VolunteerProfile
                    isEditing={true}
                    passedVolunteer={props.data.volunteer}
                    handleAwardChange={props.handleAwardChange}
                    handleRoleChange={props.handleRoleChange}
                    handleTrainingChange={props.handleTrainingChange}
                    handleSubmit={props.handleSubmit}
                    handleChange={props.handleChange}
                    handleCancel={props.handleCancel}
                    selectedIndex={props.selectedIndex}
                />
                }
            </Box>
        </Modal>
    )
}

function RoleModal(props) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleSuccess = () => {
        setOpen(false)
    }

    const style = {
        overflow: 'scroll',
        height: '90%',
        backgroundColor: 'white',
        marginTop: '50px',
        marginLeft: '150px',
        marginRight: '150px',
        position: 'relative'
    }

    return (
        <React.Fragment>
            <Button color="inherit" size="small" onClick={handleOpen}>Add Role</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box p={3}>
                    <CreateRoleForm role={props.role} handleSuccess={() => handleSuccess()} />
                </Box>
            </Modal>
        </React.Fragment>
    );
}
