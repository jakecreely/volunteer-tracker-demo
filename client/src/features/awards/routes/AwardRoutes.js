import { Route, Routes } from "react-router-dom";
import { CreateAward } from "../components/CreateAward";
import { Awards } from "./Awards";
import { Award } from "./Award";

export function AwardRoutes(props) {
    return (
        <Routes>
            <Route path="/" element={<Awards />} />
            <Route path="/update/:id" element={<Award />} />
            <Route path="/create" element={<CreateAward />} />
        </Routes>
    )
}