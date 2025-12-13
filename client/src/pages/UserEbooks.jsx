import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Ebooks.css";

const UserEbooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/ebooks`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEbooks(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ebooks:", error);
        setIsLoading(false);
      });
  }, [API_BASE_URL]);

  const filteredEbooks = ebooks.filter(ebook =>
    ebook.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (pdfLink) => {
    console.log("Attempting to View link:", pdfLink);

    if (!pdfLink || !pdfLink.startsWith('http')) {
      alert("Error: PDF link is invalid or missing. Please contact administration.");
      return;
    }
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfLink)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  const handleDownload = (pdfLink, title) => {
    console.log("Attempting to Download link:", pdfLink);

    if (!pdfLink || !pdfLink.startsWith('http')) {
      alert("Error: PDF link is invalid or missing. Please contact administration.");
      return;
    }

    const link = document.createElement("a");
    link.href = pdfLink;
    link.download = `${title}.pdf`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="user-container"><h1 className="user-heading">Loading EBooks...</h1></div>
        <Footer />
      </>
    );
  }

  if (ebooks.length === 0) {
    return (
      <>
        <Navbar />
        <div className="user-container">
          <h1 className="user-heading">Trading EBooks Library</h1>
          <p>No ebooks available at this time. Please check back later or contact admin.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="user-container">
        <h1 className="user-heading">Trading EBooks Library</h1>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search ebooks..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ebook-list">
          {filteredEbooks.map((ebook) => (
            <div key={ebook._id} className="user-ebook-card">
              <img src={ebook.thumbnail} alt={ebook.title} className="ebook-img" />
              <h2>{ebook.title}</h2>
              <div className="button-container">
                <button className="view-btn" onClick={() => handleView(ebook.pdf)}>
                  <i className="bi bi-eye"></i> View
                </button>
                <button className="download-btn" onClick={() => handleDownload(ebook.pdf, ebook.title)}>
                  <i className="bi bi-download"></i> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserEbooks;