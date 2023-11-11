import { Route, Routes } from "react-router-dom";
import { Volunteers } from "./Volunteers";
import { Volunteer } from "./Volunteer";
import { CreateVolunteer } from "../components/CreateVolunteer";

export function VolunteerRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Volunteers />} />
            <Route path="/:id" element={<Volunteer />} />
            <Route path="/create" element={<CreateVolunteer />} />
        </Routes>
    )
}