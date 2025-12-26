import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserChatbox from "./components/UserChatbox";
import AdminChatbox from "./components/AdminChatbox";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/user-chat" element={<UserChatbox />} />
        <Route path="/admin-chat" element={<AdminChatbox />} />
      </Routes>
    </Router>
  );
}

export default App;
