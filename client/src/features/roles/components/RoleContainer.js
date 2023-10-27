import { Box } from "@mui/material";
import { DisplayRoleCard } from "./DisplayRoleCard";
import { CreateRoleForm } from "./CreateRoleForm";
import { UpdateRoleForm } from "./UpdateRoleForm";
import { Route, Routes, useNavigate } from "react-router-dom";

export function RoleContainer(props) {
    const navigate = useNavigate()
    const handleSuccess = () => {
        navigate('/dashboard/roles?created=true')
    }

    return (
        <Box p={3}>
            <Routes>
                <Route path="/" element={<DisplayRoleCard {...props} />} />
                <Route path="/update/:id" element={<UpdateRoleForm {...props} />} />
                <Route path="/create" element={<CreateRoleForm {...props} handleSuccess={() => handleSuccess()} />} />
            </Routes>
        </Box>
    )
}