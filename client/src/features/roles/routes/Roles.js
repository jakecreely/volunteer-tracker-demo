import { useEffect, useState } from "react";
import { StatusSnackbar } from "../../../components/StatusSnackbar";
import { RolesList } from "../components/RolesList"
import { useSearchParams } from "react-router-dom";
import { RoleContainer } from "../components/RoleContainer";

export const Roles = () => {
    const [searchParams] = useSearchParams();
    const [feedbackDisplay, setFeedbackDisplay] = useState(null)

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Role Created Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('updated') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Role Updated Successfully"}
                    statusType={'success'}
                />
            )
        } else if (searchParams.get('deleted') === 'true') {
            setFeedbackDisplay(
                <StatusSnackbar
                    statusTitle={"Role Deleted Successfully"}
                    statusType={'success'}
                />
            )
        } else {
            setFeedbackDisplay(null)
        }
    }, [searchParams])

    return (
        <RoleContainer>
            <RolesList />
            {feedbackDisplay}
        </RoleContainer>
    )
}