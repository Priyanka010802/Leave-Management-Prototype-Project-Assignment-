
const API_BASE = 'http://localhost:5000';

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

  const response = await fetch(fullUrl, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return {
    body: data,
    statusCode: response.status
  };
};

export const got = {
  get: (url, options) => gotWrapper(url, { ...options, method: 'GET' }),
  post: (url, options) => gotWrapper(url, { ...options, method: 'POST' }),
  put: (url, options) => gotWrapper(url, { ...options, method: 'PUT' }),
  patch: (url, options) => gotWrapper(url, { ...options, method: 'PATCH' }),
  delete: (url, options) => gotWrapper(url, { ...options, method: 'DELETE' }),
};

export default got;
