import React, { useState, useEffect } from 'react';
import { StatusSnackbar } from '../components/StatusSnackbar';

export const useFeedbackDisplay = (messages, isLoading, isSuccess, isError, error) => {
  const [feedbackDisplay, setFeedbackDisplay] = useState(null);
  const {loadingMessage, successMessage, errorMessage} = messages;
 
  useEffect(() => {
    if (isLoading) {
      setFeedbackDisplay(
        <StatusSnackbar
          statusTitle={loadingMessage}
          statusType={"info"}
        />
      );
    } else if (isSuccess) {
        setFeedbackDisplay(
          <StatusSnackbar
            statusTitle={successMessage}
            statusType={"success"}
          />
        );
    } else if (isError) {
      setFeedbackDisplay(
        <StatusSnackbar
          statusTitle={errorMessage}
          errorMessage={error.data} // Error Message
          statusType={"error"}
        />
      );
    } else {
      setFeedbackDisplay(null);
    }
  }, [isLoading, isSuccess, isError, error, loadingMessage, successMessage, errorMessage]);

  return feedbackDisplay;
};