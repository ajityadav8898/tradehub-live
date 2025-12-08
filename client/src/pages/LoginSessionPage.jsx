import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; // Assuming you have this context

// We'll place the CSS directly inside the component for simplicity
const loginSessionStyles = `
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
}

header {
    background-color: #333;
    color: white;
    padding: 15px;
    text-align: center;
}

nav ul {
    list-style-type: none;
    padding: 0;
    display: flex;
    justify-content: center;
}

nav ul li {
    margin: 0 15px;
}

nav ul li a {
    text-decoration: none;
    color: white;
    font-weight: bold;
}

nav ul li a:hover {
    text-decoration: underline;
}

main {
    text-align: center;
    margin-top: 20px;
}

table {
    width: 90%;
    margin: 20px auto;
    border-collapse: collapse;
    background-color: white;
}

th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
}

th {
    background-color: #333;
    color: white;
}

button {
    padding: 5px 10px;
    color: white;
    background-color: red;
    border: none;
    cursor: pointer;
}

button:hover {
    background-color: darkred;
}
`;

const LoginSessionPage = () => {
    const [sessions, setSessions] = useState([]);
    const { user } = useContext(AuthContext); // Get user from context

    useEffect(() => {
        fetchUserSessions();
    }, []);

    // Fetch user sessions from the backend
    const fetchUserSessions = async () => {
        try {
            const token = user ? user.token : null;
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/sessions`, {
                headers: {
                    'x-auth-token': token
                }
            });

            // Sort sessions by login time (newest first) and take the 5 most recent
            const recentSessions = response.data
                .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))
                .slice(0, 5);

            setSessions(recentSessions);
        } catch (error) {
            console.error("Error fetching user sessions:", error);
            alert("Error fetching sessions. Please try again.");
        }
    };

    return (
        <>
            <style>{loginSessionStyles}</style>
            <header>
                <h1>Manage User Login Sessions</h1>
                <nav>
                    <ul>
                        <li><Link to="/admin">Admin Dashboard</Link></li>
                        <li><Link to="/admin-ebooks">Manage Ebooks</Link></li>
                        <li><Link to="/admin-chat">Manage User Support</Link></li>
                    </ul>
                </nav>
            </header>

            <main>
                <h2>Active and Past Sessions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Login Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(session => (
                            <tr key={session._id}>
                                <td>{session.username || "Unknown User"}</td>
                                <td>{new Date(session.loginTime).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </>
    );
};

export default LoginSessionPage;