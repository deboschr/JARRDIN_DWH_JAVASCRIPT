document.addEventListener("DOMContentLoaded", function () {
	setupCreateModalToggles();
	setupUpdateModalToggles();
	setupModalCloseButtons();
	bindModalFormActions();
});

function setupCreateModalToggles() {
	const createButton = document.getElementById("newJobButton");
	createButton.addEventListener("click", function () {
		document.getElementById("createModal").style.display = "block";
	});
}

function setupUpdateModalToggles() {
	const updateButtons = document.querySelectorAll(".update-button");
	updateButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const jobId = button.getAttribute("data-jobid");
			getJobDetails(jobId);
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

function bindModalFormActions() {
	document.getElementById("createButton").addEventListener("click", createJob);
	document.getElementById("saveButton").addEventListener("click", updateJob);
	document.getElementById("deleteButton").addEventListener("click", deleteJob);
}

function getJobDetails(jobId) {
	fetch(`/api/v1/job/${jobId}`)
		.then((response) => response.json())
		.then((job) => {
			document.getElementById("updateJobId").value = jobId;
			document.getElementById("updateName").value = job.name;
			document.getElementById("updateCron").value = job.cron;
			document.getElementById("updateStatus").value = job.status;
			document.getElementById("updateSourceDatabase").value =
				job.source_db.database_id;
			document.getElementById("updateDestinationDatabase").value =
				job.destination_db.database_id;
			document.getElementById("updateSourceTables").value = job.source_tables;
			document.getElementById("updateDestinationTables").value =
				job.destination_tables;
			document.getElementById("updateDuplicateKeys").value = job.duplicate_keys;
			document.getElementById("updateTransformScript").value =
				job.transform_script;
			document.getElementById("updateModal").style.display = "block";
		})
		.catch((error) => console.error("Error fetching job details:", error));
}

function createJob() {
	const form = document.getElementById("createForm");
	const formData = new FormData(form);

	// Convert comma-separated inputs to arrays
	const sourceTables = formData
		.get("source_tables")
		.split(",")
		.map((item) => item.trim());
	const destinationTables = formData
		.get("destination_tables")
		.split(",")
		.map((item) => item.trim());
	const duplicateKeys = formData
		.get("duplicate_keys")
		.split(",")
		.map((item) => item.trim());

	// Construct the JSON body with correct data types
	const jobData = {
		name: formData.get("name"),
		cron: formData.get("cron"),
		source_db_id: parseInt(formData.get("source_db_id")),
		destination_db_id: parseInt(formData.get("destination_db_id")),
		source_tables: sourceTables,
		destination_tables: destinationTables,
		duplicate_keys: duplicateKeys,
		transform_script: formData.get("transform_script"),
	};

	fetch("/api/v1/job", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(jobData),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Job created successfully!");
			location.reload(); // Reload to update the list of jobs
		})
		.catch((error) => {
			console.error("Error creating job:", error);
			alert("Failed to create job.");
		});
}

function updateJob() {
	const form = document.getElementById("updateForm");
	const formData = new FormData(form);

	// Convert comma-separated inputs to arrays similarly
	const sourceTables = formData
		.get("source_tables")
		.split(",")
		.map((item) => item.trim());
	const destinationTables = formData
		.get("destination_tables")
		.split(",")
		.map((item) => item.trim());
	const duplicateKeys = formData
		.get("duplicate_keys")
		.split(",")
		.map((item) => item.trim());

	const jobData = {
		name: formData.get("name"),
		cron: formData.get("cron"),
		source_db_id: parseInt(formData.get("source_db_id")),
		destination_db_id: parseInt(formData.get("destination_db_id")),
		source_tables: sourceTables,
		destination_tables: destinationTables,
		duplicate_keys: duplicateKeys,
		transform_script: formData.get("transform_script"),
		status: formData.get("status"),
	};

	const jobId = formData.get("jobId");

	fetch(`/api/v1/job/${jobId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(jobData),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Job updated successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error updating job:", error);
			alert("Failed to update job.");
		});
}

function deleteJob() {
	const jobId = document.getElementById("updateJobId").value;
	fetch(`/api/v1/job/${jobId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Job deleted successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error deleting job:", error);
			alert("Failed to delete job.");
		});
}
