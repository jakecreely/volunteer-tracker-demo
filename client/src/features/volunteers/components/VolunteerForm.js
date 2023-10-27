import { useState, useEffect } from 'react'
import { Box, TextField, Checkbox, Button, Select, MenuItem, FormControl, FormControlLabel, FormGroup, FormLabel, Container } from '@mui/material'

export function VolunteerForm(props) {

    const [volunteer, setVolunteer] = useState(
        {
            name: '',
            role: '',
            startDate: '',
            timeOut: '',
            birthday: '',
            awards: [],
            training: [],
            recruitmentDocuments: [
                {
                    title: 'Reference Check One', given: false, form: "referenceCheckOne"
                },
                {
                    title: 'Reference Check Two', given: false, form: "referenceCheckTwo"
                },
                {
                    title: 'Photo Consent', given: false, form: "photoConsent"
                },
                {
                    title: 'Induction', given: false, form: "induction"
                }
            ]
        }
    )

    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [selectedRoles, setSelectedRoles] = useState([])
    const [startDate, setStartDate] = useState('')
    const [timeOut, setTimeOut] = useState('')
    const [birthday, setBirthday] = useState('')
    const [selectedAwards, setSelectedAwards] = useState([])
    const [selectedTraining, setSelectedTraining] = useState([])
    const [recruitmentDocuments, setRecruitmentDocuments] = useState([{ title: 'Reference Check One', given: false, form: "referenceCheckOne" }, { title: 'Reference Check Two', given: false, form: "referenceCheckTwo" }, { title: 'Photo Consent', given: false, form: "photoConsent" }, { title: 'Induction', given: false, form: "induction" }])

    const [awardInputs, setAwardInputs] = useState([])
    const [trainingInputs, setTrainingInputs] = useState([])
    const [filteredData, setDataInputs] = useState([])

    useEffect(() => {
        let data = [...awardInputs]
        let tempData = []
        selectedAwards.map((elem, index) => {
            if (data[index] && (data[index].name === elem)) {
                tempData[index] = data[index]
            } else {
                tempData[index] = { awardId: '', name: elem, dateAchieved: '', dateGiven: '', given: false }
                props.awards.map(propElem => {
                    if (propElem.name === tempData[index].name) {
                        tempData[index].awardId = propElem._id
                    }
                })
            }
        })
        setAwardInputs(tempData)
    }, [selectedAwards])

    useEffect(() => {
        let data = [...trainingInputs]
        let tempData = []

        const filteredDATA = data.filter(elem => {
            return selectedTraining.includes(elem.name)
        })

        setDataInputs(filteredDATA)

        selectedTraining.map((elem, index) => {
            // console.log("test")
            if (data[index] && (data[index].name === elem)) {
                tempData[index] = data[index]
            } else {
                tempData[index] = { trainingId: '', name: elem, dateCompleted: '' }
                props.training.map(propElem => {
                    if (propElem.name === tempData[index].name) {
                        tempData[index].trainingId = propElem._id
                    }
                })
            }
        })
        setTrainingInputs(tempData)
    }, [selectedTraining])

    function handleChange(e) {
        const { name, value } = e.target
        setVolunteer(prev => {
            return { ...prev, [name]: value }
        })
    }

    function handleNameChange(e) {
        setVolunteer(prev => {
            return { ...prev, name: e.target.value }
        })
    }

    function handleRoleChange(e) {
        setRole(e.target.value)
    }

    function handleStartDateChange(e) {
        setStartDate(e.target.value)
    }

    function handleTimeOutChange(e) {
        setTimeOut(e.target.value)
    }

    function handleBirthdayChange(e) {
        setBirthday(e.target.value)
    }

    function handleSelectedAwardChange(e) {
        setSelectedAwards(e.target.value)
    }

    function handleSelectedTrainingChange(e) {
        setSelectedTraining(e.target.value)
    }

    function handleSelectedRolesChange(e) {
        let tempArray = e.target.value.map(elem => {
            return elem
        })
        setSelectedRoles(tempArray)
        // let tempArray = [{roleId: e.target.value}, selectedRoles]
        // console.log("Temp Role Arr", tempArray)
        // setSelectedRoles(tempArray)
        // console.log("Selected Role: ", selectedRoles)
    }


    function handleAwardChange(index, e) {
        let data = [...awardInputs]
        if (e.target.name === "given") {
            data[index][e.target.name] = e.target.checked
        } else {
            data[index][e.target.name] = e.target.value
        }
        setAwardInputs(data)
    }

    function handleTrainingChange(index, e) {
        let data = [...trainingInputs]
        data[index][e.target.name] = e.target.value
        setTrainingInputs(data)
    }

    function handleDocumentChange(index, e) {
        let data = [...recruitmentDocuments]
        data[index].given = e.target.checked
        setRecruitmentDocuments(data)
    }

    function handleSubmit(e) {
        e.preventDefault()
        let formattedData = {}
        const formatData = async () => {
            recruitmentDocuments.map(elem => {
                formattedData[elem.form] = elem.given
            })
        }
        formatData()
    }

        return (
            <Container maxWidth="md">
                <Box
                    component="form"
                    sx={{ '& .MuiTextField-root': { m: 1 }, }}
                    onSubmit={handleSubmit}
                >
                    <FormControl>
                        <TextField
                            id="name"
                            name="name"
                            label="Name"
                            required
                            fullWidth
                            value={volunteer.name}
                            onChange={(e) => handleChange(e)}
                        />
                        {/* <TextField id="role" label="Role" required fullWidth value={role} onChange={handleRoleChange} /> */}

                        <Select multiple required value={selectedRoles} onChange={handleSelectedRolesChange}>
                            {props.roles && props.roles.map((elem, index) => {
                                // console.log("elem.name", elem.name)
                                // console.log("trainingInputs[index].name", trainingInputs[index])
                                // if (elem.name === trainingInputs[index]) {
                                //     console.log("true")
                                // }
                                return <MenuItem value={elem._id}>{elem.name}</MenuItem>
                            })}
                        </Select>

                        <FormLabel
                            label="Start Date"
                            labelPlacement="start"
                            control={
                                <TextField
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    fullWidth
                                    value={volunteer.startDate}
                                    onChange={(e) => handleChange(e)}
                                />
                            }
                        />
                        

                        <TextField type="number" id="timeout" label="Time Out" fullWidth value={timeOut} onChange={handleTimeOutChange} />

                        <FormLabel labelPlacement="start" label="Birthday" control={
                            <TextField type="date" id="birthday" required fullWidth value={birthday} onChange={handleBirthdayChange} />
                        }>
                        </FormLabel>

                        <FormLabel labelPlacement="start" label="Achieved Awards" control={
                            <Select multiple value={selectedAwards} onChange={handleSelectedAwardChange}>
                                {props.awards && props.awards.map(elem => {
                                    return <MenuItem value={elem.name}>{elem.name}</MenuItem>
                                })}
                            </Select>
                        }>
                        </FormLabel>
                        {awardInputs.map((awardElem, index) => {
                            console.log("Award Elem: ", awardElem, "Index", index)
                            return (<FormGroup row>
                                <FormLabel label="Date Achieved" labelPlacement='start' control={
                                    <TextField type="date" name="dateAchieved" value={awardElem.dateAchieved} onChange={(e) => handleAwardChange(index, e)} />
                                } />
                                <FormLabel label="Date Given" labelPlacement='start' control={
                                    <TextField type="date" name="dateGiven" value={awardElem.dateGiven} onChange={(e) => handleAwardChange(index, e)} />
                                } />
                                <FormControlLabel control={<Checkbox checked={awardElem.given} onChange={(e) => handleAwardChange(index, e)} name="given" />} label="Given" />
                            </FormGroup>)
                        })}

                        <Select multiple value={selectedTraining} onChange={handleSelectedTrainingChange}>
                            {props.training && props.training.map((elem, index) => {
                                // console.log("elem.name", elem.name)
                                // console.log("trainingInputs[index].name", trainingInputs[index])
                                // if (elem.name === trainingInputs[index]) {
                                //     console.log("true")
                                // }
                                return <MenuItem value={elem.name}>{elem.name}</MenuItem>
                            })}
                        </Select>

                        {trainingInputs.map((trainingElem, index) => {
                            return (<div>
                                {trainingElem.name}
                                <TextField type="date" name="dateCompleted" value={trainingElem.dateCompleted} onChange={(e) => handleTrainingChange(index, e)} />
                            </div>)
                        })}

                        {recruitmentDocuments.map((document, index) => {
                            return (
                                <div>
                                    <FormControlLabel label={document.title} control={<Checkbox checked={document.given} onChange={(e) => handleDocumentChange(index, e)} name={document.title} />} />
                                </div>
                            )
                        })}

                        <Button variant="contained" type="submit" label="Submit">Submit</Button>
                    </FormControl>
                </Box>
            </Container>
        )
    
}