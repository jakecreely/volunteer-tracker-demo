import { Box } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import DisplayMailingListCard from "./DisplayMailingListCard"
import UpdateMailingListForm from "./UpdateMailingListForm";
import CreateMailingListForm from "./CreateMailingListForm";

export default function MailingListContainer(props) {

    return (
        <Box p={3}>
            <Routes>
                <Route path="/" element={<DisplayMailingListCard {...props} />} />
                <Route path="/update/:id" element={<UpdateMailingListForm {...props} />} />
                <Route path="/add" element={<CreateMailingListForm {...props} />} />
            </Routes>
        </Box>
    )
}