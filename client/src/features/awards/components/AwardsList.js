import { BasicError } from "../../../components/BasicError"
import { LoadingTableSkeleton } from "../../../components/LoadingTableSkeleton"
import { useGetAwardsQuery } from "../../../lib/apiSlice"
import { AwardTable } from "./AwardTable"
import { NoAwards } from "./NoAwards"

export function AwardsList() {
    const {
        data: fetchedAwards,
        isLoading: fetchingAwards,
        isSuccess: fetchedAwardsSuccess,
        isError: fetchedAwardsFailed,
        error: fetchedAwardsErrorData
    } = useGetAwardsQuery()

    if (fetchingAwards) return <LoadingTableSkeleton />
    if (fetchedAwardsFailed) return (<BasicError error={fetchedAwardsErrorData} />)

    if (fetchedAwardsSuccess && fetchedAwards.length > 0) {
        return (
            <AwardTable awards={fetchedAwards} />
        )
    } else {
        return (
            <NoAwards />
        )
    }
}