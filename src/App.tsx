import { useEffect, useState} from 'react';
import { fetchBuildMetadata, fetchTrackerData } from './dataProvider';
import useAppStore from './store';
import MetadataBarGraph from './components/MetadataBarGraph';
import { Alert, Snackbar  } from '@mui/material';

const TRY_AGAIN_INTERVAL = 5000;

const App = () => {
    const setTrackerData = useAppStore((state) => state.setTrackerData);
    const trackerData = useAppStore((state) => state.trackerData);
    const addBuildMetadata = useAppStore((state) => state.addBuildMetadata);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        const fetchData = () => {
            fetchTrackerData().then((newTrackerData) => {
                setTrackerData(newTrackerData);
                Promise.all(newTrackerData.map(t => fetchBuildMetadata(t)))
                    .then(metadataArray => {
                        addBuildMetadata(metadataArray);
                        setSnackbarOpen(false);
                    });
            }).catch(() => {
                setSnackbarOpen(true);
                setTimeout(fetchData, TRY_AGAIN_INTERVAL);
            });
        };
        fetchData();
    }, [addBuildMetadata, setTrackerData]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
    <>
        <div style={{ height: '96vh', width: '99vw' }}>
          <MetadataBarGraph />
        </div>
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
            <Alert severity="error" onClose={handleSnackbarClose}>
               {`Error fetching data`}
            </Alert>
        </Snackbar>
        </>
    )
}

export default App
