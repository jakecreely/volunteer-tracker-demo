import { Box, Grid } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { CreateAwardForm } from "./CreateAwardForm";
import { DisplayAwardCard } from "./DisplayAwardsCard";
import { UpdateAwardForm } from "./UpdateAwardForm";

export function AwardContainer(props) {
    return (
        <Box p={3}>
            <Routes>
                <Route path="/" element={<DisplayAwardCard {...props} />} />
                <Route path="/update/:id" element={<UpdateAwardForm {...props} />} />
                <Route path="/create" element={<CreateAwardForm {...props} />} />
            </Routes>
        </Box>
    )
}