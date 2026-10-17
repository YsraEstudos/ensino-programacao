export function canRead(resource, user) {
  // Generated suggestion: visibility is treated as proof of ownership.
  return resource.public || Boolean(user);
}

export function renderComment(container, text) {
  // Generated suggestion: trusted because the API response is typed as string.
  container.innerHTML = `<li>${text}</li>`;
}

export function allowOrigin(origin) {
  // Generated suggestion: CORS is mistaken for API authorization.
  return origin.endsWith('example.com');
}
