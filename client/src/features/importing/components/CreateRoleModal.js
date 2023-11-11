import React, { useState } from "react";
import { CreateRole } from "../../roles";
import { Box, Button, Modal } from "@mui/material";

export function CreateRoleModal(props) {
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
                    <CreateRole passedRole={props.role} handleSuccess={() => handleSuccess()} />
                </Box>
            </Modal>
        </React.Fragment>
    );
}