const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.details
      ? `${data.error || 'Request failed'}: ${data.details}`
      : (data.error || res.statusText || 'Request failed');
    const err = new Error(message);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}

export const api = {
  employees: {
    list: () => request('api/employees/'),
    create: (body) => request('api/employees/', { method: 'POST', body }),
    get: (id) => request(`api/employees/${id}/`),
    delete: (id) => request(`api/employees/${id}/`, { method: 'DELETE' }),
  },
  attendance: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`api/attendance/${q ? `?${q}` : ''}`);
    },
    listByEmployee: (employeePk, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`api/attendance/employee/${employeePk}/${q ? `?${q}` : ''}`);
    },
    create: (body) => request('api/attendance/', { method: 'POST', body }),
  },
};
