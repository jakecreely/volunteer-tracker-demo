import { BasicError } from "../../../components/BasicError"
import { LoadingTableSkeleton } from "../../../components/LoadingTableSkeleton"
import { useGetMailingListQuery } from "../../../lib/apiSlice"
import { MailingListTable } from "./MailingListTable"
import { NoPeople } from "./NoPeople"

export function PersonList() {
    const {
        data: fetchedMailingList,
        isLoading: fetchingMailingList,
        isSuccess: fetchedMailingListSuccess,
        isError: fetchedMailingListFailed,
        error: fetchedMailingListErrorData
    } = useGetMailingListQuery()

    if (fetchingMailingList) return <LoadingTableSkeleton />
    if (fetchedMailingListFailed) return <BasicError error={fetchedMailingListErrorData} />

    if (fetchedMailingListSuccess && fetchedMailingList.length > 0) {
        return <MailingListTable mailingList={fetchedMailingList} />
    } else {
        return <NoPeople />
    }
}