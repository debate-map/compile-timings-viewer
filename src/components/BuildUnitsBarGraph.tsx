import {useEffect} from 'react';
import { Bar, BarChart, CartesianGrid, Cell,  Text, XAxis, YAxis } from 'recharts';
import useAppStore from '../store';
import { fetchBuildUnitsData } from '../dataProvider';

const BuildUnitsBarGraph = ({timestamp}: {timestamp : string}) => {
    const buildUnitsData = useAppStore((state) => state.buildUnitsData);
    const addBuildUnitsData = useAppStore((state) => state.addBuildUnitsData);

    useEffect(() => {
        if (buildUnitsData[timestamp] === undefined) {
            fetchBuildUnitsData(timestamp).then((buildUnitsData) => {
                addBuildUnitsData(timestamp, buildUnitsData);
            });
        }
    }, []);

    return (
        buildUnitsData[timestamp] &&
          <BarChart width={1800} height={40 * buildUnitsData[timestamp].length} data={buildUnitsData[timestamp]} layout={"vertical"} margin={{ top: 28, right: 30, left: 200, bottom: 5, }} >
            <CartesianGrid vertical={false} />
            <XAxis hide axisLine={false} type="number" />
            <YAxis yAxisId={0} orientation="left" dataKey={"u"} type="category" axisLine={false}/>
            <YAxis yAxisId={1} orientation="right" dataKey={"t"} type="category" axisLine={false} tickLine={false} tick={<Text x={200}/>}/>
            <Bar isAnimationActive={false} dataKey={"t"} minPointSize={2} barSize={32}>
                {buildUnitsData[timestamp].map((d, v) => {
                  return <Cell key={`cell-${v}`} fill="#82ca9d" />;
                })}
            </Bar>
        </BarChart>

    );
}

export default BuildUnitsBarGraph;
