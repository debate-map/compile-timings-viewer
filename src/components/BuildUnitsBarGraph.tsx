import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Text, XAxis, YAxis } from 'recharts';
import useAppStore from '../store';
import { fetchBuildUnitsData } from '../dataProvider';
import { Tooltip } from '@mui/material';

const BuildUnitsBarGraph = ({timestamp}: {timestamp : string}) => {
    const buildUnitsData = useAppStore((state) => state.buildUnitsData);
    const buildMetadatas = Object.values(useAppStore((state) => state.buildMetadatas));

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
        buildUnitsData[timestamp] &&
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0px 0px 0px 24px' }}>
                    <div>
                        <p>Total Build Time: <strong>{buildMetadatas.find(b => b.bf === timestamp)?.t}s</strong></p>
                        <p>Rust Compiler Version: <strong>{buildMetadatas.find(b => b.bf === timestamp)?.r}</strong></p>
                        <p>Number of Compilation Units: <strong>{buildMetadatas.find(b => b.bf === timestamp)?.u}</strong></p>
                    </div>

                </div>
          <BarChart width={width} height={45 * buildUnitsData[timestamp].length} data={buildUnitsData[timestamp]} layout={"vertical"} margin={{  right: 20, left: 80, bottom: 5, }} >
            <CartesianGrid vertical={false} />
            <XAxis hide axisLine={false} type="number" />
            <YAxis yAxisId={0} orientation="left" dataKey={"u"} type="category" axisLine={false}
                    tick={(props) => {
                        const { x, y, payload } = props;
                        return (
                            <Tooltip title={payload.value} placement="right" enterDelay={0} leaveDelay={0}>
                                <text x={x} y={y} dy={4} textAnchor="end" fill="#666" fontSize="16">
                                    {payload.value.length > 15 ? `${payload.value.substring(0, 10)}...` : payload.value}
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
          </>

    );
}

export default BuildUnitsBarGraph;
