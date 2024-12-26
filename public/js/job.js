document.addEventListener("DOMContentLoaded", function () {
	fetchJobs(); // Memanggil fungsi fetchJobs saat halaman dimuat
});

// Fungsi untuk mengambil semua job dari server dan menampilkannya di tabel
function fetchJobs() {
	fetch("http://localhost:3000/job")
		.then((response) => response.json())
		.then((data) => {
			const jobTableBody = document
				.getElementById("jobTable")
				.getElementsByTagName("tbody")[0];
			jobTableBody.innerHTML = ""; // Bersihkan tabel sebelum diisi

			data.forEach((job) => {
				let row = jobTableBody.insertRow();
				row.innerHTML = `
                    <td>${job.job_id}</td>
                    <td>${job.name}</td>
                    <td>${job.status}</td>
                    <td>
                        <button class="button-edit" onclick="showEditJobModal(${job.job_id})">Edit</button>
                        <button class="button-delete" onclick="deleteJob(${job.job_id})">Delete</button>
                    </td>
                `;
			});
		})
		.catch((error) => console.error("Error fetching jobs:", error));
}

// Fungsi untuk menampilkan modal dan menambahkan job baru
function addJob() {
	const jobName = document.getElementById("jobName").value;
	const jobData = {
		name: jobName,
		status: "Active", // Status default saat penambahan
	};

	fetch("http://localhost:3000/job", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(jobData),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Job added:", data);
			fetchJobs(); // Refresh job list
		})
		.catch((error) => console.error("Error adding job:", error));
}

// Fungsi untuk menampilkan modal dengan detail job dan memperbarui
function showEditJobModal(jobId) {
	// Ambil data job berdasarkan jobId untuk diisi dalam form modal (implementasi modal tidak ditunjukkan)
	fetch(`http://localhost:3000/job/${jobId}`)
		.then((response) => response.json())
		.then((data) => {
			console.log("Editing job:", data); // Log data atau isi form edit
		})
		.catch((error) => console.error("Error fetching job details:", error));
}

// Fungsi untuk mengupdate job yang ada
function updateJob(jobId) {
	const jobData = {
		name: document.getElementById("editJobName").value,
		status: document.getElementById("editJobStatus").value,
	};

	fetch(`http://localhost:3000/job/${jobId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(jobData),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Job updated:", data);
			fetchJobs(); // Refresh job list
		})
		.catch((error) => console.error("Error updating job:", error));
}

// Fungsi untuk menghapus job
function deleteJob(jobId) {
	fetch(`http://localhost:3000/job/${jobId}`, {
		method: "DELETE",
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Job deleted:", data);
			fetchJobs(); // Refresh job list
		})
		.catch((error) => console.error("Error deleting job:", error));
}
