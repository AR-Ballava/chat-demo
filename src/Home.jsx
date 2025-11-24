import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {

    const navigate = useNavigate();
    const link = "https://archat-omega.vercel.app/";

    const [showToast, setShowToast] = useState(false);
    const [copied, setCopied] = useState(false);

    const clickHandler = () => {
        navigator.clipboard.writeText(link);
        setShowToast(true);
        setCopied(true)

        setTimeout(() => setShowToast(false), 5000);
    };

    return (
        <>

                <div className="main-box container">
                    <div className="class-box"> <h1>WELCOME YOU TO REAL TIME-CHAT ROOM</h1></div>
                    <div className="home-box">
                        <button onClick={() => navigate("/chat")} className="btn-box btn btn-warning ">JOIN CHAT</button>
                        <button onClick={clickHandler} className="btn-box btn btn-warning "> {copied ? "Link Copied ✓" : "COPY LINK"}</button>

                    </div>
                </div>

                {/* Toast UI */}
                {showToast && (
            <div className="toast-box">
            Link Copied!
            </div>
        )}          


        </>
    );
};

export default Home;
