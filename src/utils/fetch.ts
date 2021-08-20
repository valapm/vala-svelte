export async function get(url) {
  const requestOptions = {
    method: "GET"
  }
  return fetch(url, requestOptions).then(handleResponse)
}

export async function post(url, body) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }
  return fetch(url, requestOptions).then(handleResponse)
}

export async function put(url, body) {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }
  return fetch(url, requestOptions).then(handleResponse)
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete(url) {
  const requestOptions = {
    method: "DELETE"
  }
  return fetch(url, requestOptions).then(handleResponse)
}

// helper functions

function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text)

    if (!response.ok) {
      console.log(response)
      const error = data || response.statusText
      console.error(data)
      return Promise.reject(new Error(response.statusText))
    }

    return data
  })
}
