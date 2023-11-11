import { useFeedbackDisplay } from './useFeedbackDisplay';

export const useDeleteFeedbackDisplay = (model, isLoading, isSuccess, isError, error) => {
  const deleteMessages = {
    loadingMessage: `Deleting ${model}... Do Not Refresh Page`,
    successMessage: `${model} Deleted Successfully!`,
    errorMessage: `${model} Deletion Failed!`
  }

  return useFeedbackDisplay(deleteMessages, isLoading, isSuccess, isError, error);
};
