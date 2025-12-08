import { useEffect } from 'react';

const useLoadCss = (fileName) => {
    useEffect(() => {
        // Construct the full URL relative to the public folder (e.g., /auth-style.css)
        const cssUrl = `${process.env.PUBLIC_URL}/${fileName}`;
        
        // Check if the stylesheet is already present to prevent duplicates
        if (document.querySelector(`link[href="${cssUrl}"]`)) {
            return;
        }

        // Create the new link element
        const link = document.createElement('link');
        link.href = cssUrl;
        link.rel = 'stylesheet';
        link.type = 'text/css';

        // Append the link to the document head
        document.head.appendChild(link);

        // Cleanup function to remove the link when the component unmounts (optional, but good practice)
        return () => {
            // document.head.removeChild(link);
        };
    }, [fileName]);
};

export default useLoadCss;