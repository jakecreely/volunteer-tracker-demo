import { Box, Grid } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import CreateTrainingForm from "./CreateTrainingForm";
import UpdateTrainingForm from "./UpdateTrainingForm";
import DisplayTrainingCard from "./DisplayTrainingCard"

export default function TrainingContainer(props) {

    return (
        <Box p={3}>
            <Routes>
                <Route path="/" element={<DisplayTrainingCard {...props} />} />
                <Route path="/update/:id" element={<UpdateTrainingForm {...props} />} />
                <Route path="/create" element={<CreateTrainingForm {...props} />} />
            </Routes>
        </Box>
    )
}