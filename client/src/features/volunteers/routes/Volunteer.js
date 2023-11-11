import React, { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { Button, Container, Box, FormControl, Card, Grid, CardContent, Snackbar, Alert } from "@mui/material"
import { ProfileSkeleton } from "../components/ProfileSkeleton"
import { useGetAwardsQuery, useGetDocumentsQuery, useGetRolesQuery, useGetTrainingQuery, useGetUpcomingAwardsByVolunteerQuery, useGetUpcomingTrainingByVolunteerQuery, useGetVolunteerByIdQuery, useUpdateVolunteerMutation } from "../../../lib/apiSlice"
import { EditProfile } from '../components/EditProfile'
import { ViewProfile } from "../components/ViewProfile"
import { useUpdateFeedbackDisplay } from "../../../hooks/useUpdateFeedbackDisplay"
import { set } from "lodash"

export function Volunteer(props) {
    // Can either be passed a volunteer or an id
    const { passedVolunteer } = props;
    const { id } = useParams()
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditing = props.isEditing || searchParams.get('editing') === 'true'
    const [selectedTraining, setSelectedTraining] = useState([])
    const [selectedAwards, setSelectedAwards] = useState([])
    const [initialVolunteer, setInitialVolunteer] = useState('')
    const [formVolunteer, setFormVolunteer] = useState('')
    const [upcomingAwards, setUpcomingAwards] = useState([])
    const [missingTraining, setMissingTraining] = useState([])

    const {
        data: volunteer,
        isLoading: fetchingVolunteer,
        isSuccess: fetchingVolunteerSuccess,
        isError: fetchingVolunteerFailed,
        error: volunteerErrorData
    } = useGetVolunteerByIdQuery(id, {
        skip: passedVolunteer
    })

    const {
        data: fetchedUpcomingAwards,
        isLoading: fetchingUpcomingAwards,
        isSuccess: upcomingAwardsSuccess,
        isError: upcomingAwardsFailed,
        error: upcomingAwardsErrorData
    } = useGetUpcomingAwardsByVolunteerQuery({id: id, days: 0}, {
        skip: passedVolunteer
    })

    const {
        data: fetchedUpcomingTraining,
        isLoading: fetchingUpcomingTraining,
        isSuccess: upcomingTrainingSuccess,
        isError: upcomingTrainingFailed,
        error: upcomingTrainingErrorData
    } = useGetUpcomingTrainingByVolunteerQuery({id: id, days: 0}, {
        skip: passedVolunteer
    })

    const {
        data: fetchedAwards,
        isLoading: fetchingAwards,
        isSuccess: fetchedAwardsSuccess,
        isError: fetchedAwardsFailed,
        error: fetchedAwardsErrorData
    } = useGetAwardsQuery()

    const {
        data: fetchedTraining,
        isLoading: fetchingTraining,
        isSuccess: fetchedTrainingSuccess,
        isError: fetchedTrainingFailed,
        error: fetchedTrainingErrorData
    } = useGetTrainingQuery()

    const {
        data: fetchedRoles,
        isLoading: fetchingRoles,
        isSuccess: fetchedRolesSuccess,
        isError: fetchedRolesFailed,
        error: fetchedRolesErrorData
    } = useGetRolesQuery()

    const {
        data: fetchedDocuments,
        isLoading: fetchingDocuments,
        isSuccess: fetchedDocumentsSuccess,
        isError: fetchedDocumentsFailed,
        error: fetchedDocumentsErrorData
    } = useGetDocumentsQuery()

    const [
        updateVolunteer,
        {
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: updateError,
            error: updateErrorData
        }
    ] = useUpdateVolunteerMutation()

    useEffect(() => {
        if (upcomingAwardsSuccess) {
            setUpcomingAwards(fetchedUpcomingAwards.upcomingAwards)
        }
    }, [upcomingAwardsSuccess, fetchedUpcomingAwards])

    useEffect(() => {
        if (upcomingTrainingSuccess) {
            setMissingTraining(fetchedUpcomingTraining.missingTraining)
        }
    }, [upcomingTrainingSuccess, fetchedUpcomingTraining])

    useEffect(() => {
        if (updateSuccess && volunteer) {
            getSelectedAwards()
            getSelectedTraining()
            setInitialVolunteer(volunteer)
            setFormVolunteer(volunteer)
        }
    }, [updateSuccess, volunteer])

    useEffect(() => {
        if (fetchingVolunteerSuccess && volunteer) {
            getSelectedAwards()
            getSelectedTraining()
            setInitialVolunteer(volunteer)
            setFormVolunteer(volunteer)
        }
    }, [fetchingVolunteerSuccess])

    const setIsEditing = (value) => {
        setSearchParams({ editing: value })
    }

    useEffect(() => {
        if (passedVolunteer) {
            setInitialVolunteer(passedVolunteer)
            setFormVolunteer(passedVolunteer)
            let tempSelectedAwards = []
            passedVolunteer.awards.map(award => {
                tempSelectedAwards.push(award.name)
            })
            setSelectedAwards(tempSelectedAwards)

            let tempSelectedTraining = []
            passedVolunteer.training.map(training => {
                tempSelectedTraining.push(training.name)
            })
            setSelectedTraining(tempSelectedTraining)
        }
    }, [passedVolunteer])

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
                    data.push({ trainingId: fetchedTrainingData._id, name: elem, completedOn: null, needsRetraining: false })
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
                    let fetchedAwardData = fetchedAwards.filter(award => award.name === elem)
                    if (fetchedAwardData.length > 1) {
                        console.log("ERROR: Multiple Training Data Found")
                    } else {
                        fetchedAwardData = fetchedAwardData[0]
                    }
                    data.push({ awardId: fetchedAwardData._id, name: elem, achievedDate: null, givenDate: null, isGiven: false })
                    setFormVolunteer(prev => ({ ...prev, awards: data }))
                }
            })
        }

        if (formVolunteer && selectedAwards.length > 0 && fetchedAwardsSuccess && fetchedUpcomingAwards) {
            checkAwards()
        }

    }, [selectedAwards])

    useEffect(() => {
        if (updateSuccess) {
            setIsEditing(false)
        }
    }, [updateSuccess])

    const handleSubmit = async (e) => {
        e.preventDefault()
        cleanData().then((cleanedVolunteerData) => {
            updateVolunteer(cleanedVolunteerData)
        })
    }

    const handleEditChange = (value) => {
        // If value is false, reset values
        if (value === false) {
            setIsEditing(false)
            setFormVolunteer(initialVolunteer)
            setMissingTraining(fetchedUpcomingTraining.missingTraining)
            setUpcomingAwards(fetchedUpcomingAwards.upcomingAwards)
            getSelectedAwards()
            getSelectedTraining()
        } else if (value === true) {
            setIsEditing(true)
        }
    }

    const handleChange = (e) => {
        let tempVolunteer = { ...formVolunteer }
        tempVolunteer[e.target.id] = e.target.value
        setFormVolunteer(tempVolunteer)

        if (props.handleChange) {
            props.handleChange(e)
        }
    }

    const handleArchivedChange = () => {
        let tempVolunteer = { ...formVolunteer }
        tempVolunteer.isArchived = !tempVolunteer.isArchived
        setFormVolunteer(tempVolunteer)

        if (props.handleArchivedChange) {
            props.handleArchivedChange()
        }
    }

    const handleCheckboxChange = (e) => {
        let tempVolunteer = { ...formVolunteer }
        tempVolunteer[e.target.id] = e.target.checked
        setFormVolunteer(tempVolunteer)
    }

    function handleTrainingChange(e) {
        let data = JSON.parse(JSON.stringify(formVolunteer.training))
        let chosenTraining = null
        data.map(elem => {
            if (elem.name === e.target.id) {
                chosenTraining = elem
                elem[e.target.name] = e.target.value
                // If stillValid is false, set to true
                elem.needsRetraining = false
            }
        })
        setFormVolunteer(prev => ({ ...prev, training: data }))
        if (props.handleTrainingChange && chosenTraining !== null && selectedTraining !== null) {
            props.handleTrainingChange(e, chosenTraining, selectedTraining)
        } else {
            console.log("ERROR: handleTrainingChange")
        }
    }


    function handleSelectedTrainingChange(e) {
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
        if (props.handleRoleChange) {
            props.handleRoleChange(e, selectedRoles)
        }
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

    function handleAwardChange(e, selectedIndex) {
        let data = JSON.parse(JSON.stringify(formVolunteer.awards));
        let selectedAward = null
        if (e.target.name === "isGiven") {
            data.map(elem => {
                if (elem.name === e.target.id) {
                    elem.isGiven = e.target.checked
                    selectedAward = elem
                }
            })
        } else {
            data.map(elem => {
                if (elem.name === e.target.id) {
                    elem[e.target.name] = e.target.value
                    selectedAward = elem
                }
            })
        }
        setFormVolunteer(prev => ({ ...prev, awards: data }))
        if (props.handleAwardChange) {
            props.handleAwardChange(e, selectedAward)
        }
    }

    function handleSelectedAwardChange(e) {
        setSelectedAwards(e.target.value)
    }

    const handleExternalSubmit = async (e) => {
        e.preventDefault()
        const cleanedVolunteer = await cleanData(formVolunteer)
        props.handleSubmit(e, cleanedVolunteer, props.selectedIndex)
    }

    const handleAddingUpcomingAward = (award) => {  
        setIsEditing(true)
        let storedUpcomingAwards = JSON.parse(JSON.stringify(upcomingAwards))
        storedUpcomingAwards = storedUpcomingAwards.filter(elem => elem.name !== award.name)
        setUpcomingAwards(storedUpcomingAwards)
        let data = JSON.parse(JSON.stringify(formVolunteer.awards));
        data.push(award)
        setSelectedAwards(prev => [...prev, award.name])
        setFormVolunteer(prev => ({ ...prev, awards: data }))
    }

    const handleAddingMissingTraining = (training) => {
        setIsEditing(true)
        let storedMissingTraining = JSON.parse(JSON.stringify(missingTraining))
        storedMissingTraining = storedMissingTraining.filter(elem => {
            return elem.trainingId !== training.trainingId
        })
        setMissingTraining(storedMissingTraining)
        let data = JSON.parse(JSON.stringify(formVolunteer.training));
        data.push(training)
        setSelectedTraining(prev => [...prev, training.name])
        setFormVolunteer(prev => ({ ...prev, training: data }))
    }

    const feedbackDisplay = useUpdateFeedbackDisplay("Volunteer", isUpdating, updateSuccess, updateError, updateErrorData)

    if (fetchingVolunteer || fetchingAwards || fetchingRoles || fetchingDocuments || fetchingTraining || fetchingUpcomingAwards || fetchingUpcomingTraining) {
        return (<Box maxWidth="md" sx={{ m: 2, p: 3, margin: "auto" }}>
            <ProfileSkeleton />
        </Box>)
    }

    if (fetchingVolunteerSuccess || passedVolunteer) {
        return (
            <Box maxWidth="md" component="form" sx={{ m: 2, p: 3, margin: "auto" }} onSubmit={passedVolunteer ? (e) => handleExternalSubmit(e) : (e) => handleSubmit(e)}>
                <Card>
                    <CardContent>
                        {isEditing ?
                            <FormControl>
                                <EditProfile
                                    initialVolunteer={initialVolunteer}
                                    editedVolunteer={formVolunteer}
                                    selectedAwards={selectedAwards}
                                    selectedTraining={selectedTraining}
                                    upcomingAwards={upcomingAwards}
                                    awardsNotGiven={fetchedUpcomingAwards ? fetchedUpcomingAwards.awardsNotGiven : []}
                                    overdueTraining={fetchedUpcomingTraining ? fetchedUpcomingTraining.overdueTraining : []}
                                    missingTraining={missingTraining}
                                    handleSelectedAwardChange={(e) => handleSelectedAwardChange(e)}
                                    handleAwardChange={(e) => handleAwardChange(e)}
                                    handleChange={(e) => handleChange(e)}
                                    handleTrainingChange={(index, e) => handleTrainingChange(index, e)}
                                    handleSelectedTrainingChange={(e) => handleSelectedTrainingChange(e)}
                                    handleDocumentChange={(title, value) => handleDocumentChange(title, value)}
                                    handleSelectedRoles={(e) => handleSelectedRoles(e)}
                                    handleCheckboxChange={(e) => handleCheckboxChange(e)}
                                    handleAddingUpcomingAward={(award) => handleAddingUpcomingAward(award)}
                                    handleAddingMissingTraining={(training) => handleAddingMissingTraining(training)}
                                    fetchedAwards={fetchedAwards}
                                    fetchedTraining={fetchedTraining}
                                    fetchedRoles={fetchedRoles}
                                    fetchedDocuments={fetchedDocuments}
                                />
                                <Grid justifyContent="space-between" container sx={{ marginTop: 1 }} spacing={2}>
                                    <Grid item>
                                        <Button variant="outlined" type="button" onClick={() => handleArchivedChange()}>{formVolunteer.isArchived ? "Un-archive Volunteer" : "Archive Volunteer"}</Button>
                                    </Grid>
                                    <Grid item>
                                        <Grid container spacing={2}>
                                            <Grid item>
                                                <Button variant="contained" type="submit">Save</Button>
                                            </Grid>
                                            <Grid item>
                                                {<Button variant="outlined" type="button" color="error" onClick={passedVolunteer ? () => props.handleCancel() : () => handleEditChange(false)}>Discard Changes</Button>}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </FormControl>
                            :
                            <Box>
                                <ViewProfile
                                    volunteer={initialVolunteer}
                                    selectedAwards={selectedAwards}
                                    selectedTraining={selectedTraining}
                                    upcomingAwards={upcomingAwards}
                                    awardsNotGiven={fetchedUpcomingAwards ? fetchedUpcomingAwards.awardsNotGiven : []}
                                    overdueTraining={fetchedUpcomingTraining ? fetchedUpcomingTraining.overdueTraining : []}
                                    missingTraining={missingTraining}
                                    handleSelectedAwardChange={(e) => handleSelectedAwardChange(e)}
                                    handleAwardChange={(index, e) => handleAwardChange(index, e)}
                                    handleTrainingChange={(index, e) => handleTrainingChange(index, e)}
                                    handleSelectedTrainingChange={(e) => handleSelectedTrainingChange(e)}
                                    handleChange={(e) => handleChange(e)}
                                    handleDocumentChange={(e) => handleDocumentChange(e)}
                                    handleSelectedRoles={(e) => handleSelectedRoles(e)}
                                    handleAddingUpcomingAward={(award) => handleAddingUpcomingAward(award)}
                                    handleAddingMissingTraining={(training) => handleAddingMissingTraining(training)}
                                    fetchedAwards={fetchedAwards}
                                    fetchedTraining={fetchedTraining}
                                    fetchedRoles={fetchedRoles}
                                    fetchedDocuments={fetchedDocuments}
                                />
                                <Grid container justifyContent="space-between" sx={{ marginTop: 1 }} spacing={2}>
                                    <Grid item>
                                    {initialVolunteer.isArchived ? <Button type="contained" disabled>{"Volunteer Archived"}</Button> : ""}
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" type="button" onClick={() => handleEditChange(true)}>Edit</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        }
                    </CardContent>
                    {feedbackDisplay}
                </Card>
            </Box>
        )
    }
}