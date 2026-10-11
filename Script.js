
const form = document.getElementById("form");
const city = document.getElementById("city");
const status = document.getElementById("status");

if (!form || !city || !status) {
  alert("HTML IDs match avvatledu!");
} else {
  status.textContent = "JavaScript loaded successfully!";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "Button working! City: " + city.value;
  });
}
