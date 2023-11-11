import { useFeedbackDisplay } from './useFeedbackDisplay';

export const useReadFeedbackDisplay = (model, isLoading, isSuccess, isError, error) => {
  const readMessages = {
    loadingMessage: `Fetching ${model}... Do Not Refresh Page`,
    successMessage: `${model} Fetched Successfully!`,
    errorMessage: `Fetching ${model} Failed!`
  }

  return useFeedbackDisplay(readMessages, isLoading, isSuccess, isError, error);
};
