import { Box } from "@mui/material";
import { DisplayRoleCard } from "./DisplayRoleCard";
import { CreateRoleForm } from "./CreateRoleForm";
import { Route, Routes } from "react-router-dom";
import { UpdateRoleForm } from "./UpdateRoleForm";

export function RoleContainer(props) {
    return (
        <Box p={3}>
            <Routes>
                <Route path="/" element={<DisplayRoleCard {...props} />} />
                <Route path="/update/:id" element={<UpdateRoleForm {...props} />} />
                <Route path="/create" element={<CreateRoleForm {...props} />} />
            </Routes>
        </Box>
    )
}