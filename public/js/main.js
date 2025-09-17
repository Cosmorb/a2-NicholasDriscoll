// loadInbox: Based off MDN Fetch API and table manipulation
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
// Also inspired by Stack Overflow: https://stackoverflow.com/a/54073196
async function loadInbox() {
    const tbody = document.querySelector("#items tbody");
    if (!tbody) return;
    const res = await fetch("/api/items");
    const items = await res.json();
    tbody.innerHTML = items.map(r => `
        <tr data-id="${r.id}">
            <td>${r.name}</td>
            <td>${r.email}</td>
            <td>${r.message}</td>
            <td>${new Date(r.createdAt).toLocaleString()}</td>
            <td><button class="del">Delete</button></td>
        </tr>
    `).join("");
}

// onSubmit: Based off MDN Fetch API and Form handling
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
// Also inspired by Stack Overflow: https://stackoverflow.com/a/42967469
async function onSubmit(e) {
    e.preventDefault();
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const body = JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        message: form.message.value
    });
    await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
    });
    form.reset();
    loadInbox();
}

// onClick: Based off MDN Event Delegation and Fetch API
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Also inspired by Stack Overflow: https://stackoverflow.com/a/34896361
async function onClick(e) {
    const btn = e.target.closest(".del");
    if (!btn) return;
    const id = btn.closest("tr")?.dataset?.id;
    if (!id) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    loadInbox();
}

// DOMContentLoaded: Based off MDN DOMContentLoaded event
// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
// Also inspired by Stack Overflow: https://stackoverflow.com/a/7999818
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#contact-form");
    if (form) form.addEventListener("submit", onSubmit);
    const table = document.querySelector("#items");
    if (table) table.addEventListener("click", onClick);
    loadInbox();
});
