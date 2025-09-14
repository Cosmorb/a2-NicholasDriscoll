async function loadInbox() {
const tbody = document.querySelector("#items tbody");
if (!tbody) return; // not on contact page
const res = await fetch("/api/items");
const items = await res.json();
tbody.innerHTML = items.map(r => `
<!---->
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


<!---->
async function onSubmit(e) {
    e.preventDefault();
    const form = document.querySelector("#contact-form");
    if (!form) return;
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
    form.reset();
    loadInbox();
}

async function onClick(e) {
    const btn = e.target.closest(".del");
    if (!btn) return;
    <!---->
    const id = e.target.closest("tr")?.dataset?.id;
    if (!id) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    loadInbox();
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#contact-form");

    if (form) form.addEventListener("submit", onSubmit);
    const table = document.querySelector("#items");

    if (table) table.addEventListener("click", onClick);

    loadInbox();

});
