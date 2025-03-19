import { memo, useEffect, useState } from "react";
import useAppStore from "../store";
import { ResponsiveBar } from "@nivo/bar";
import { Button} from "@mui/material";
import BuildUnitsBarGraph from "./BuildUnitsBarGraph";
import RawData from "./RawData";
import CenterCircularProgress from "./CenterCircularProgress";
import DiffBuildUnitsBarGraph from "./DiffBuildUnitsBarGraph";

interface TickProps {
  x: number;
  y: number;
  value: number;
}

const buildMetadataBarTheme = {
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

const SVGCheckBox = ({ x, y, size, checked, onClick }: { x: number, y: number, size: number, checked: boolean, onClick: () => void }) => {
    return (
        <svg
            x={x}
            y={y}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <rect
                x="1"
                y="1"
                width="22"
                height="22"
                rx="4"
                fill="white"
                stroke="#000"
                strokeWidth="2"
            />
            {checked && (
                <path
                    d="M5 13L9 17L19 7"
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );

}

const CheckBoxDateTimeTick = ({ tick }: { tick: TickProps }) => {
    const { checkBoxTimestamps, updateCheckBoxATimestamp, updateCheckBoxBTimestamp } = useAppStore();
    const value = new Date(tick.value * 1000).toISOString().replace(/[-:]/g, '').replace('T', 'T').replace(/\.\d+Z/, 'Z');

    return <g transform={`translate(${tick.x},${tick.y + 16})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" style={{ fontSize: 18, fill: 'black' }} >
            {new Date(tick.value * 1000).toLocaleDateString('en-CA')}
        </text>
        <text x={0} y={20} dy={16} textAnchor="middle" style={{ fontSize: 18, fill: 'black' }} >
            {new Date(tick.value * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </text>
        <SVGCheckBox x={-25} y={42} size={20} checked={checkBoxTimestamps.checkboxA === value}
            onClick={() => {
                if (checkBoxTimestamps.checkboxA === value) {
                    updateCheckBoxATimestamp(null);
                } else {
                    updateCheckBoxATimestamp(value);
                }
            }}
        />
        <SVGCheckBox x={5} y={42} size={20} checked={checkBoxTimestamps.checkboxB === value}
            onClick={() => {
                if (checkBoxTimestamps.checkboxB === value) {
                    updateCheckBoxBTimestamp(null);
                } else {
                    updateCheckBoxBTimestamp(value);
                }
            }}
        />
    </g>
}

const CacheRefreshButton = () => {
    return (
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1 }}>
            <Button
                variant="contained"
                color="error"
                style={{ textTransform: 'none', height: '30px', fontSize: '12px' }}
                onClick={() => {
                    const timestamp = new Date().getTime();
                    window.location.href = `${window.location.pathname}?t=${timestamp}`;
                }}
                title="Refresh the cache with milli second nonce params in url to bypass cache"
            >
                Cache Refresh
            </Button>
        </div>
    );
}

const MemoizedBuildUnitsBarGraph = memo(BuildUnitsBarGraph);
const ResizeBar = () => {
    const { setSplitRatio } = useAppStore();

    const handleMouseDown = () => {
        const initialHeight = window.innerHeight;

        const handleMouseMove = (e: MouseEvent) => {
            const rawRatio = (initialHeight - e.clientY) / initialHeight;
            setSplitRatio(Math.max(0.1, Math.min(0.8, rawRatio)));
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <div
            style={{
                width: "100%",
                height: "8px",
                cursor: "ns-resize",
                backgroundColor: "#ddd",
                borderTop: "1px solid #aaa",
                borderBottom: "1px solid #aaa",
                userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
        />
    );
};

const MetadataBarGraph = () => {
   const { checkBoxTimestamps, buildMetadatas,splitRatio } = useAppStore();
   const buildMds = Object.entries(buildMetadatas).map(([key, metadata]) => {
     return { ...metadata, bf:  key };
   });
   const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);

   useEffect(() => {
       const handleResize = () => setWindowHeight(window.innerHeight);

       window.addEventListener('resize', handleResize);
       return () => window.removeEventListener('resize', handleResize);
   }, []);

   return (
        buildMds.length === 0 ? <CenterCircularProgress /> :
      <>
      <CacheRefreshButton />
      <div style={{height:'98vh', overflowY:"clip"}}>
        <ResponsiveBar
            theme={buildMetadataBarTheme}
            data={buildMds}
            animate = {false}
            keys={[ 't' ]}
            indexBy="b"
            margin={{ top: 35, right: 25, bottom: windowHeight * splitRatio + 100 , left: 100 }}
            padding={0.2}
            valueScale={{ type: 'linear'}}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'paired'}}
            axisBottom={{
                tickSize: 16,
                legendPosition: 'middle',
                legendOffset: 90,
                truncateTickAt: 20,
                renderTick: (tick) => (<CheckBoxDateTimeTick tick={tick} />)
            }}
            axisLeft={{
                tickSize: 0,
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
        <div style={{position: "relative", bottom: windowHeight * splitRatio}} >
            <ResizeBar />
            <div style={{maxHeight: windowHeight * splitRatio, position: 'relative', height: windowHeight * splitRatio, overflowY:"auto"}}>
                {
                    checkBoxTimestamps.checkboxA ?
                        (
                            <div style={{height: "100%"}}>
                                {
                                    (() => {
                                        const a = checkBoxTimestamps.checkboxA;
                                        const b = checkBoxTimestamps.checkboxB;

                                        if (a && !b) {
                                                return <MemoizedBuildUnitsBarGraph timestamp={a} />;
                                        }else if(a && b && a !== b){
                                                return <DiffBuildUnitsBarGraph basisTimestamp={a} competitorTimestamp={b} />
                                        }else if (a && b && a === b){
                                                return <RawData timestamp={a} hash={buildMds[buildMds.findIndex(m => m.bf === b)].h} />;
                                        }
                                     })()
                                }
                        </div>) : (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px', textAlign: 'center' }}>No any compilation unit selected from the bar graph above</div>)
                }
            </div>
        </div>
      </div>
    </>
   );
}

export default MetadataBarGraph;
