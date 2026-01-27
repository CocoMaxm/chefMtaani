// 1. Create an API service file for the frontend (api.js)
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://chefmtaani.onrender.com/api";

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  
  // If the server didn't send JSON (like an HTML error page), don't try to parse it
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Server returned non-JSON response:", text);
    throw new Error(`Server Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }
  return data;
};

// API Service Object
const api = {
  // Authentication
  auth: {
    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },

    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return handleResponse(response);
    },

    registerChef: async (chefData) => {
      const response = await fetch(`${API_BASE_URL}/auth/register-chef`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chefData),
      });
      return handleResponse(response);
    },
  },

  // Chefs
  chefs: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/chefs?${queryString}`);
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/chefs/${id}`);
      return handleResponse(response);
    },

    getAvailability: async (id, startDate, endDate) => {
      const params = new URLSearchParams({ startDate, endDate }).toString();
      const response = await fetch(`${API_BASE_URL}/chefs/${id}/availability?${params}`);
      return handleResponse(response);
    },

    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/chefs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },

  // Bookings
  bookings: {
    create: async (bookingData) => {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(bookingData),
      });
      return handleResponse(response);
    },

    getMy: async () => {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },

    updateStatus: async (id, status) => {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      return handleResponse(response);
    },

    addReview: async (id, reviewData) => {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(reviewData),
      });
      return handleResponse(response);
    },
  },

  // Cuisines
  cuisines: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/cuisines`);
      return handleResponse(response);
    },
  },

  // Contact
  contact: {
    submit: async (contactData) => {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      return handleResponse(response);
    },
  },
};