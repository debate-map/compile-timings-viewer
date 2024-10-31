import { CircularProgress } from "@mui/material";
import { useState } from "react";
import CenterCircularProgress from "./CenterCircularProgress";

const RawData = ({ timestamp }) => {
    const [loading, setLoading] = useState(true);
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && (
                <CenterCircularProgress />
            )}
            <iframe
                src={`https://debate-map.github.io/compile-timings/timings/raw_html/cargo-timing-${timestamp}.html`}
                style={{
                    width: '100vw',
                    height: 'calc(100% - 100px)',
                    border: 'none',
                    overflowX: 'auto',
                    display: loading ? 'none' : 'block'
                }}
                onLoad={() => setLoading(false)}
            ></iframe>
        </div>
    );
};

export default RawData;
