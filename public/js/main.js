// This file has been rerwirteen as it originally ocntaioned way too much AI generated/assisted code
// I have added comments to explain what each part does
// I also addded recources I used to help me understand how to do certain things
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://stackoverflow.com/questions/50046841/proper-way-to-make-api-fetch-post-with-async-await
async function api(url, options = {}) {
    const res = await fetch(url, options);
    if (res.status === 401) { location.href = '/login.html'; throw new Error('unauthorized'); }
    return res;
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
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

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
async function load(){
    const tbody = document.querySelector('#items tbody');
    if (!tbody) return;
    const res = await api('/api/items');
    const rows = await res.json();
    tbody.innerHTML = rows.map(rowTemplate).join('');
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
// https://stackoverflow.com/questions/77305758/why-would-i-put-e-preventdefault-at-the-beginning-of-my-async-function
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

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function onTableClick(e){
    const tr = e.target.closest('tr'); if (!tr) return;
    const id = tr.dataset.id;

    if (e.target.classList.contains('del')) {
        await api(`/api/items/${id}`, { method:'DELETE' });
        load();
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
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

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function logout(){
    await fetch('/auth/logout', { method:'POST' });
    location.href = '/login.html';
}

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#contact-form');
    if (form) form.addEventListener('submit', addItem);

    const table = document.querySelector('#items');
    if (table) table.addEventListener('click', onTableClick);

    const out = document.querySelector('#logout');
    if (out) out.addEventListener('click', logout);

    load();
});
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow 
//https://stackoverflow.com/questions/50046841/proper-way-to-make-api-fetch-post-with-async-await
//https://stackoverflow.com/questions/73063874/in-js-fetch-api-promise-style-how-to-get-the-raw-body-when-the-json-function 
//this function only really has AI generated/assisted code the implemnting of date from a example i found, it helpemd me somewhat modfiy for this ude
async function Inbox() {
    const tbody = document.querySelector("#items tbody");
    if (!tbody) return;
    const res = await fetch("/api/items");
    const items = await res.json();
    tbody.innerHTML = items.map(r => `
        <tr data-id="${r.id}">
            <td>${r.name}</td>
            <td>${r.email}</td>
            <td>${r.message}</td>
            <td>${r.priority || "Low"}</td>
            <td>${new Date(r.responseBy).toLocaleString()}</td>
            <td><button class="del">Delete</button></td>
        </tr>
   
        `).join("");
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
//https://stackoverflow.com/questions/77305758/why-would-i-put-e-preventdefault-at-the-beginning-of-my-async-function
//https://stackoverflow.com/questions/73063874/in-js-fetch-api-promise-style-how-to-get-the-raw-body-when-the-json-function 
async function Submit(e) {
    e.preventDefault();
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const body = JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        message: form.message.value,
        priority: form.priority.value
    }
);
    await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
    }
    );
    form.reset();
    Inbox();
}

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function Tap(e) {
    const btn = e.target.closest(".del");
    if (!btn) return;

     const id = btn.closest("tr")?.dataset?.id;
    if (!id) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
      loadInbox();
}

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
//https://stackoverflow.com/questions/63352201/event-listener-on-form-submit-not-working
// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#contact-form");
    if (form) form.addEventListener("submit", Submit);
     const table = document.querySelector("#items");
      if (table) table.addEventListener("click", Tap);
    Inbox();
}
);
