
async function loadInbox() {
    const res = await fetch("/api/items");
    const items = await res.json();
    const tbody = document.querySelector("#items tbody");

    tbody.innerHTML = items.map(r => `
    <tr data-id="${r.id}">
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.message}</td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>${new Date(r.respondBy).toLocaleString()}</td>
      <td><button class="del">Delete</button></td>
    </tr>
  `).join("");
}

async function onSubmit(e) {
    e.preventDefault();

    const body = JSON.stringify({
        name:    document.querySelector("#name").value,
        email:   document.querySelector("#email").value,
        message: document.querySelector("#message").value
    });

    await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
    });

    e.target.reset();
    loadInbox();
}

async function onClick(e) {
    if (!e.target.classList.contains("del")) return;
    const id = e.target.closest("tr")?.dataset?.id;
    if (!id) return;

    await fetch(`/api/items/${id}`, { method: "DELETE" });
    loadInbox();   // refresh the table
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#contact-form").addEventListener("submit", onSubmit);
    document.querySelector("#items").addEventListener("click", onClick);
    loadInbox();
});
