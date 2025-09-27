// Contact Management System - Updated for A3
// This file handles CRUD operations for user-specific contact data
// References:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
// https://stackoverflow.com/questions/50046841/proper-way-to-make-api-fetch-post-with-async-await

// --- helpers ---

function rowView(r){
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

function rowEdit(r){
  return `
    <tr data-id="${r._id}">
      <td><input name="name"   value="${r.name}"></td>
      <td><input name="email"  value="${r.email}"></td>
      <td><input name="message" value="${r.message}"></td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>
        <button class="save">Save</button>
        <button class="cancel">Cancel</button>
      </td>
    </tr>
  `;
}

// --- load table ---

async function load(){
  const tbody = document.querySelector('#items tbody');
  if (!tbody) return;
  const res = await fetch('/api/items'); // protected by session
  if (res.status === 401) { location.href = '/login'; return; } // redirect to login if not authenticated
  const rows = await res.json();
  tbody.innerHTML = rows.map(rowView).join('');
}

// --- events ---

document.addEventListener('DOMContentLoaded', () => {
  const form  = document.querySelector('#contact-form');
  const table = document.querySelector('#items');

  // Form submission - Create new contact
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = JSON.stringify({
      name:   form.querySelector('#name').value.trim(),
      email:  form.querySelector('#email').value.trim(),
      message:form.querySelector('#message').value.trim()
    });
    const res = await fetch('/api/items', { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body 
    });
    if (res.ok) { 
      form.reset(); 
      load(); // Reload table to show new contact
    }
  });

  // Table click events - Edit, Delete, Save, Cancel
  if (table) table.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr'); 
    if (!tr) return;
    const id = tr.dataset.id;

    // Delete contact
    if (e.target.classList.contains('del')) {
      if (confirm('Are you sure you want to delete this contact?')) {
        await fetch(`/api/items/${id}`, { method:'DELETE' });
        load(); // Reload table
      }
      return;
    }

    // Enter edit mode
    if (e.target.classList.contains('edit')) {
      // Fetch fresh data so inputs show latest values
      const doc = await (await fetch('/api/items')).json();
      const r = doc.find(x => x._id === id);
      if (!r) return;
      tr.outerHTML = rowEdit(r); // Replace row with editable version
      return;
    }

    // Save changes
    if (e.target.classList.contains('save')) {
      const name    = tr.querySelector('input[name="name"]').value.trim();
      const email   = tr.querySelector('input[name="email"]').value.trim();
      const message = tr.querySelector('input[name="message"]').value;
      const res = await fetch(`/api/items/${id}`, {
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name, email, message })
      });
      if (res.ok) load(); // Reload table to show updated data
      return;
    }

    // Cancel editing - reload table to restore original view
    if (e.target.classList.contains('cancel')) { 
      load(); 
      return; 
    }
  });

  // Logout functionality
  const logoutBtn = document.querySelector('#logout');
  if (logoutBtn) logoutBtn.addEventListener('click', async () => {
    await fetch('/auth/logout', { method: 'POST' });
    location.href = '/login';
  });

  // Initial load
  load();
});