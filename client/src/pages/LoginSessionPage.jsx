import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// import Navbar from '../components/Navbar'; // REMOVED
// import Footer from '../components/Footer'; // REMOVED
import '../styles/Admin.css'; // Import Admin styles for back-btn

// Custom styled components for the table (can be potentially moved to a shared CSS/component later)
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #0d0d0d;
    color: #e0e0e0;
    padding: 60px 20px; /* Matched Admin.css padding */
    align-items: center; /* Center content like Admin pages */
`;

const Content = styled.div`
    width: 100%;
    max-width: 1200px;
`;

const HeaderSection = styled.div`
    text-align: center;
    margin-bottom: 40px;
`;

const Title = styled(motion.h1)`
    font-size: 2.5rem;
    color: #00ff88;
    margin-bottom: 10px;
`;

const Subtitle = styled.p`
    font-size: 1.1rem;
    color: #aaa;
`;

const TableContainer = styled(motion.div)`
    background: #1a1a1a;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    overflow-x: auto;
    border: 1px solid #333;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    color: #ddd;
`;

const Th = styled.th`
    text-align: left;
    padding: 15px;
    border-bottom: 2px solid #00ff88;
    color: #00ff88;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const Td = styled.td`
    padding: 15px;
    border-bottom: 1px solid #333;
    font-size: 0.95rem;
`;

const StatusBadge = styled.span`
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    background-color: ${props => props.active ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.active ? '#00ff88' : '#aaa'};
    border: 1px solid ${props => props.active ? '#00ff88' : '#555'};
`;

const LoginSessionPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchUserSessions();
    }, []);

    const fetchUserSessions = async () => {
        try {
            const token = user ? user.token : null;
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/sessions`, {
                headers: {
                    'x-auth-token': token
                }
            });
            setSessions(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user sessions:", error);
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            {/* Back to Dashboard Link matched to AdminEbooks layout */}
            <div style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
                <Link to="/admin" className="back-btn">
                    <i className="bi bi-arrow-left"></i> Back to Dashboard
                </Link>
            </div>

            <Content>
                <HeaderSection>
                    <Title
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        User Login Sessions
                    </Title>
                    <Subtitle>Monitor user activity and session history</Subtitle>
                </HeaderSection>

                <TableContainer
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>Loading sessions...</p>
                    ) : sessions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>No session data found.</p>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>User</Th>
                                    <Th>Email</Th>
                                    <Th>Login Time</Th>
                                    <Th>Logout Time</Th>
                                    <Th>Status</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(session => {
                                    const isActive = !session.logoutTime;
                                    return (
                                        <tr key={session._id}>
                                            <Td>{session.userId?.username || session.username || "Unknown"}</Td>
                                            <Td>{session.userId?.email || "N/A"}</Td>
                                            <Td>{new Date(session.loginTime).toLocaleString()}</Td>
                                            <Td>{session.logoutTime ? new Date(session.logoutTime).toLocaleString() : "-"}</Td>
                                            <Td>
                                                <StatusBadge active={isActive}>
                                                    {isActive ? "Active" : "Logged Out"}
                                                </StatusBadge>
                                            </Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </TableContainer>
            </Content>
        </PageContainer>
    );
};

export default LoginSessionPage;