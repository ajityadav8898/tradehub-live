document.addEventListener("DOMContentLoaded", async () => {
    await fetchUserSessions();
});

// ✅ Fetch user sessions from the backend
async function fetchUserSessions() {
    try {
        const response = await fetch("http://localhost:5000/api/admin/logins");

        if (!response.ok) {
            throw new Error("Failed to fetch sessions");
        }

        const sessions = await response.json();
        const tableBody = document.getElementById("session-table-body");
        tableBody.innerHTML = ""; // Clear table before adding rows

        // Sort sessions by login time (newest first) and take only the 5 most recent
        const recentSessions = sessions
            .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))
            .slice(0, 5);

        recentSessions.forEach(session => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${session.username || "Unknown User"}</td>
                <td>${new Date(session.loginTime).toLocaleString()}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching user sessions:", error);
        alert("Error fetching sessions. Please try again.");
    }
}