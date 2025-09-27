// References:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement

// Simple fetch wrapper that redirects to login if not authenticated
async function api(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) { location.href = '/login.html'; throw new Error('unauthorized'); }
  return res;
}

// Renders one table row; NOTE: uses Mongo's _id and createdAt
function rowTemplate(r){
  return `
    <tr data-id="${r._id}">
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.message}</td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>
        <button class="edit">Edit</button>
        <button class="del">Delete</button>
      </td>
    </tr>
  `;
}

// Load all items for the logged-in user
async function load(){
  const tbody = document.querySelector('#items tbody');
  if (!tbody) return;
  const res = await api('/api/items');
  const rows = await res.json();
  tbody.innerHTML = rows.map(rowTemplate).join('');
}

// Create a new item
async function addItem(e){
  e.preventDefault();
  const body = JSON.stringify({
    name: document.querySelector('#name').value.trim(),
    email: document.querySelector('#email').value.trim(),
    message: document.querySelector('#message').value.trim()
  });
  const res = await api('/api/items', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body
  });
  if (res.ok) { e.target.reset(); load(); }
}

// Handle edit/delete buttons in the table
async function onTableClick(e){
  const tr = e.target.closest('tr'); if (!tr) return;
  const id = tr.dataset.id;

  if (e.target.classList.contains('del')) {
    await api(`/api/items/${id}`, { method:'DELETE' });
    load();
  }

  if (e.target.classList.contains('edit')) {
    const message = prompt('New message:');
    if (message) {
      await api(`/api/items/${id}`, {
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message })
      });
      load();
    }
  }
}

// Logout and return to login page
async function logout(){
  await fetch('/auth/logout', { method:'POST' });
  location.href = '/login.html';
}

// Wire up page once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (form) form.addEventListener('submit', addItem);

  const table = document.querySelector('#items');
  if (table) table.addEventListener('click', onTableClick);

  const out = document.querySelector('#logout');
  if (out) out.addEventListener('click', logout);

  load();
});
