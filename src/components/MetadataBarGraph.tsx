import { forwardRef, useState } from "react";
import useAppStore from "../store";
import { ResponsiveBar } from "@nivo/bar";
import { Button, Dialog, FormControl, MenuItem, Select, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import BuildUnitsBarGraph from "./BuildUnitsBarGraph";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

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

   return <>
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
        onClose={() => setDialogTimestamp(null)}
        TransitionComponent={Transition}
      >
        {dialogTimestamp && (
            <div style={{width: '100%', height: '100%', position: 'relative'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                    <div>
                        <p>Total Build Time: <strong>{buildMetadatas.find(b => b.bf === dialogTimestamp)?.t}s</strong></p>
                        <p>Rust Compiler Version: <strong>{buildMetadatas.find(b => b.bf === dialogTimestamp)?.r}</strong></p>
                        <p>Number of Compilation Units: <strong>{buildMetadatas.find(b => b.bf === dialogTimestamp)?.u}</strong></p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <select
                                id="displaySelect"
                                value={selectDisplay}
                                onChange={(event) => setSelectDisplay(Number(event.target.value))}
                                style={{
                                    padding: '5px',
                                    fontSize: '16px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <option value={1}>Compilation Units time</option>
                                <option value={2}>Compilation Units time difference</option>
                                <option value={3}>Raw Data</option>
                            </select>
                        </div>

                    </div>
                </div>
                {
                    selectDisplay === 1 ? (
                        <BuildUnitsBarGraph timestamp={dialogTimestamp} />
                    ) : selectDisplay === 2 ? (
                        <div></div>
                        //<BuildUnitsBarGraph timestamp={dialogTimestamp} diff={true} />
                    ) : (
                        <iframe
                            src={`https://debate-map.github.io/compile-timings/timings/raw_html/cargo-timing-${dialogTimestamp}.html`}
                            style={{width: '100vw', height: 'calc(100% - 100px)', border: 'none', overflowX: 'auto'}}
                        ></iframe>
                    )
                }

            </div>
        )}
      </Dialog>
  </>
}

export default MetadataBarGraph;
