function getItem(item) {
  return JSON.parse(localStorage.getItem(item));
}

function setLocalItem(item, value) {
  localStorage.setItem(item, JSON.stringify(value));
}
