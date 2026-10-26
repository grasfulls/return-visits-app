document.addEventListener("DOMContentLoaded", () => {
  // Bottom Navigation Switching
  const navButtons = document.querySelectorAll(".nav-btn");
  const views = document.querySelectorAll(".view");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      views.forEach((v) => v.classList.remove("active"));
      navButtons.forEach((b) => b.classList.remove("active-tab"));

      document.getElementById(targetId).classList.add("active");
      btn.classList.add("active-tab");
    });
  });

  // Default to Contacts View
  navButtons[0].click();
});
