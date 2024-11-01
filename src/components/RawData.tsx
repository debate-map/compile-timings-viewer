import { useState } from "react";
import CenterCircularProgress from "./CenterCircularProgress";
import { RAW_HTML_BASE } from "../store";

const RawData = ({ timestamp, hash }: { timestamp: string; hash: string }) => {
    const [loading, setLoading] = useState(true);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && (
                <CenterCircularProgress />
            )}
            <iframe
                src={`${RAW_HTML_BASE}/cargo-timing-${timestamp}_${hash}.html`}
                style={{
                    width: '100%',
                    height: 'calc(100% - 100px)',
                    border: 'none',
                    display: loading ? 'none' : 'block'
                }}
                onLoad={() => setLoading(false)}
            ></iframe>
        </div>
    );
};

export default RawData;
