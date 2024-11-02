import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import useAppStore, { DMAP_COMMITS_BASE } from '../store';
import { BuildUnitsData, fetchBuildUnitsData } from '../dataProvider';
import { Tooltip } from '@mui/material';
import CenterCircularProgress from './CenterCircularProgress';
import moment from 'moment';

type DifferenceUnitData = {
    unit: string,
    difference: number,
    inCompetitor: string
}

const DiffBuildUnitsBarGraph = ({basisTimestamp, competitorTimestamp}: {basisTimestamp : string, competitorTimestamp: string}) => {
    const { buildUnitsData, trackerData, buildMetadatas, addBuildUnitsData } = useAppStore();
    const [width, setWidth] = useState(window.innerWidth);
    const [selectCompetitor, setSelectCompetitor] = useState<string>(competitorTimestamp);
    const [differenceData, setDifferenceData] = useState<DifferenceUnitData[]>();

    const processUnitsData = (data: BuildUnitsData[]): Map<string, number> => {
        const unitMap = data.reduce((map, item) => {
            const existingUnit = map.get(item.u) || { count: 0, totalTime: 0 };
            map.set(item.u, {
                count: existingUnit.count + 1,
                totalTime: existingUnit.totalTime + item.t
            });
            return map;
        }, new Map<string, { count: number, totalTime: number }>());

        return new Map(Array.from(unitMap).map(([key, value]) => [
            value.count > 1 ? `${value.count}x ${key}` : key,
            value.totalTime
        ]));
    };

    useEffect(() => {
        const fetchUnits = async () => {
            if (!buildUnitsData[basisTimestamp]) {
                const data = await fetchBuildUnitsData(basisTimestamp);
                addBuildUnitsData(basisTimestamp, data);
            }

            if (!buildUnitsData[selectCompetitor]) {
                const data = await fetchBuildUnitsData(selectCompetitor);
                addBuildUnitsData(selectCompetitor, data);
            }

            const baseUnitsMap = processUnitsData(buildUnitsData[basisTimestamp] || []);
            const competitorUnitsMap = processUnitsData(buildUnitsData[selectCompetitor] || []);

            const compiledUnitsMap = new Map<string, { difference: number, inCompetitor: string }>();
            baseUnitsMap.forEach((value, key) => {
                const competitorValue = competitorUnitsMap.get(key);
                compiledUnitsMap.set(key, {
                    difference: competitorValue ? value - competitorValue : value,
                    inCompetitor: competitorValue ? "" : "NA"
                });
            });

            const newDifferenceData = Array.from(compiledUnitsMap).map(([unit, data]) => ({
                unit,
                difference: data.difference,
                inCompetitor: data.inCompetitor
            }));
            newDifferenceData.sort((a, b) => a.difference - b.difference);
            setDifferenceData(newDifferenceData);
        };

        fetchUnits();
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectCompetitor]);

    const renderMetadata = (timestamp: string) => (
        <>
            <p>Total Build Time: <strong>{buildMetadatas[timestamp].t}s</strong></p>
            <p>Rust Compiler Version: <strong>{buildMetadatas[timestamp].r}</strong></p>
            <p>Number of Compilation Units: <strong>{buildMetadatas[timestamp].u}</strong></p>
            <p>Compilation Date: <strong>{new Date(Number(buildMetadatas[timestamp].b) * 1000).toLocaleString("sv")} ({moment(Number(buildMetadatas[timestamp].b) * 1000).fromNow()})</strong></p>
            <p>Commit Hash: <a href={`${DMAP_COMMITS_BASE}/${buildMetadatas[timestamp].h}`} target="_blank" style={{ cursor: 'pointer' }}>{buildMetadatas[timestamp].h}</a></p>
        </>
    );

    if (!buildUnitsData[basisTimestamp] || !buildUnitsData[selectCompetitor]) {
        return <CenterCircularProgress />;
    }

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', padding: '0px 0px 0px 24px' }}>
                <div>
                    <h2>Base</h2>
                    {renderMetadata(basisTimestamp)}
                </div>
                <div style={{display:"flex", justifyContent: "space-between"}}>
                    <div>
                        <h2>Competitor</h2>
                        {renderMetadata(selectCompetitor)}
                    </div>
                    <div style={{alignSelf : "end", paddingBottom : "16px", paddingRight : "18px"}}>
                        <select
                            id="displaySelect"
                            value={selectCompetitor}
                            onChange={(event) => setSelectCompetitor(event.target.value)}
                            style={{
                                padding: '5px',
                                fontSize: '16px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                marginRight: '8px'
                            }}
                        >
                            {trackerData
                                .filter(v => v !== basisTimestamp)
                                .map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
            </div>
            <BarChart
              width={width}
              height={45 * buildUnitsData[basisTimestamp].length}
              data={differenceData?.slice().reverse()}
              layout={"vertical"}
              margin={{ right: 20, left: 100, bottom: 5 }}>
              <XAxis hide axisLine={false} type="number" />
              <YAxis yAxisId={0} orientation="left" dataKey={"unit"} type="category" axisLine={false}
                      tick={(props) => {
                          const { x, y, payload } = props;
                          return (
                              <Tooltip title={payload.value} placement="right" enterDelay={0} leaveDelay={0}>
                                  <text x={x} y={y} dy={4} textAnchor="end" fill="#666" fontSize="16">
                                      {payload.value.length > 18 ? `${payload.value.substring(0, 15)}...` : payload.value}
                                  </text>
                              </Tooltip>
                          );
                      }}
              />
              <YAxis yAxisId={1} orientation="right" dataKey={"difference"} type="category" axisLine={false} tickLine={false}
                  tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                          <text x={x} y={y} dy={4} textAnchor="start" fill="#666" fontSize="16">
                              {`${Number(payload.value).toFixed(1)}s`}
                          </text>
                      );
                  }}
              />
              <YAxis yAxisId={2} orientation="right" dataKey={"inCompetitor"} type="category" axisLine={false} tickLine={false}
                  tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                          <text x={x} y={y} dy={4} textAnchor="start" fill="#666" fontSize="16">
                              {payload.value}
                          </text>
                      );
                  }}
              />
              <Bar isAnimationActive={false} dataKey={"difference"} minPointSize={1} barSize={32}>
                  {differenceData?.slice().reverse().map((d, v) => (
                    <Cell key={`cell-${v}`} fill={d.difference > 0 ? "#82ca9d" : "#ff7f7f"} />
                  ))}
              </Bar>
            </BarChart>
        </>
    );
}

export default DiffBuildUnitsBarGraph;
