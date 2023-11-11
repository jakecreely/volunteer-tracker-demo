import { Route, Routes } from "react-router-dom";
import { MailingList } from "./MailingList"
import { Person } from "./Person";
import { CreatePerson } from "../components/CreatePerson";

export function MailingListRoutes(props) {

    return (
        <Routes>
            <Route path="/" element={<MailingList {...props} />} />
            <Route path="/update/:id" element={<Person {...props} />} />
            <Route path="/add" element={<CreatePerson {...props} />} />
        </Routes>
    )
}