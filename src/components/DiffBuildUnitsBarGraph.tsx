import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import useAppStore from '../store';
import { BuildUnitsData, fetchBuildUnitsData } from '../dataProvider';
import { Tooltip } from '@mui/material';
import CenterCircularProgress from './CenterCircularProgress';

type DifferenceUnitData = {
    unit: string,
    difference: number,

    // empty means it's in competitor
    // NA means it's not in competitor
    inCompetitor: string
}

const DiffBuildUnitsBarGraph = ({basisTimestamp, competitorTimestamp}: {basisTimestamp : string, competitorTimestamp: string | null}) => {
    const buildUnitsData = useAppStore((state) => state.buildUnitsData);
    const trackerData = useAppStore((state) => state.trackerData);
    const buildMetadatas = Object.values(useAppStore((state) => state.buildMetadatas));
    const addBuildUnitsData = useAppStore((state) => state.addBuildUnitsData);

    const [width, setWidth] = useState(window.innerWidth);
    const [selectCompetitor, setSelectCompetitor] = useState<string | null>(competitorTimestamp);
    const [differenceData, setDifferenceData] = useState<DifferenceUnitData[]>();

    useEffect(() => {
        const fetchUnits = async () => {
            if (buildUnitsData[basisTimestamp] === undefined) {
                const data = await fetchBuildUnitsData(basisTimestamp);
                addBuildUnitsData(basisTimestamp, data);
            }

            let baseUnitsMap = new Map<string, number>();
            if (buildUnitsData[basisTimestamp]) {
                const unitMap = new Map<string, { count: number, totalTime: number }>();
                buildUnitsData[basisTimestamp].forEach(item => {
                    const existingUnit = unitMap.get(item.u) || { count: 0, totalTime: 0 };
                    unitMap.set(item.u, {
                        count: existingUnit.count + 1,
                        totalTime: existingUnit.totalTime + item.t
                    });
                });

                const newBuildUnitsData: BuildUnitsData[] = Array.from(unitMap).map(([key, value]) => ({
                    u: value.count > 1 ? `${value.count}x ${key}` : key,
                    t: value.totalTime
                }));

                baseUnitsMap = new Map(newBuildUnitsData.map(item => [item.u, item.t]));
            }

            let competitorUnitsMap = new Map<string, number>();
            if (selectCompetitor){
                let competitorUnitsData : BuildUnitsData[];
                if (buildUnitsData[selectCompetitor] === undefined) {
                    competitorUnitsData = await fetchBuildUnitsData(selectCompetitor);
                    addBuildUnitsData(selectCompetitor, competitorUnitsData);
                }else{
                    competitorUnitsData = buildUnitsData[selectCompetitor];
                }

                if (competitorUnitsData) {
                    const unitMap = competitorUnitsData.reduce((map, item) => {
                        const existingUnit = map.get(item.u) || { count: 0, totalTime: 0 };
                        map.set(item.u, {
                            count: existingUnit.count + 1,
                            totalTime: existingUnit.totalTime + item.t
                        });
                        return map;
                    }, new Map<string, { count: number, totalTime: number }>());

                    const newBuildUnitsData: BuildUnitsData[] = Array.from(unitMap).map(([key, value]) => ({
                        u: value.count > 1 ? `${value.count}x ${key}` : key,
                        t: value.totalTime
                    }));

                    competitorUnitsMap = new Map(newBuildUnitsData.map(item => [item.u, item.t]));
                }
            }
            console.log(competitorUnitsMap)

            const compiledUnitsMap = new Map<string, { difference: number, inCompetitor: string }>();

            baseUnitsMap.forEach((value, key) => {
                const competitorValue = competitorUnitsMap.get(key);
                if (competitorValue){
                    compiledUnitsMap.set(key, {
                        difference: value - competitorValue,
                        inCompetitor: ""
                    });
                }else{
                    compiledUnitsMap.set(key, {
                        difference: baseUnitsMap.get(key)!,
                        inCompetitor: "NA"
                    });
                }
            });

            const differenceData = Array.from(compiledUnitsMap).map(([unit, data]) => ({
                unit,
                difference: data.difference,
                inCompetitor: data.inCompetitor
            }));
            differenceData.sort((a, b) => a.difference - b.difference);
            setDifferenceData(differenceData);
        }
        fetchUnits();
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectCompetitor]);

    return (buildUnitsData[basisTimestamp] && selectCompetitor && buildUnitsData[selectCompetitor])  ?
            <>
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', padding: '0px 0px 0px 24px' }}>
                <div>
                    <h2>Base</h2>
                    <p>Total Build Time: <strong>{buildMetadatas.find(b => b.bf === basisTimestamp)?.t}s</strong></p>
                    <p>Rust Compiler Version: <strong>{buildMetadatas.find(b => b.bf === basisTimestamp)?.r}</strong></p>
                    <p>Number of Compilation Units: <strong>{buildMetadatas.find(b => b.bf === basisTimestamp)?.u}</strong></p>
                    <p>Compilation Date: <strong>{new Date(Number(buildMetadatas.find(b => b.bf === basisTimestamp)?.b) * 1000).toLocaleString()}</strong></p>
                </div>
                <div style={{display:"flex", justifyContent: "space-between"}}>
                    <div>
                        <h2>Competitor</h2>
                        <p>Total Build Time: <strong>{buildMetadatas.find(b => b.bf === selectCompetitor)?.t}s</strong></p>
                        <p>Rust Compiler Version: <strong>{buildMetadatas.find(b => b.bf === selectCompetitor)?.r}</strong></p>
                        <p>Number of Compilation Units: <strong>{buildMetadatas.find(b => b.bf === selectCompetitor)?.u}</strong></p>
                        <p>Compilation Date: <strong>{new Date(Number(buildMetadatas.find(b => b.bf === selectCompetitor)?.b) * 1000).toLocaleString()}</strong></p>
                    </div>
                    <div style={{alignSelf : "end", paddingBottom : "16px", paddingRight : "18px"}}>
                        <select
                            id="displaySelect"
                            value={selectCompetitor!}
                            onChange={(event) => setSelectCompetitor(String(event.target.value))}
                            style={{
                                padding: '5px',
                                fontSize: '16px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                marginRight: '8px'
                            }}
                        >
                            {
                                trackerData.filter(v => v !== basisTimestamp)
                                .map((v) => {
                                    return <option key={v} value={v}>{v}</option>
                                })
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
                  {differenceData?.slice().reverse().map((d, v) => {
                    return <Cell key={`cell-${v}`} fill={d.difference > 0 ? "#82ca9d" : "#ff7f7f"} />;
                  })}
              </Bar>
            </BarChart>
          </> : <CenterCircularProgress/>
}

export default DiffBuildUnitsBarGraph;
