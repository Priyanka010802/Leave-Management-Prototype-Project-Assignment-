const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9000';

// Detect if we should default to mock mode (e.g., on Vercel without a configured API)
let isMockMode = (typeof window !== 'undefined' && 
                 window.location.hostname !== 'localhost' && 
                 window.location.hostname !== '127.0.0.1' && 
                 !process.env.REACT_APP_API_URL);

// Built-in Seed data from db.json
const SEED_DATA = {
  "server-time": { "currentTime": new Date().toISOString() },
  "employees": [
    { "id": "m1", "name": "manager", "role": "Manager" },
    { "id": "a1", "name": "admin", "role": "Admin" },
    { "id": "1774946032328", "name": "aryan", "role": "Employee" },
    { "id": "1774946099788", "name": "bawankar", "role": "Employee" },
    { "id": "1774946134823", "name": "banawakr", "role": "Employee" }
  ],
  "leaves": [
    { "employeeId": "1774937683155", "employee": "Priyanka", "startDate": "2026-04-01", "endDate": "2026-04-03", "reason": "sick ", "status": "Approved", "days": 3, "id": 1 },
    { "employeeId": "1774938701765", "employee": "aryan", "startDate": "2026-04-13", "endDate": "2026-04-17", "reason": "wedding ", "status": "Pending", "days": 5, "id": 2 },
    { "employeeId": "1774939420331", "employee": "priyanka", "startDate": "2026-04-13", "endDate": "2026-04-17", "reason": "wedding", "status": "Rejected", "days": 5, "id": 3 },
    { "employeeId": "1774940145630", "employee": "alisha", "startDate": "2026-04-08", "endDate": "2026-04-10", "reason": "travlling ", "status": "Approved", "days": 3, "id": 4 },
    { "employeeId": "1774941471418", "employee": "alisha", "startDate": "2026-04-15", "endDate": "2026-04-17", "reason": "emergycy ", "status": "Pending", "days": 3, "id": 5 },
    { "employeeId": "1774946099788", "employee": "bawankar", "startDate": "2026-04-08", "endDate": "2026-04-10", "reason": "going for trip", "status": "Pending", "days": 3, "id": 6 }
  ]
};

const handleMockRequest = async (url, options) => {
  if (!localStorage.getItem('mock_db')) {
    localStorage.setItem('mock_db', JSON.stringify(SEED_DATA));
  }
  
  const mockDb = JSON.parse(localStorage.getItem('mock_db'));
  const urlParts = url.split('?');
  const pathParts = urlParts[0].split('/').filter(p => p);
  const resource = pathParts[0];
  const idFromUrl = pathParts.length > 1 ? pathParts[1] : null;
  const method = options.method || 'GET';

  if (method === 'GET') {
    if (resource === 'server-time') return { body: { currentTime: new Date().toISOString() }, statusCode: 200 };
    
    let data = mockDb[resource] || [];
    
    if (urlParts[1]) {
      const params = new URLSearchParams(urlParts[1]);
      data = data.filter(item => {
        let match = true;
        params.forEach((val, key) => {
          if (key === 'employeeId' && String(item.employeeId) !== val) match = false;
          if (key === 'status' && item.status !== val) match = false;
          if (key.includes('_like')) {
            const field = key.replace('_like', '');
            if (!item[field] || !item[field].toLowerCase().includes(val.toLowerCase())) match = false;
          }
        });
        return match;
      });
    }
    return { body: data, statusCode: 200 };
  }

  if (method === 'POST') {
    const newItem = { ...options.json, id: Date.now() };
    mockDb[resource] = [...(mockDb[resource] || []), newItem];
    localStorage.setItem('mock_db', JSON.stringify(mockDb));
    return { body: newItem, statusCode: 201 };
  }

  if (method === 'PUT' || method === 'PATCH') {
    const id = idFromUrl || (options.json && options.json.id);
    const index = mockDb[resource].findIndex(i => String(i.id) === String(id));
    if (index !== -1) {
      mockDb[resource][index] = { ...mockDb[resource][index], ...options.json };
      localStorage.setItem('mock_db', JSON.stringify(mockDb));
      return { body: mockDb[resource][index], statusCode: 200 };
    }
  }

  return { body: [], statusCode: 200 }; // Default safe fallback
};

const gotWrapper = async (url, options = {}) => {
  // If we already know we're in mock mode, bypass fetch entirely to clean up Network tab
  if (isMockMode) {
    return handleMockRequest(url, options);
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const config = {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.json ? JSON.stringify(options.json) : undefined
  };

  try {
    const response = await fetch(fullUrl, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return { body: data, statusCode: response.status };
  } catch (error) {
    // On first failure, switch to mock mode and retry silently
    isMockMode = true;
    console.info("Switching to offline mock mode to prevent further network errors.");
    return handleMockRequest(url, options);
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
