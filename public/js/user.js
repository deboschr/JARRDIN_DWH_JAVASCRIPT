document.addEventListener("DOMContentLoaded", function () {
	// Membuka modal create
	setupCreateModalToggles();

	// Membuka modal update
	setupUpdateModalToggles();

	// Menutup modal
	setupModalCloseButtons();

	setupNewUserCreation();
});

function setupCreateModalToggles() {
	const createButton = document.getElementById("newUserButton");
	createButton.addEventListener("click", function () {
		document.getElementById("createModal").style.display = "block";
	});
}

function setupUpdateModalToggles() {
	const updateButtons = document.querySelectorAll(".update-button");
	updateButtons.forEach((button) => {
		button.addEventListener("click", function () {
			document.getElementById("updateModal").style.display = "block";
			const userId = button.getAttribute("data-userid");
			fetchUserDetails(userId);
		});
	});
}

function setupModalCloseButtons() {
	const closeButtons = document.querySelectorAll(".close-button");
	closeButtons.forEach((button) => {
		button.addEventListener("click", function () {
			this.closest(".modal").style.display = "none";
		});
	});
}

function fetchUserDetails(userId) {
	fetch(`/api/v1/user/${userId}`)
		.then((response) => response.json())
		.then((user) => {
			document.getElementById("updateName").value = user.name;
			document.getElementById("updateEmail").value = user.email;
			document.getElementById("updateStatus").value = user.status;
			document.getElementById("updateModal").style.display = "block";
		})
		.catch((error) => console.error("Error fetching user details:", error));
}

function setupNewUserCreation() {
	document
		.getElementById("createForm")
		.addEventListener("submit", function (event) {
			event.preventDefault();
			createUser();
		});
}

function createUser() {
	const name = document.getElementById("newName").value;
	const email = document.getElementById("newEmail").value;
	const password = document.getElementById("newPassword").value;

	fetch("/api/v1/user", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("User created successfully!");
			location.reload(); // Reload to update the list of users
		})
		.catch((error) => {
			console.error("Error creating user:", error);
			alert("Failed to create user.");
		});
}
