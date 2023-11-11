import { useGetRolesQuery } from '../../../lib/apiSlice'
import { RoleTable } from './RoleTable'
import { LoadingTableSkeleton } from '../../../components/LoadingTableSkeleton'
import { NoRoles } from './NoRoles'
import { BasicError } from '../../../components/BasicError'

export function RolesList() {
    const {
        data: fetchedRoles,
        isLoading: isFetchingRoles,
        isSuccess: fetchedRolesSuccess,
        isError: fetchedRolesFailed,
        error: fetchedRolesErrorData
    } = useGetRolesQuery()

    if (isFetchingRoles) return (<LoadingTableSkeleton />)
    if (fetchedRolesFailed) return (<BasicError error={fetchedRolesErrorData.data} />)

    if (fetchedRolesSuccess && fetchedRoles.length > 0) {
        return (<RoleTable roles={fetchedRoles} />)
    } else {
        return (<NoRoles />)
    }
}