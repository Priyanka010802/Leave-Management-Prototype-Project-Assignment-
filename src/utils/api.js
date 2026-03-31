
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const gotWrapper = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    method: options.method || 'GET',
    headers,
  };

  if (options.json) {
    config.body = JSON.stringify(options.json);
  }

  try {
    const response = await fetch(fullUrl, config);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Failed to parse JSON response' };
    }
    
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return {
      body: data,
      statusCode: response.status
    };
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(`Connection to server failed. Please ensure the backend is running at ${API_BASE}.`);
    }
    throw error;
  }
};

export const got = {
  get: (url, options) => gotWrapper(url, { ...options, method: 'GET' }),
  post: (url, options) => gotWrapper(url, { ...options, method: 'POST' }),
  put: (url, options) => gotWrapper(url, { ...options, method: 'PUT' }),
  patch: (url, options) => gotWrapper(url, { ...options, method: 'PATCH' }),
  delete: (url, options) => gotWrapper(url, { ...options, method: 'DELETE' }),
};

export default got;
