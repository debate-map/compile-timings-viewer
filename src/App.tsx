import { BarDatum, ResponsiveBar } from '@nivo/bar'
import {useState, useEffect} from 'react';
import { BuildMetadata, fetchBuildMetadata, fetchTrackerData } from './dataProvider';

type BarGraphBuildMetadata = {
    compile_date: number;
    time_taken: number;
}

const App = () => {
    const [buildMetadata, setBuildMetadata] = useState<BarGraphBuildMetadata[]>([]);

    useEffect(() => {
        fetchTrackerData().then((trackerData) => {
            Promise.all(trackerData.map(t => fetchBuildMetadata(t)))
                .then(metadataArray => {
                   setBuildMetadata(metadataArray.map((metadata: BuildMetadata) => {
                        return {
                            compile_date: metadata.b,
                            time_taken: metadata.t
                        }
                    }))
                });
        });
    }, []);

    return <>
        <div style={{ height: '96vh', width: '99vw' }}>
          <BarGraph data={buildMetadata}/>
        </div>
    </>
}

const theme = {
   axis : {
    ticks: {
         text: {
           fontSize: 18
         }
       },
    legend: {
         text: {
           fontSize: 24
         }
       }
    }
};
const BarGraph = <T extends BarDatum>({data} : {data: T[]}) => (
    //textStyle?: Partial<React.CSSProperties>
    <ResponsiveBar
        theme={theme}
        data={data}

        keys={[
            'time_taken'
        ]}
        indexBy="compile_date"
        margin={{ top: 50, right: 50, bottom: 100, left: 100 }}
        padding={0.1}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: '#38bcb2',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: '#eed312',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 16,
            legend: 'Compilation Date & Time',
            legendPosition: 'middle',
            legendOffset: 90,
            truncateTickAt: 20,
            renderTick: (tick) => {
                return (
                    <g transform={`translate(${tick.x},${tick.y + 16})`}>
                        <text
                            x={0}
                            y={0}
                            dy={16}
                            textAnchor="middle"
                            style={{
                                fontSize: 18,
                                fill: 'black'
                            }}
                        >
                            {new Date(tick.value * 1000).toLocaleDateString('en-CA')}
                        </text>
                        <text
                            x={0}
                            y={20}
                            dy={16}
                            textAnchor="middle"
                            style={{
                                fontSize: 18,
                                fill: 'black'
                            }}
                        >
                            {new Date(tick.value * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </text>
                    </g>
                )
            }
        }}
        axisLeft={{
            tickSize: 8,
            tickPadding: 8,
            legend: 'Time Taken(in seconds)',
            legendPosition: 'middle',
            legendOffset: -80,
            truncateTickAt: 12,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        //labelTextColor={{
            //from: 'color',
            //modifiers: [
                //[
                    //'darker',
                   //5
                //]
            //]
        //}}
        role="application"
        ariaLabel="Compile Time Graph"
    />
)
export default App
