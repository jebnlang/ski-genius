export const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Response Error:', error.response.data);
    console.error('Status:', error.response.status);
    return `API Error: ${error.response.data.error || 'Unknown error'}`;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    return 'No response received from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
    return error.message;
  }
}; 