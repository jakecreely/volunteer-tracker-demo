import { BasicError } from "../../../components/BasicError"
import { LoadingTableSkeleton } from "../../../components/LoadingTableSkeleton"
import { NoVolunteers } from "./NoVolunteers"
import { VolunteerTable } from "./VolunteerTable"

export function VolunteersList(props) {
    if (props.volunteersFailed) return <BasicError error={props.volunteersErrorData.data} />
    if (props.rolesFailed) return <BasicError error={props.rolesErrorData.data} />

    if (props.fetchingVolunteers || props.fetchingRoles) {
        return <LoadingTableSkeleton />
    }

    if (props.volunteers.length > 0) {
        return <VolunteerTable volunteers={props.volunteers} />
    } else {
        return <NoVolunteers />
    }
}