import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { decodeTokenPayload } from '../utils/authUtils';
import useLoadCss from '../utils/useLoadCss';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/auth';

const LoginPage = () => {
    // const navigate = useNavigate(); // Removed unused hook
    useLoadCss('auth-style.css');

    // State to manage form inputs
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [isSignIn, setIsSignIn] = useState(true);

    // --- Modal Logic Fix ---
    const showForgotPassword = () => {
        const modal = document.getElementById("forgotPasswordModal");
        if (modal) modal.classList.remove("hidden");
    };
    const hideForgotPassword = () => {
        const modal = document.getElementById("forgotPasswordModal");
        if (modal) modal.classList.add("hidden");
    };
    const handleResetPassword = (e) => {
        e.preventDefault();
        alert('Reset password function not yet implemented on backend.');
    };
    // -----------------------

    // --- Side Effect Logic (Initial Hash Check) ---
    useEffect(() => {
        const container = document.getElementById("container");
        if (container) {
            const hash = window.location.hash;
            if (hash === "#signup") {
                container.classList.add("sign-up");
                setIsSignIn(false);
            } else {
                container.classList.add("sign-in");
                setIsSignIn(true);
            }
        }
    }, []);

    // --- Form Toggling Logic (Triggers the complex CSS animation) ---
    const toggle = () => {
        const container = document.getElementById("container");
        if (container) {
            if (isSignIn) {
                container.classList.remove("sign-in");
                container.classList.add("sign-up");
                window.location.hash = "#signup";
            } else {
                container.classList.remove("sign-up");
                container.classList.add("sign-in");
                window.location.hash = "#signin";
            }
            setIsSignIn(!isSignIn);
        }
    };


    // --- API Call: Login (CRITICAL FIX APPLIED HERE) ---
    // --- API Call: Login ---
    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Attempting Login to:", API_BASE_URL); // Debug Log
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email: loginEmail,
                password: loginPassword,
            });
            alert('Login Successful');
            localStorage.setItem("token", response.data.token);

            const tokenPayload = decodeTokenPayload(response.data.token);
            const userRole = tokenPayload.user.role;

            if (userRole === "admin") {
                window.location.replace('/admin');
            } else {
                window.location.replace('/');
            }

        } catch (error) {
            console.error("Login Error:", error);
            const errMsg = error.response?.data?.message || error.message || "Login failed";
            alert(`Login Error: ${errMsg}\n(Check Console for details)`);
        }
    };

    // --- API Call: Signup ---
    const handleSignup = async (e) => {
        e.preventDefault();
        if (signupPassword !== signupConfirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        console.log("Attempting Signup to:", API_BASE_URL); // Debug Log
        try {
            await axios.post(`${API_BASE_URL}/register`, {
                username: signupUsername,
                email: signupEmail,
                password: signupPassword,
            });
            alert('Signup Successful. Please log in.');
            toggle();
        } catch (error) {
            console.error("Signup Error:", error);
            const errMsg = error.response?.data?.message || error.message || "Signup failed";
            alert(`Signup Error: ${errMsg}\nTarget API: ${API_BASE_URL}`);
        }
    };

    // --- JSX Render (Unchanged) ---
    return (
        <div id="container" className="container">

            {/* FORM SECTION */}
            <div className="row">

                {/* SIGN UP */}
                <div className="col align-items-center flex-col sign-up">
                    <div className="form-wrapper align-items-center">
                        <form className="form sign-up" onSubmit={handleSignup}>
                            <div className="input-group">
                                <i className='bx bxs-user'></i>
                                <input type="text" placeholder="Username" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <i className='bx bx-mail-send'></i>
                                <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <i className='bx bxs-lock-alt'></i>
                                <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <i className='bx bxs-lock-alt'></i>
                                <input type="password" placeholder="Confirm password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
                            </div>
                            <button type="submit">Sign up</button>
                            <p>
                                <span>Already have an account?</span>
                                <b onClick={toggle} className="pointer">Sign in here</b>
                            </p>
                        </form>
                    </div>
                </div>
                {/* END SIGN UP */}

                {/* SIGN IN */}
                <div className="col align-items-center flex-col sign-in">
                    <div className="form-wrapper align-items-center">
                        <form className="form sign-in" onSubmit={handleLogin}>
                            <div className="input-group">
                                <i className='bx bx-mail-send'></i>
                                <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <i className='bx bxs-lock-alt'></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                                ></i>
                            </div>
                            <button type="submit">Sign in</button>
                            <p>
                                <a href="#" className="text-primary-color hover:underline" onClick={showForgotPassword}>Forgot Password?</a>
                            </p>
                            <p>
                                <span>Don't have an account?</span>
                                <b onClick={toggle} className="pointer">Sign up here</b>
                            </p>
                        </form>
                    </div>
                </div>
                {/* END SIGN IN */}
            </div>
            {/* END FORM SECTION */}

            {/* CONTENT SECTION (Visual backgrounds and text) */}
            <div className="row content-row">
                <div className="col align-items-center flex-col">
                    <div className="text sign-in"><h2>Welcome</h2></div>
                    <div className="img sign-in"></div>
                </div>
                <div className="col align-items-center flex-col">
                    <div className="img sign-up"></div>
                    <div className="text sign-up"><h2>Join with us</h2></div>
                </div>
            </div>
            {/* END CONTENT SECTION */}

            {/* Forgot Password Modal (Updated to use hideForgotPassword) */}
            <div id="forgotPasswordModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden">
                <div className="form-wrapper align-items-center">
                    <form className="form sign-in" onSubmit={handleResetPassword}>
                        <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
                        <div className="input-group">
                            <i className='bx bx-mail-send'></i>
                            <input type="email" id="forgot-email" placeholder="Enter your email" className="mt-1 block w-full p-2 border border-[var(--border)] bg-[var(--gray)] text-[var(--black)] rounded-md" required />
                        </div>
                        <button id="reset-password-btn" type="submit" className="w-full bg-primary-color text-white p-2 rounded-md hover:bg-secondary-color transition-colors mt-4">
                            Send Reset Link
                        </button>
                        <p className="mt-2">
                            <a href="#" className="text-primary-color hover:underline" onClick={hideForgotPassword}>Back to Login</a>
                        </p>
                    </form>
                </div>
            </div>
            {/* END Forgot Password Modal */}
        </div>
    );
};

export default LoginPage;