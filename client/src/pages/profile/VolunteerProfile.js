import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ProfileCard } from './ProfileCard'
import { ProfileDetailCard } from './ProfileDetailCard'
import { Button, Container, Box, FormControl, Card, Grid, CardContent, Snackbar, Alert } from "@mui/material"
import { ProfileSkeleton } from "./ProfileSkeleton"
import { useGetAwardsQuery, useGetDocumentsQuery, useGetRolesQuery, useGetTrainingQuery, useGetVolunteerByIdQuery, useUpdateVolunteerMutation } from "../../features/api/apiSlice"

export function VolunteerProfile(props) {

    const [reqVolunteer, setReqVolunteer] = useState('')
    const [editVolunteer, setEditVolunteer] = useState('')
    const [edit, setEdit] = useState(false)
    const [selectedTraining, setSelectedTraining] = useState([])
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)
    const [selectedAwards, setSelectedAwards] = useState([])
    const [loadingVolunteer, setLoadingVolunteer] = useState(true)
    const { id } = useParams()

    const [formVolunteer, setFormVolunteer] = useState('')

    const {
        data: volunteer,
        isLoading: volunteerLoading,
        isSuccess: volunteerSuccess,
        error: volunteerError
    } = useGetVolunteerByIdQuery(id)

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

    const [
        updateVolunteer,
        {
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: updateError
        }
    ] = useUpdateVolunteerMutation()

    useEffect(() => {
        if (volunteerSuccess) {
            getSelectedAwards()
            getSelectedTraining()
            setFormVolunteer(volunteer)
        }
    }, [volunteerSuccess])

    const getSelectedAwards = async () => {
        let tempSelectedAwards = []
        volunteer.awards.map(award => {
            tempSelectedAwards.push(award.name)
        })
        setSelectedAwards(tempSelectedAwards)
    }

    const getSelectedTraining = async () => {
        let tempSelectedTraining = []
        volunteer.training.map(training => {
            tempSelectedTraining.push(training.name)
        })
        setSelectedTraining(tempSelectedTraining)
    }

    useEffect(() => {
        let checkTraining = () => {
            let data = JSON.parse(JSON.stringify(formVolunteer.training));
            let found = false
            selectedTraining.map((elem) => {
                found = false
                data.map(dataElem => {
                    // If name is the same, set found to true
                    if (dataElem.name === elem) {
                        found = true
                    }
                })

                if (!found) {
                    let fetchedTrainingData = fetchedTraining.filter(training => training.name === elem)
                    if (fetchedTrainingData.length > 1) {
                        console.log("ERROR: Multiple Training Data Found")
                    } else {
                        fetchedTrainingData = fetchedTrainingData[0]
                    }
                    console.log("Fetched Training Data: ", fetchedTrainingData)
                    data.push({ id: fetchedTrainingData._id, name: elem, completedOn: null, needsRetraining: false })
                    setFormVolunteer(prev => ({ ...prev, training: data }))
                }
            })
        }

        if (formVolunteer !== '' && selectedTraining !== '' && fetchedTrainingSuccess) {
            checkTraining()
        }

    }, [selectedTraining])

    useEffect(() => {
        let checkAwards = () => {
            let data = JSON.parse(JSON.stringify(formVolunteer.awards));
            let found = false
            selectedAwards.map((elem) => {
                found = false
                data.map(dataElem => {
                    // If name is the same, set found to true 
                    if (dataElem.name === elem) {
                        found = true
                    }
                })

                if (!found) {
                    console.log("Not Found - Adding to data")
                    let fetchedAwardData = fetchedAwards.filter(award => award.name === elem)
                    data.push({ id: fetchedAwardData.id, name: elem, achievedDate: null, givenDate: null, isGiven: false })
                    setFormVolunteer(prev => ({ ...prev, awards: data }))
                }
            })
        }

        if (formVolunteer && selectedAwards.length > 0 && fetchedAwardsSuccess) {
            checkAwards()
        }

    }, [selectedAwards])

    useEffect(() => {
        if (updateSuccess) {
            setFeedbackDisplay(
                <Snackbar open={true} autoHideDuration={6000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity="success" sx={{ width: '100%' }} >
                        Volunteer Saved Successfully
                    </Alert>
                </Snackbar>
            )
            setEdit(false)
        }
    }, [updateSuccess])

    useEffect(() => {
        if (isUpdating) {
            setFeedbackDisplay(
                <Snackbar open={true} autoHideDuration={6000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity="info" sx={{ width: '100%' }} >
                        Saving Volunteer ... Do Not Refresh Page
                    </Alert>
                </Snackbar>
            )
        }
    }, [isUpdating])

    useEffect(() => {
        if (updateError) {
            setFeedbackDisplay(
                <Snackbar open={true} autoHideDuration={6000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity="error" sx={{ width: '100%' }} >
                        Volunteer Save Failed! {updateError.message}
                    </Alert>
                </Snackbar>
            )
        }
    }, [updateError])

    const handleSubmit = async (e) => {
        e.preventDefault()
        cleanData().then((cleanedVolunteerData) => {
            updateVolunteer(cleanedVolunteerData)
        })
    }

    const handleEditChange = (value) => {
        // If value is false, reset values
        if (value === false) {
            setEdit(value)
            // updateVolunteer()
        } else if (value === true) {
            setEdit(value)
            setFeedbackDisplay(null)
        }
    }

    const handleChange = (e) => {
        let tempVolunteer = { ...formVolunteer }
        tempVolunteer[e.target.id] = e.target.value
        setFormVolunteer(tempVolunteer)
    }

    const handleCheckboxChange = (e) => {
        let tempVolunteer = { ...formVolunteer }
        tempVolunteer[e.target.id] = e.target.checked
        setFormVolunteer(tempVolunteer)
    }

    function handleTrainingChange(e) {
        console.log(e.target.id)
        let data = JSON.parse(JSON.stringify(formVolunteer.training))
        data.map(elem => {
            if (elem.name === e.target.id) {
                console.log(elem)
                elem[e.target.name] = e.target.value
                // If stillValid is false, set to true
                elem.needsRetraining = false
            }
        })
        setFormVolunteer(prev => ({ ...prev, training: data }))
    }


    function handleSelectedTrainingChange(e) {
        console.log(e.target.value)
        setSelectedTraining(e.target.value)
    }

    const handleSelectedRoles = (e) => {
        let tempRoleArr = []
        let selectedRoles = e.target.value
        selectedRoles.map(elem => {
            fetchedRoles.map(fetchedRole => {
                if (elem === fetchedRole.name) {
                    tempRoleArr.push({ roleId: fetchedRole._id, name: fetchedRole.name })
                }
            })
        })
        setFormVolunteer(prev => ({ ...prev, roles: tempRoleArr }))
    }

    const handleDocumentChange = (e) => {
        let documents = JSON.parse(JSON.stringify(formVolunteer.documents))
        let found = false
        documents.map(elem => {
            if (elem.name === e.target.id) {
                found = true
                elem.isProvided = e.target.checked
            }
        })

        if (!found) {
            // find document in fetched documents
            console.log("Not Found - Adding to data")
            let fetchedDocument = fetchedDocuments.filter(elem => elem.name === e.target.id)
            documents.push({ documentId: fetchedDocument[0]._id, name: e.target.name, isProvided: e.target.checked })
        }

        let removedFalse = documents.filter(elem => elem.isProvided === true)

        setFormVolunteer(prev => ({ ...prev, documents: removedFalse }))
    }

    const cleanData = async () => {
        let tempVolunteer = JSON.parse(JSON.stringify(formVolunteer))

        // Clean Award Data to fit schema
        const cleanAwardData = async () => {
            let filteredAwards = formVolunteer.awards.filter(elem => {
                return selectedAwards.includes(elem.name)
            })
            return filteredAwards
        }
        cleanAwardData().then(data => {
            tempVolunteer.awards = data
        })

        // Clean Training Data to fit schema
        const cleanTrainingData = async () => {
            let filteredTraining = formVolunteer.training.filter(elem => {
                return selectedTraining.includes(elem.name)
            })
            return filteredTraining
        }
        cleanTrainingData().then(data => {
            tempVolunteer.training = data
        })

        return tempVolunteer
    }

    function handleAwardChange(e) {
        let data = JSON.parse(JSON.stringify(formVolunteer.awards));
        if (e.target.name === "isGiven") {
            data.map(elem => {
                if (elem.name === e.target.id) {
                    console.log(elem)
                    elem.isGiven = e.target.checked
                }
            })
        } else {
            data.map(elem => {
                if (elem.name === e.target.id) {
                    elem[e.target.name] = e.target.value
                }
            })
        }
        setFormVolunteer(prev => ({ ...prev, awards: data }))
    }

    function handleSelectedAwardChange(e) {
        console.log("Selected Award Change")
        console.log(e.target.value)
        setSelectedAwards(e.target.value)
    }

    if (volunteerLoading || fetchedAwardsLoading || fetchedRolesLoading || fetchedDocumentsLoading || fetchedTrainingLoading) {
        return (<Container maxWidth="md">
            <ProfileSkeleton />
        </Container>)
    } else if (volunteerSuccess) {
        return (
            <Container maxWidth="md">
                {edit ?
                    <Box component="form" sx={{ m: 2 }} onSubmit={(e) => handleSubmit(e)}>
                        <Card >
                            <CardContent>
                                <FormControl>
                                    <ProfileCard
                                        edit={edit}
                                        fetchedVolunteer={volunteer}
                                        formVolunteer={formVolunteer}
                                        handleChange={(e) => handleChange(e)}
                                    />
                                    <ProfileDetailCard
                                        edit={edit}
                                        selectedAwards={selectedAwards}
                                        handleSelectedAwardChange={(e) => handleSelectedAwardChange(e)}
                                        handleAwardChange={(index, e) => handleAwardChange(index, e)}
                                        setEditVolunteer={(e) => setEditVolunteer(e)}
                                        selectedTraining={selectedTraining}
                                        fetchedVolunteer={volunteer}
                                        volunteer={formVolunteer}
                                        handleTrainingChange={(index, e) => handleTrainingChange(index, e)}
                                        handleSelectedTrainingChange={(e) => handleSelectedTrainingChange(e)}
                                        handleChange={(e) => handleChange(e)}
                                        handleDocumentChange={(title, value) => handleDocumentChange(title, value)}
                                        handleSelectedRoles={(e) => handleSelectedRoles(e)}
                                        handleCheckboxChange={(e) => handleCheckboxChange(e)}
                                    />
                                    <Grid justifyContent="right" container sx={{ marginTop: 1 }} spacing={2}>
                                        <Grid item>
                                            <Button variant="contained" type="submit">Save</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button variant="outlined" color="error" onClick={() => handleEditChange(false)}>Cancel</Button>
                                        </Grid>
                                    </Grid>
                                </FormControl>
                            </CardContent>
                            {feedbackDisplay}
                        </Card>
                    </Box>
                    : <Card sx={{ m: 2 }}>
                        <CardContent>
                            <ProfileCard
                                edit={edit}
                                fetchedVolunteer={volunteer}
                                formVolunteer={formVolunteer}
                                handleChange={(e) => handleChange(e)}
                            />
                            <ProfileDetailCard
                                edit={edit}
                                selectedAwards={selectedAwards}
                                handleSelectedAwardChange={(e) => handleSelectedAwardChange(e)}
                                handleAwardChange={(index, e) => handleAwardChange(index, e)}
                                setEditVolunteer={(e) => setEditVolunteer(e)}
                                selectedTraining={selectedTraining}
                                volunteer={volunteer}
                                handleTrainingChange={(index, e) => handleTrainingChange(index, e)}
                                handleSelectedTrainingChange={(e) => handleSelectedTrainingChange(e)}
                                handleChange={(e) => handleChange(e)}
                                handleDocumentChange={(e) => handleDocumentChange(e)}
                                handleSelectedRoles={(e) => handleSelectedRoles(e)}
                            />
                            <Grid justifyContent="right" container sx={{ marginTop: 1 }} spacing={2}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleEditChange(true)
                                        }>
                                        Edit
                                    </Button>
                                </Grid>
                            </Grid>

                            {feedbackDisplay}
                        </CardContent>
                    </Card>}
            </Container>
        )
    }
}