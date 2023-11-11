import { Documents } from "./Documents";
import { CreateDocument } from "../components/CreateDocument";
import { Route, Routes } from "react-router-dom";
import { Document } from "./Document";

export function DocumentRoutes(props) {
    return (
        <Routes>
            <Route path="/" element={<Documents {...props} />} />
            <Route path="/update/:id" element={<Document {...props} />} />
            <Route path="/create" element={<CreateDocument {...props} />} />
        </Routes>
    )
}