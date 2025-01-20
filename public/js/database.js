document.addEventListener("DOMContentLoaded", function () {
	setupCreateModalToggles();
	setupUpdateModalToggles();
	setupModalCloseButtons();
	bindModalFormActions();
});

function setupCreateModalToggles() {
	const createButton = document.getElementById("newDatabaseButton");
	createButton.addEventListener("click", function () {
		document.getElementById("createModal").style.display = "block";
	});
}

function setupUpdateModalToggles() {
	const updateButtons = document.querySelectorAll(".update-button");
	updateButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const databaseId = button.getAttribute("data-databaseid");
			getDatabaseDetails(databaseId);
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

function getDatabaseDetails(databaseId) {
	fetch(`/api/v1/database/${databaseId}`)
		.then((response) => response.json())
		.then((database) => {
			document.getElementById("updateDatabaseId").value = databaseId; // Set the database ID for use in update/delete functions
			document.getElementById("updateName").value = database.name;
			document.getElementById("updateEmail").value = database.email;
			document.getElementById("updateStatus").value = database.status;
			document.getElementById("updateModal").style.display = "block";
		})
		.catch((error) => console.error("Error fetching database details:", error));
}

function bindModalFormActions() {
	document.getElementById("createButton").addEventListener("click", createDatabase);
	document.getElementById("saveButton").addEventListener("click", updateDatabase);
	document.getElementById("deleteButton").addEventListener("click", deleteDatabase);
}

function createDatabase() {
	const name = document.getElementById("newName").value;
	const email = document.getElementById("newEmail").value;
	const password = document.getElementById("newPassword").value;

	fetch("/api/v1/database/signup", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Database created successfully!");
			location.reload(); // Reload to update the list of databases
		})
		.catch((error) => {
			console.error("Error creating database:", error);
			alert("Failed to create database.");
		});
}

function updateDatabase() {
	const databaseId = document.getElementById("updateDatabaseId").value;
	const name = document.getElementById("updateName").value;
	const email = document.getElementById("updateEmail").value;
	const status = document.getElementById("updateStatus").value;

	fetch(`/api/v1/database/${databaseId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, status }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Database updated successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error updating database:", error);
			alert("Failed to update database.");
		});
}

function deleteDatabase() {
	const databaseId = document.getElementById("updateDatabaseId").value;

	fetch(`/api/v1/database/${databaseId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Database deleted successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error deleting database:", error);
			alert("Failed to delete database.");
		});
}
