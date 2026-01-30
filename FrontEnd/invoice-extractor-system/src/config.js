// Vite automatically loads the correct .env file based on the mode (dev or prod)
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

// Helper to get headers manually since we aren't using an interceptor
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-auth-token": token,
    },
  };
};