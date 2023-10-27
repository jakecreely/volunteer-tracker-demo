import { Box } from "@mui/material";
import DisplayDocumentCard from "./DisplayDocumentCard";
import UpdateDocumentForm from "./UpdateDocumentForm";
import CreateDocumentForm from "./CreateDocumentForm";
import { Route, Routes } from "react-router-dom";

export default function DocumentContainer(props) {
    return (
        <Box p={3}>
            <Routes>
                <Route path="/" element={<DisplayDocumentCard {...props} />} />
                <Route path="/update/:id" element={<UpdateDocumentForm {...props} />} />
                <Route path="/create" element={<CreateDocumentForm {...props} />} />
            </Routes>
        </Box>
    )
}