const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Shared API request helper that handles JSON headers, Authorization tokens,
 * base URL configuration, and error message formatting.
 */
export async function apiRequest(endpoint, { method = "GET", body = null, token = null, headers = {} } = {}) {
  const reqHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: reqHeaders,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, options);
  } catch (err) {
    throw new Error("Unable to connect to CraftIQ backend server. Is the server running?");
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    let errorMessage = "An error occurred";
    if (data && data.detail) {
      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Format Pydantic validation errors (422) into human readable string
        errorMessage = data.detail
          .map((err) => `${err.loc ? err.loc[err.loc.length - 1] + ": " : ""}${err.msg}`)
          .join(", ");
      }
    } else if (response.statusText) {
      errorMessage = response.statusText;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export { BASE_URL };
