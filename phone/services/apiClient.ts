import { API_BASE_URL } from "@/constants/Config";

const logRequest = (url: string, options?: RequestInit) => {
  console.log(`[API REQUEST] ${options?.method || 'GET'} ${url}`);
  if (options?.body) {
    if (options.body instanceof FormData) {
      console.log('Body: [FormData]');
    } else {
      console.log('Body:', options.body);
    }
  }
};

const logResponse = async (url: string, response: Response) => {
  console.log(`[API RESPONSE] ${response.status} ${url}`);
  try {
    const clonedResponse = response.clone();
    const contentType = clonedResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await clonedResponse.json();
      console.log('Response Data:', data);
    } else {
      const text = await clonedResponse.text();
      console.log('Response Text:', text);
    }
  } catch (err) {
    console.log('Could not log response body:', err);
  }
};

export const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  logRequest(url, options);
  try {
    const response = await fetch(url, options);
    logResponse(url, response);
    return response;
  } catch (error) {
    console.error(`[API ERROR] ${url}:`, error);
    throw error;
  }
};
