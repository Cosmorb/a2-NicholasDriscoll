async function loadInbox() {
const tbody = document.querySelector("#items tbody");
if (!tbody) return;
const res = await fetch("/api/items");
const items = await res.json();
tbody.innerHTML = items.map(r => `
<!-- So AI did help after it saw what iwas trying to do-->
<tr data-id="${r.id}">
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.message}</td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td><button class="del">Delete</button></td>
      
</tr>
`).join("");
}


<!--this function primarly was creatdd through the braisteomr AI, it saw what i was trying to do and corrected after i kept failing to wite it -->
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
    <!-- most of this was written by me but it autofil some line, and reanme a function it though tas better-->
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
