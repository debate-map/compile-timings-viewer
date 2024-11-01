import { useEffect, useState} from 'react';
import { fetchBuildMetadatas, fetchTrackerData } from './dataProvider';
import useAppStore from './store';
import MetadataBarGraph from './components/MetadataBarGraph';
import { Alert, Snackbar  } from '@mui/material';

const TRY_AGAIN_INTERVAL = 5000;

const App = () => {
    const setTrackerData = useAppStore((state) => state.setTrackerData);
    const setBuildMetadatas = useAppStore((state) => state.setBuildMetadatas);

    const trackerData = useAppStore((state) => state.trackerData);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setTrackerData(await fetchTrackerData());
                setBuildMetadatas(await fetchBuildMetadatas());
                setSnackbarOpen(false);
            } catch (error) {
                setSnackbarOpen(true);
            }
        };
        fetchData();
    }, [setBuildMetadatas, setTrackerData]);

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
