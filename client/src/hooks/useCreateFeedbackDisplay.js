import { useFeedbackDisplay } from './useFeedbackDisplay';

export const useCreateFeedbackDisplay = (model, isLoading, isSuccess, isError, error) => {
  const createMessages = {
    loadingMessage: `Creating ${model}... Do Not Refresh Page`,
    successMessage: `${model} Created Successfully!`,
    errorMessage: `${model} Creation Failed!`
  }

  return useFeedbackDisplay(createMessages, isLoading, isSuccess, isError, error);
};
