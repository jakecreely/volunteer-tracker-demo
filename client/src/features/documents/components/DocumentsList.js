import { BasicError } from "../../../components/BasicError";
import { LoadingTableSkeleton } from "../../../components/LoadingTableSkeleton";
import { useGetDocumentsQuery } from "../../../lib/apiSlice";
import DocumentTable from "./DocumentTable";
import { NoDocuments } from "./NoDocuments";

export function DocumentsList() {
    const {
        data: fetchedDocuments,
        isLoading: fetchingDocuments,
        isSuccess: fetchedDocumentsSuccess,
        isError: fetchedDocumentsFailed,
        error: fetchedDocumentsErrorData
    } = useGetDocumentsQuery()

    if (fetchingDocuments) return (<LoadingTableSkeleton />)
    if (fetchedDocumentsFailed) return (<BasicError error={fetchedDocumentsErrorData} />)

    if (fetchedDocumentsSuccess && fetchedDocuments.length > 0) {
        return (
            <DocumentTable documents={fetchedDocuments} />
        )
    } else {
        return (
            <NoDocuments />
        )
    }
}