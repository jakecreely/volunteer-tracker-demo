import { useFeedbackDisplay } from './useFeedbackDisplay';

export const useUpdateFeedbackDisplay = (model, isLoading, isSuccess, isError, error) => {
  const updateMessages = {
    loadingMessage: `Updating ${model}... Do Not Refresh Page`,
    successMessage: `${model} Updated Successfully!`,
    errorMessage: `Updating ${model} Failed!`
  }

  return useFeedbackDisplay(updateMessages, isLoading, isSuccess, isError, error);
};
