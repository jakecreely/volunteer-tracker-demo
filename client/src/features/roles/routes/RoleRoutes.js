import { CreateRole } from "../components/CreateRole";
import { Route, Routes } from "react-router-dom";
import { Roles } from "./Roles";
import { Role } from "./Role";

export function RoleRoutes(props) {
    return (
        <Routes>
            <Route path="/" element={<Roles {...props} />} />
            <Route path="/update/:id" element={<Role {...props} />} />
            <Route path="/create" element={<CreateRole {...props} />} />
        </Routes>
    )
}