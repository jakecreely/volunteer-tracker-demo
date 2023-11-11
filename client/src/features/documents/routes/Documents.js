import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StatusSnackbar } from '../../../components/StatusSnackbar'
import { DocumentContainer } from '../components/DocumentContainer'
import { DocumentsList } from '../components/DocumentsList'

export function Documents() {
    const [searchParams] = useSearchParams()
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Document Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Document Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Document Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    return (
        <DocumentContainer>
            <DocumentsList />
            {feedbackDisplay}
        </DocumentContainer>
    )
}