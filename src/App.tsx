import { BarDatum, ResponsiveBar } from '@nivo/bar'
import {useState, useEffect} from 'react';
import { BuildMetadata, fetchBuildMetadata, fetchTrackerData } from './dataProvider';

type BarGraphBuildMetadata = {
    compile_date: number;
    time_taken: number;
}

interface TickProps {
  x: number;
  y: number;
  value: number;
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
    },
    labels: {
        text :{
          fontSize: 18
       }
    }
};

const DateTimeTickComponent = ({ tick }: { tick: TickProps }) => (
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

const BarGraph = <T extends BarDatum>({data} : {data: T[]}) => (
    <ResponsiveBar
        theme={theme}
        data={data}
        keys={[ 'time_taken' ]}
        indexBy="compile_date"
        margin={{ top: 50, right: 25, bottom: 100, left: 100 }}
        padding={0.2}
        valueScale={{ type: 'linear'}}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'paired'}}
        axisBottom={{
            tickSize: 16,
            legend: 'Compilation Date & Time',
            legendPosition: 'middle',
            legendOffset: 90,
            truncateTickAt: 20,
            renderTick: (tick) => <DateTimeTickComponent tick={tick} />
        }}
        axisLeft={{
            tickSize: 8,
            tickPadding: 8,
            legend: 'Time Taken(in seconds)',
            legendPosition: 'middle',
            legendOffset: -80,
            truncateTickAt: 12,
        }}
        label={(datum) => {
            return `${datum.value}s`
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        tooltipLabel={(_) => "Time Taken" }
        role="application"
        ariaLabel="Compile Time Graph"
    />
)

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

export default App
