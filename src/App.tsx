import { useEffect, useState} from 'react';
import { fetchBuildMetadatas, fetchTrackerData } from './dataProvider';
import useAppStore from './store';
import MetadataBarGraph from './components/MetadataBarGraph';
import { Alert, Snackbar  } from '@mui/material';

const App = () => {
    const setTrackerData = useAppStore((state) => state.setTrackerData);
    const setBuildMetadatas = useAppStore((state) => state.setBuildMetadatas);
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
    }, []);

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
               {`Error fetching data, try to refresh the page.`}
            </Alert>
        </Snackbar>
        </>
    )
}

export default App
