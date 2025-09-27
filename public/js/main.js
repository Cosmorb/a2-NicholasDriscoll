// References:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement

async function api(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) { location.href = '/login.html'; throw new Error('unauthorized'); }
  return res;
}

function rowTemplate(r){
  return `
    <tr data-id="${r._id}">
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.message}</td>
      <td>${r.priority || "Low"}</td>
      <td>${r.responseBy ? new Date(r.responseBy).toLocaleString() : ""}</td>
      <td>
        <button class="edit">Edit</button>
        <button class="del">Delete</button>
      </td>
    </tr>
  `;
}

async function load(){
  const tbody = document.querySelector('#items tbody');
  if (!tbody) return;
  const res = await api('/api/items');
  const rows = await res.json();
  tbody.innerHTML = rows.map(rowTemplate).join('');
}

async function addItem(e){
  e.preventDefault();
  const body = JSON.stringify({
    name: document.querySelector('#name').value.trim(),
    email: document.querySelector('#email').value.trim(),
    message: document.querySelector('#message').value.trim(),
    priority: document.querySelector('#priority')?.value || "Low"
  });
  const res = await api('/api/items', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body
  });
  if (res.ok) { e.target.reset(); load(); }
}

async function onTableClick(e){
  const tr = e.target.closest('tr'); if (!tr) return;
  const id = tr.dataset.id;

  if (e.target.classList.contains('del')) {
    await api(`/api/items/${id}`, { method:'DELETE' });
    load();
  }

  if (e.target.classList.contains('edit')) {
    const message = prompt('New message (leave blank to keep current):');
    const changePriority = confirm('Change priority too? Click OK for Yes, Cancel for No.');
    let priority;
    if (changePriority) {
      priority = prompt('Enter priority: Low, Mid, or High', 'Low');
      if (priority) priority = priority.trim();
    }

    const patch = {};
    if (message && message.trim()) patch.message = message.trim();
    if (priority && ["Low","Mid","High"].includes(priority)) patch.priority = priority;

    if (Object.keys(patch).length) {
      await api(`/api/items/${id}`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(patch)
      });
      load();
    }
  }
}

async function logout(){
  await fetch('/auth/logout', { method:'POST' });
  location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (form) form.addEventListener('submit', addItem);

  const table = document.querySelector('#items');
  if (table) table.addEventListener('click', onTableClick);

  const out = document.querySelector('#logout');
  if (out) out.addEventListener('click', logout);

  load();
});
