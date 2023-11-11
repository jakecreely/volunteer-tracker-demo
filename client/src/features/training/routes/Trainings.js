import { useSearchParams } from 'react-router-dom'
import { TrainingContainer } from '../components/TrainingContainer'
import { useEffect, useState } from 'react'
import { StatusSnackbar } from '../../../components/StatusSnackbar'
import { TrainingList } from '../components/TrainingList'

export function Trainings() {
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Training Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Training Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Training Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    return (
        <TrainingContainer>
            <TrainingList />
            {feedbackDisplay}
        </TrainingContainer>
    )
}