import { Route, Routes } from "react-router-dom";
import { TrainingRoutes } from '../../training';
import { AwardRoutes } from '../../awards';
import { DocumentRoutes } from '../../documents';
import { RoleRoutes } from '../../roles';
import { ImportingContainer } from '../../importing';
import { MailingListRoutes } from '../../mailing-list'
import { Overview } from "../components/Overview";
import { VolunteerRoutes } from "../../volunteers";

export function DashboardRoutes(props) {
    return (
        <Routes>
            <Route path="/overview" element={<Overview {...props} />} />
            <Route path="/volunteers/*" element={<VolunteerRoutes />} />
            <Route path="/training/*" element={<TrainingRoutes />} />
            <Route path="/awards/*" element={<AwardRoutes />} />
            <Route path="/documents/*" element={<DocumentRoutes />} />
            <Route path="/roles/*" element={<RoleRoutes />} />
            <Route path="/importing" element={<ImportingContainer />} />
            <Route path="/mailing-list/*" element={<MailingListRoutes />} />
        </Routes>
    )
}