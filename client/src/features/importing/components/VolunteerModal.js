import { Alert, Box, Button, Modal } from "@mui/material"
import { CreateRoleModal } from "./CreateRoleModal"
import { Volunteer } from "../../volunteers"

export function VolunteerModal(props) {

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
                                    <CreateRoleModal errors={elem} role={{ name: elem.field }} />
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
                {props.data && <Volunteer
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