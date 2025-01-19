document.addEventListener("DOMContentLoaded", function () {
	const navList = document.querySelector(".nav-list");
   
	navList.classList.toggle("active");
   
	const navLinks = document.querySelectorAll(".nav-link");
	const currentPath = window.location.pathname;

	navLinks.forEach((link) => {
		if (link.getAttribute("href") === currentPath) {
			link.classList.add("active");
		}
	});
});
