import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Ebooks.css";
// Using Admin.css for the back button style
import "../styles/Admin.css";

const AdminEbooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [pdfLink, setPdfLink] = useState(""); // GitHub Raw Link
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/ebooks`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setEbooks(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ebooks list:", error);
        setIsLoading(false);
      });
  }, [API_BASE_URL]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!token) {
      alert("Authentication required for upload.");
      return;
    }

    if (!title || !thumbnailUrl || !pdfLink) {
      alert("All fields are required! (Title, Thumbnail URL, and PDF Raw Link)");
      return;
    }

    const dataToSend = {
      title,
      thumbnail: thumbnailUrl,
      pdf: pdfLink
    };

    try {
      const response = await fetch(`${API_BASE_URL}/ebooks/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const data = await response.json();
        setEbooks(prevEbooks => [...prevEbooks, data.ebook]);
        setTitle("");
        setThumbnailUrl("");
        setPdfLink("");
        alert("Ebook uploaded successfully!");
      } else {
        const errorData = await response.json().catch(() => ({ msg: "Unknown error" }));
        alert(`Failed to upload ebook: ${errorData.msg || response.statusText}. Please ensure your backend server is running.`);
      }
    } catch (error) {
      console.error("Error uploading ebook:", error);
      alert("Error uploading ebook. Check network connection or backend server status.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ebook?")) {
      const token = getToken();
      if (!token) {
        alert("Authentication required for deletion.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/ebooks/${id}`, {
          method: "DELETE",
          headers: {
            "x-auth-token": token,
          },
        });

        if (response.ok) {
          setEbooks(ebooks.filter((ebook) => ebook._id !== id));
          alert("Ebook deleted successfully!");
        } else {
          alert("Failed to delete ebook.");
        }
      } catch (error) {
        console.error("Error deleting ebook:", error);
        alert("Error deleting ebook.");
      }
    }
  };

  return (
    <div className="admin-container">
      {/* Navigation Helper since Global Nav is removed */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'left', paddingBottom: '20px' }}>
        <Link to="/admin" className="back-btn">
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </Link>
      </div>

      <h1 className="admin-heading">Manage Ebooks</h1>

      <form className="upload-section" onSubmit={handleUpload} style={{ width: '500px', maxWidth: '90%' }}>
        <h3 style={{ marginBottom: '20px', color: '#0adfaa' }}>Upload New Ebook</h3>
        <input
          type="text"
          placeholder="Ebook Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Thumbnail Image URL"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="PDF GitHub Raw Link (e.g., https://raw.githubusercontent.com/...)"
          value={pdfLink}
          onChange={(e) => setPdfLink(e.target.value)}
          required
        />

        <button type="submit" className="upload-btn">
          <i className="bi bi-cloud-upload-fill"></i> Upload Ebook Link
        </button>
      </form>

      <h2 style={{ margin: '40px 0 20px', color: '#fff' }}>Ebook List ({ebooks.length} total)</h2>
      {isLoading && <p>Loading list...</p>}

      {ebooks.length > 0 ? (
        <div className="ebook-list">
          {ebooks.map((ebook) => (
            <div key={ebook._id} className="admin-ebook-card">
              <img src={ebook.thumbnail} alt={ebook.title} className="ebook-img" />
              <h2>{ebook.title}</h2>
              <button className="delete-btn" onClick={() => handleDelete(ebook._id)}>
                <i className="bi bi-trash-fill"></i> Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && <p>No ebooks found. Use the form above to upload the first one.</p>
      )}
    </div>
  );
};

export default AdminEbooks;