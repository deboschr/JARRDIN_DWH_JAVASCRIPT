document.addEventListener("DOMContentLoaded", function () {
	setupCreateModalToggles();
	setupUpdateModalToggles();
	setupModalCloseButtons();
	bindModalFormActions();
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
			const userId = button.getAttribute("data-userid");
			getUserDetails(userId);
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

function getUserDetails(userId) {
	fetch(`/api/v1/user/${userId}`)
		.then((response) => response.json())
		.then((user) => {
			document.getElementById("updateUserId").value = userId; // Set the user ID for use in update/delete functions
			document.getElementById("updateName").value = user.name;
			document.getElementById("updateEmail").value = user.email;
			document.getElementById("updateStatus").value = user.status;
			document.getElementById("updateModal").style.display = "block";
		})
		.catch((error) => console.error("Error fetching user details:", error));
}

function bindModalFormActions() {
	document.getElementById("createButton").addEventListener("click", createUser);
	document.getElementById("saveButton").addEventListener("click", updateUser);
	document.getElementById("deleteButton").addEventListener("click", deleteUser);
}

function createUser() {
	const name = document.getElementById("newName").value;
	const email = document.getElementById("newEmail").value;
	const password = document.getElementById("newPassword").value;

	fetch("/api/v1/user/signup", {
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

function updateUser() {
	const userId = document.getElementById("updateUserId").value;
	const name = document.getElementById("updateName").value;
	const email = document.getElementById("updateEmail").value;
	const status = document.getElementById("updateStatus").value;

	fetch(`/api/v1/user/${userId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, status }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("User updated successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error updating user:", error);
			alert("Failed to update user.");
		});
}

function deleteUser() {
	const userId = document.getElementById("updateUserId").value;

	fetch(`/api/v1/user/${userId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	})
		.then((response) => response.json())
		.then((data) => {
			alert("User deleted successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error deleting user:", error);
			alert("Failed to delete user.");
		});
}
