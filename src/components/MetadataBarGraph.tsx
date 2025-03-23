import { memo, useEffect, useState } from "react";
import useAppStore from "../store";
import { ResponsiveBar } from "@nivo/bar";
import { Button, Menu, MenuItem} from "@mui/material";
import BuildUnitsBarGraph from "./BuildUnitsBarGraph";
import RawData from "./RawData";
import CenterCircularProgress from "./CenterCircularProgress";
import DiffBuildUnitsBarGraph from "./DiffBuildUnitsBarGraph";

const MemoizedBuildUnitsMetadata = memo(BuildUnitsBarGraph);
const MemoizedDiffBuildUnitsBarGraph = memo(DiffBuildUnitsBarGraph);

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

const CheckBoxDateTimeTick = ({ tick, showCheckBox }: { tick: TickProps , showCheckBox: boolean}) => {
    const { cboxTS, updateCboxA, updateCboxB } = useAppStore();
    const value = new Date(tick.value * 1000).toISOString().replace(/[-:]/g, '').replace('T', 'T').replace(/\.\d+Z/, 'Z');

    return <g transform={`translate(${tick.x},${tick.y + 16})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" style={{ fontSize: 18, fill: 'black' }} >
            {new Date(tick.value * 1000).toLocaleDateString('en-CA')}
        </text>
        <text x={0} y={20} dy={16} textAnchor="middle" style={{ fontSize: 18, fill: 'black' }} >
            {new Date(tick.value * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </text>
        {
            showCheckBox &&
                <>
                    <SVGCheckBox x={-25} y={42} size={20} checked={cboxTS.a === value}
                        onClick={() => {
                            if (cboxTS.a === value) {
                                updateCboxA(null);
                            } else {
                                updateCboxA(value);
                            }
                        }}
                    />
                    <SVGCheckBox x={5} y={42} size={20} checked={cboxTS.b === value}
                        onClick={() => {
                            if (cboxTS.b === value) {
                                updateCboxB(null);
                            } else {
                                updateCboxB(value);
                            }
                        }}
                    />
                </>
        }
    </g>
}

const CacheRefreshButton = () => {
    return (
        <div style={{ position: 'absolute', top: 0, right: 0, padding:"8px 8px 0px 0px", zIndex: 1, width:"100%", display:"flex", justifyContent:"end" }}>
            <Button variant="contained" color="error" style={{ textTransform: 'none', height: '36px', fontSize: '16px'}}
                onClick={() => {
                    const ts = new Date().getTime();
                    window.location.href = `${window.location.pathname}?t=${ts}`;
                }}
                title="Refresh the cache with millisecond UNIX timestamp as params to bypass cache">
                Cache Refresh
            </Button>
        </div>
    );
}

const ResizeBar = () => {
    const { setSplitRatio } = useAppStore();

    const handleMouseDown = () => {
        const initialHeight = window.innerHeight;

        const handleMouseMove = (e: MouseEvent) => {
            const rawRatio = (initialHeight - e.clientY) / initialHeight;
            setSplitRatio(Math.max(0.1, Math.min(0.9, rawRatio)));
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
    const cboxTS = useAppStore(state => state.cboxTS);
    const buildMetadatas =  useAppStore(state => state.buildMetadatas);
    const splitRatio = useAppStore(state => state.splitRatio);
    const setSplitRatio = useAppStore(state => state.setSplitRatio);
    const showTopRegion = useAppStore(state => state.showTopRegion);
    const showBottomRegion = useAppStore(state => state.showBottomRegion);
    const displayTopRegion = useAppStore(state => state.displayTopRegion);
    const displayBottomRegion = useAppStore(state => state.displayBottomRegion);

    const buildMds = Object.entries(buildMetadatas).map(([key, metadata]) => {
      return { ...metadata, bf:  key };
    });
    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showTopRegion, showBottomRegion]);

    const handleContextMenu = (e: React.MouseEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY });
        }
    };

    const handleContextMenuClose = () => {
        setContextMenu(null);
    };

    const handleResetSplit = () => {
        setSplitRatio(0.7);
        displayTopRegion(true);
        displayBottomRegion(true);
        setContextMenu(null);
    }

    const handleDisplayTopRegion = (display: boolean) => {
        displayTopRegion(display);
        setContextMenu(null);
    }

    const handleDisplayBottomRegion = (display: boolean) => {
        displayBottomRegion(display);
        setContextMenu(null);
    }

   return (
        buildMds.length === 0 ? <CenterCircularProgress /> :
      <>
      <CacheRefreshButton />
      <div style={{height:'98vh', overflowY:"clip"}} onContextMenu={handleContextMenu}>
            {contextMenu && (
                <Menu
                    id="positioned-menu"
                    aria-labelledby="positioned-button"
                    anchorReference="anchorPosition"
                    anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
                    open={Boolean(contextMenu)}
                    onClose={handleContextMenuClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem onClick={() => handleDisplayTopRegion(false)} disabled={!showTopRegion || !showBottomRegion}>Hide Upper Region</MenuItem>
                    <MenuItem onClick={() => handleDisplayTopRegion(true)} disabled={showTopRegion}>Show Upper Region</MenuItem>
                    <MenuItem onClick={() => handleDisplayBottomRegion(false)} disabled={!showBottomRegion || !showTopRegion}>Hide Lower Region</MenuItem>
                    <MenuItem onClick={() => handleDisplayBottomRegion(true)} disabled={showBottomRegion}>Show Lower Region</MenuItem>
                    <MenuItem onClick={handleResetSplit}>Reset Split</MenuItem>
                </Menu>
            )}
        { showTopRegion &&
            <ResponsiveBar
                theme={buildMetadataBarTheme}
                data={buildMds}
                animate = {false}
                keys={[ 't' ]}
                indexBy="b"
                margin={{ top: 35, right: 25, bottom: !showBottomRegion ? 100 : (windowHeight * splitRatio + 100) , left: 100 }}
                padding={0.2}
                valueScale={{ type: 'linear'}}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'paired'}}
                axisBottom={{
                    tickSize: 16,
                    legendPosition: 'middle',
                    legendOffset: 90,
                    truncateTickAt: 20,
                    renderTick: (tick) => (<CheckBoxDateTimeTick tick={tick} showCheckBox={showBottomRegion}/>)
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
        }
        {
            showBottomRegion &&
            <div style={{position: "relative", bottom: showTopRegion ? (windowHeight * splitRatio): 0}}>
                {(showTopRegion && showBottomRegion) && <ResizeBar />}
                <div style={{
                    maxHeight: showTopRegion ? (windowHeight * splitRatio) : windowHeight,
                    position: 'relative',
                    height: showTopRegion ? (windowHeight * splitRatio): windowHeight,
                    overflowY: "auto"
                }}>
                    {cboxTS.a || cboxTS.b ? (
                        <div style={{height: "100%"}}>
                            {(() => {
                                const a = cboxTS.a;
                                const b = cboxTS.b;

                                if (a && !b) {
                                    return <MemoizedBuildUnitsMetadata timestamp={a} />;
                                } else if (a && b && a !== b) {
                                    return <MemoizedDiffBuildUnitsBarGraph basisTs={a} competitorTs={b} />;
                                } else if (a && b && (a === b)) {
                                    return <RawData timestamp={a} hash={buildMds[buildMds.findIndex(m => m.bf === b)].h} />;
                                }

                            })()}
                        </div>
                    ) : (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '24px',
                            textAlign: 'center'
                        }}>
                            No compilation unit selected from the bar graph
                        </div>
                    )}
                </div>
            </div>
        }
      </div>
    </>
   );
}

export default MetadataBarGraph;
