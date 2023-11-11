import { BasicError } from "../../../components/BasicError";
import { LoadingTableSkeleton } from "../../../components/LoadingTableSkeleton";
import { useGetTrainingQuery } from "../../../lib/apiSlice";
import { NoTrainings } from "./NoTrainings";
import { TrainingTable } from "./TrainingTable";

export function TrainingList() {
    const {
        data: fetchedTraining,
        isLoading: isFetchingTraining,
        isSuccess: fetchedTrainingSuccess,
        isError: fetchedTrainingFailed,
        error: fetchedTrainingErrorData
    } = useGetTrainingQuery()

    if (isFetchingTraining) return (<LoadingTableSkeleton />)
    if (fetchedTrainingFailed) return (<BasicError error={fetchedTrainingErrorData.data} />)

    if (fetchedTrainingSuccess && fetchedTraining.length > 0) {
        return (
            <TrainingTable training={fetchedTraining} />
        )
    } else {
        return (
            <NoTrainings />
        )
    }
}