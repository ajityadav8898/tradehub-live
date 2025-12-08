// /client/public/auth.js

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:5000'; // Change to your deployed URL in production

// Helper function to decode JWT payload
const decodeTokenPayload = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

// Toggle function for login/signup view
const toggle = () => {
    const container = document.getElementById("container");
    if (container.classList.contains("sign-in")) {
        container.classList.remove("sign-in");
        container.classList.add("sign-up");
        window.location.hash = "#signup";
    } else {
        container.classList.remove("sign-up");
        container.classList.add("sign-in");
        window.location.hash = "#signin";
    }
};

// Function to handle login
const handleLogin = async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login Successful');
            localStorage.setItem("token", data.token);

            // Decode the token to get the user's role
            const tokenPayload = decodeTokenPayload(data.token);
            const userRole = tokenPayload.user.role;

            if (userRole === "admin") {
                window.location.href = `/admin.html`;
            } else {
                window.location.href = `/index.html`;
            }
        } else {
            alert(data.message || "Login failed");
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert("Error logging in. Please try again.");
    }
};

// Function to handle signup
const handleSignup = async () => {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup Successful. Please log in.");
            toggle();
        } else {
            alert(data.message || "Signup failed");
        }
    } catch (error) {
        console.error('Signup Error:', error);
        alert("Error signing up. Please try again.");
    }
};

// Event listeners for login and signup buttons
document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('signup-btn').addEventListener('click', handleSignup);

// Add a logout button event listener (if it exists on other pages)
// Example on another page like index.html
/*
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = `/login.html`; // Redirect back to login page
});
*/

// Forgot Password Modal Functions
const showForgotPassword = () => {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
};

const hideForgotPassword = () => {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

document.getElementById('reset-password-btn').addEventListener('click', async () => {
    const email = document.getElementById('forgot-email').value;
    if (!email) {
        alert('Please enter your email.');
        return;
    }
    alert('Forgot password functionality is not yet implemented on the backend.');
});