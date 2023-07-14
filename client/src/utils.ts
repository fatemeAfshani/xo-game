export const getErrorMessage = (error: any): string => {
  const message = error.response?.data?.message
    ? Array.isArray(error.response?.data?.message)
      ? error.response?.data?.message?.[0]
      : error.response?.data?.message
    : 'something went wrong';

  return message;
};
