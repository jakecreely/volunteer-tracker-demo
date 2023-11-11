import { Route, Routes } from "react-router-dom";
import { CreateTraining } from "../components/CreateTraining";
import { Trainings } from "./Trainings";
import { Training } from "./Training";

export function TrainingRoutes() {

    return (
        <Routes>
            <Route path="/" element={<Trainings />} />
            <Route path="/update/:id" element={<Training />} />
            <Route path="/create" element={<CreateTraining />} />
        </Routes>
    )
}