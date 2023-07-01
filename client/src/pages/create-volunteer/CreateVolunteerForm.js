import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Container, Box, FormControl, Card, Grid, CardContent, Snackbar, Alert } from "@mui/material"
import { CreateCard } from "./CreateCard"
import { CreateDetailCard } from "./CreateDetailCard"
import { useAddVolunteerMutation, useGetAwardsQuery, useGetDocumentsQuery, useGetRolesQuery, useGetTrainingQuery } from "../../features/api/apiSlice"
import { ProfileSkeleton} from '../profile/ProfileSkeleton'

export function CreateVolunteerForm(props) {

    const [
        createVolunteer,
        {
            data: createdVolunteer,
            isLoading: isUpdating,
            isSuccess: updateSuccess,
            isError: updateError
        }
    ] = useAddVolunteerMutation()

    const [volunteer, setNewVolunteer] = useState(
        {
            name: '',
            startDate: '',
            birthday: '',
            training: [],
            awards: [],
            roles: [],
            documents: [],
            breakDuration: '',
            isArchived: false,
        }
    )
    const [selectedTraining, setSelectedTraining] = useState([])
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)
    const [selectedAwards, setSelectedAwards] = useState([])
    const [formVolunteer, setFormVolunteer] = useState('')
    let navigate = useNavigate();

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

    useEffect(() => {
        if (volunteer !== '') {
            setFormVolunteer(volunteer)
        }
    }, [volunteer])

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
                    console.log("Not Found - Adding to data")
                    let fetchedAwardData = fetchedAwards.filter(award => award.name === elem)
                    data.push({ awardId: fetchedAwardData[0]._id, name: elem, achievedDate: null, givenDate: null, isGiven: false })
                    setFormVolunteer(prev => ({ ...prev, awards: data }))
                }
            })
        }

        if (formVolunteer && selectedAwards.length > 0 && fetchedAwardsSuccess) {
            checkAwards()
        }

    }, [selectedAwards])

    const handleSubmit = async (e) => {
        e.preventDefault()
        cleanData().then(cleanedVolunteerData => {
            createVolunteer(cleanedVolunteerData)
        })
    }

    useEffect(() => {
        if (updateSuccess) {
            navigate('/dashboard/volunteer/' + createdVolunteer._id)
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

    // TODO: Needs to changed for dynamic document in a volunteer model
    const handleDocumentChange = (e) => {
        // let tempVolunteer = JSON.parse(JSON.stringify(formVolunteer))
        // console.log(tempVolunteer.recruitmentDocuments[title])
        // console.log(tempVolunteer.recruitmentDocuments)
        // setFormVolunteer(tempVolunteer)
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

    const handleAutoFillAwards = (filledAwards) => {
        let tempVolunteer = JSON.parse(JSON.stringify(formVolunteer))
        tempVolunteer.awards = filledAwards
        setFormVolunteer(tempVolunteer)
        let awardNames = filledAwards.map(elem => elem.name)
        setSelectedAwards(awardNames)
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

    if (fetchedAwardsLoading || fetchedRolesLoading || fetchedTrainingLoading || fetchedDocumentsLoading) {
        return <ProfileSkeleton />
    } else {
        return (
            <Container maxWidth="md">
                <Box component="form" sx={{ m: 2 }} onSubmit={(e) => handleSubmit(e)}>
                    <Card >
                        <CardContent>
                            <FormControl>
                                <CreateCard
                                    volunteer={formVolunteer}
                                    handleChange={(e) => handleChange(e)}
                                />
                                <CreateDetailCard
                                    fetchedAwards={fetchedAwards}
                                    selectedAwards={selectedAwards}
                                    handleSelectedAwardChange={(e) => handleSelectedAwardChange(e)}
                                    handleAwardChange={(index, e) => handleAwardChange(index, e)}
                                    fetchedRoles={fetchedRoles}
                                    fetchedTraining={fetchedTraining}
                                    fetchedDocuments={fetchedDocuments}
                                    selectedTraining={selectedTraining}
                                    volunteer={formVolunteer}
                                    handleTrainingChange={(index, e) => handleTrainingChange(index, e)}
                                    handleSelectedTrainingChange={(e) => handleSelectedTrainingChange(e)}
                                    handleChange={(e) => handleChange(e)}
                                    handleCheckboxChange={(e) => handleCheckboxChange(e)}
                                    handleDocumentChange={(title, value) => handleDocumentChange(title, value)}
                                    handleSelectedRoles={(e) => handleSelectedRoles(e)}
                                    handleAutoFillAwards={(filledAwards) => handleAutoFillAwards(filledAwards)}
                                />
                                <Grid justifyContent="right" container sx={{ marginTop: 1 }} spacing={2}>
                                    <Grid item>
                                        <Button 
                                            variant="contained" 
                                            type="submit"
                                            disabled={isUpdating}
                                        >
                                            Create
                                        </Button>
                                    </Grid>
                                </Grid>
                            </FormControl>
                        </CardContent>
                        {feedbackDisplay}
                    </Card>
                </Box>
            </Container>
        )
    }
}