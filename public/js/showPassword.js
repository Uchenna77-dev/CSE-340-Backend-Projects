document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("account_password");

  toggleBtn.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type");
    if (type === "password") {
      passwordInput.setAttribute("type", "text");
      toggleBtn.textContent = "Hide";
    } else {
      passwordInput.setAttribute("type", "password");
      toggleBtn.textContent = "Show";
    }
  });
});
