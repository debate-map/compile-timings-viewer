import React from 'react';
import { CircularProgress } from '@mui/material';

const CenterCircularProgress: React.FC = () => {
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }}>
            <CircularProgress disableShrink />
        </div>
    );
};

export default CenterCircularProgress;
