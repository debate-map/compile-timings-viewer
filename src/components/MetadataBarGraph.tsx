import { forwardRef, useState } from "react";
import useAppStore from "../store";
import { ResponsiveBar } from "@nivo/bar";
import { Button, Dialog, FormControl, IconButton, MenuItem, Select, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import BuildUnitsBarGraph from "./BuildUnitsBarGraph";
import { ArrowBack, ArrowForward, Close } from "@mui/icons-material";
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

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const DateTimeTick = ({ tick }: { tick: TickProps }) => (
    <g transform={`translate(${tick.x},${tick.y + 16})`}>Nearly
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

const MetadataBarGraph = () => {
   const buildMetadatas = Object.values(useAppStore((state) => state.buildMetadatas));
   const [dialogTimestamp, setDialogTimestamp] = useState<string | null>(null);
   const [selectDisplay, setSelectDisplay] = useState<number>(1);

   return (
        buildMetadatas.length === 0 ? <CenterCircularProgress /> :
      <>
      <ResponsiveBar
          theme={buildMetadataBarTheme}
          data={buildMetadatas}
          animate = {false}
          keys={[ 't' ]}
          indexBy="b"
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
              renderTick: (tick) => <DateTimeTick tick={tick} />
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
          onClick={(datum) => setDialogTimestamp(datum.data.bf)}
          role="application"
          ariaLabel="Compile Time Graph"
      />
      <Dialog
        fullScreen
        open={dialogTimestamp !== null}
        onClose={() => {
            setDialogTimestamp(null)
            setSelectDisplay(1)
        }}
        TransitionComponent={Transition}
      >
        {dialogTimestamp && (
            <div style={{width: '100%', height: '100%', position: 'relative'}}>
                <div style={{
                    position: 'absolute',
                    height: '60px',
                    top: 8,
                    right: 24,
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <select
                        id="displaySelect"
                        value={selectDisplay}
                        onChange={(event) => setSelectDisplay(Number(event.target.value))}
                        style={{
                            padding: '5px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: '#fff',
                            marginRight: '8px'
                        }}
                    >
                        <option value={1}>Compilation Units time</option>
                        <option value={2}>Compilation Units time difference</option>
                        <option value={3}>Raw Data</option>
                    </select>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => setDialogTimestamp(null)}
                        aria-label="close"
                    >
                        <Close />
                    </IconButton>
                </div>
                <div style={{width: "100%", textAlign: "center", fontSize:36, fontWeight: 600, paddingTop:"12px"}}>
                    {selectDisplay === 1 ? "Compilation Units time" : selectDisplay === 2 ? "Compilation Units time difference" : "Raw Data"}
                </div>
                <div style={{paddingTop:"16px", height: "100%"}}>
                {selectDisplay === 1 ? (
                        <BuildUnitsBarGraph timestamp={dialogTimestamp} />
                    ) : selectDisplay === 2 ? (
                        <DiffBuildUnitsBarGraph
                            basisTimestamp={dialogTimestamp}
                            competitorTimestamp={buildMetadatas?.[buildMetadatas.findIndex(m => m.bf === dialogTimestamp) - 1]?.bf || null}
                        />
                    ) : (
                        <RawData timestamp={dialogTimestamp} />
                    )
                }
                </div>
            </div>
        )}
      </Dialog>
    </>
   );
}

export default MetadataBarGraph;
