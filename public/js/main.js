// This file has been rerwirteen as it originally ocntaioned way too much AI generated/assisted code
// I have added comments to explain what each part does
// I also addded recources I used to help me understand how to do certain things

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow 
//https://stackoverflow.com/questions/50046841/proper-way-to-make-api-fetch-post-with-async-await
//https://stackoverflow.com/questions/73063874/in-js-fetch-api-promise-style-how-to-get-the-raw-body-when-the-json-function 
//this function only really has AI generated/assisted code the implemnting of date from a example i found, it helpemd me somewhat modfiy for this ude
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
async function onSubmit(e) {
    e.preventDefault();
    const form =  document.querySelector("#contact-form");
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

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function onClick(e) {
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
    if (form) form.addEventListener("submit", onSubmit);
     const table = document.querySelector("#items");
      if (table) table.addEventListener("click", onClick);
    loadInbox();
});
