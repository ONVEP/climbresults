const jsonOrThrow = async (res: Response) => {
  if (res.ok)
    return res.headers.get('content-type')?.includes('application/json') ? await res.json() : null
  let error = new Error(res.statusText)
  try {
    const data = await res.json()
    if (data.message) error = new Error(data.message)
  } catch (e) {
    // ignore JSON parse errors
  }
  throw error
}

export const get = (url: string) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }).then(jsonOrThrow)
}

export const post = (url: string, body: any) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(jsonOrThrow)
}

export const put = (url: string, body: any) => {
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(jsonOrThrow)
}

export const patch = (url: string, body: any) => {
  return fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(jsonOrThrow)
}

export const del = (url: string, body?: any) => {
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(jsonOrThrow)
}
