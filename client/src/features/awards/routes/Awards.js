
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'
import { AwardContainer } from '../components/AwardContainer';
import { AwardsList } from '../components/AwardsList';

export function Awards() {
    const [searchParams] = useSearchParams()
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Award Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Award Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Award Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    return (
        <AwardContainer>
            <AwardsList />
            {feedbackDisplay}
        </AwardContainer>
    )
}