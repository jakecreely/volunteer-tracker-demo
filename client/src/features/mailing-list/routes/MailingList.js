import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'
import { MailingListContainer } from '../components/MailingListContainer';
import { PersonList } from '../components/PersonList';

export function MailingList() {
    const [searchParams] = useSearchParams();
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Person Added To Mailing List Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Person In Mailing List Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Person Deleted From Mailing List Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    return (
        <MailingListContainer>
            <PersonList />
            {feedbackDisplay}
        </MailingListContainer>
    )
}