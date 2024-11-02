import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import useAppStore, { DMAP_COMMITS_BASE } from '../store';
import { fetchBuildUnitsData } from '../dataProvider';
import { Tooltip } from '@mui/material';
import CenterCircularProgress from './CenterCircularProgress';
import moment from 'moment'

const BuildUnitsBarGraph = ({timestamp}: {timestamp : string}) => {
    const buildUnitsData = useAppStore((state) => state.buildUnitsData);
    const buildMetadatas = useAppStore((state) => state.buildMetadatas);
    const addBuildUnitsData = useAppStore((state) => state.addBuildUnitsData);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        if (buildUnitsData[timestamp] === undefined) {
            fetchBuildUnitsData(timestamp).then((buildUnitsData) => {
                addBuildUnitsData(timestamp, buildUnitsData);
            });
        }

        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        buildUnitsData[timestamp] ?
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0px 0px 0px 24px' }}>
                    <div>
                        <p>Total Build Time: <strong>{buildMetadatas[timestamp].t}s</strong></p>
                        <p>Rust Compiler Version: <strong>{buildMetadatas[timestamp].r}</strong></p>
                        <p>Number of Compilation Units: <strong>{buildMetadatas[timestamp].u}</strong></p>
                        <p>Compilation Date: <strong>{new Date(Number(buildMetadatas[timestamp].b) * 1000).toLocaleString("sv")} ({moment(Number(buildMetadatas[timestamp].b) * 1000).fromNow()})</strong></p>
                        <p>Commit Hash: <a href={`${DMAP_COMMITS_BASE}/${buildMetadatas[timestamp].h}`} target="_blank" style={{ cursor: 'pointer' }}>{buildMetadatas[timestamp].h}</a></p>
                    </div>

                </div>
          <BarChart width={width} height={56 * buildUnitsData[timestamp].length} data={buildUnitsData[timestamp]} layout={"vertical"} margin={{  right: 20, left: 160, bottom: 5, }} >
            <CartesianGrid vertical={false} />
            <XAxis hide axisLine={false} type="number" />
            <YAxis yAxisId={0} orientation="left" dataKey={"u"} type="category" axisLine={false}
                    tick={(props) => {
                        const { x, y, payload } = props;
                        return (
                            <Tooltip title={payload.value} placement="right" enterDelay={0} leaveDelay={0}>
                                <text x={x} y={y} dy={4} textAnchor="end" fill="#666" fontSize="16">
                                    {payload.value.length > 25 ? (
                                        <>
                                            <tspan x={x} dy="-0.6">
                                                {payload.value.substring(0, payload.value.lastIndexOf(' ', 25))}
                                            </tspan>
                                            <tspan x={x} dy="1.2em">
                                                {payload.value.substring(payload.value.lastIndexOf(' ', 25) + 1)}
                                            </tspan>
                                        </>
                                    ) : payload.value}
                                </text>
                            </Tooltip>
                        );
                    }}
            />
            <YAxis yAxisId={1} orientation="right" dataKey={"t"} type="category" axisLine={false} tickLine={false}
                tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                        <text x={x} y={y} dy={4} textAnchor="start" fill="#666" fontSize="16">
                            {`${payload.value}s`}
                        </text>
                    );
                }}
            />
            <Bar isAnimationActive={false} dataKey={"t"} minPointSize={2} barSize={32}>
                {buildUnitsData[timestamp].map((d, v) => {
                  return <Cell key={`cell-${v}`} fill="#82ca9d" />;
                })}
            </Bar>
          </BarChart>
          </> : <CenterCircularProgress/>

    );
}

export default BuildUnitsBarGraph;
