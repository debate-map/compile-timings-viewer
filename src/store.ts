import { create } from 'zustand'
import { BuildMetadata, BuildMetadatas, BuildUnitsData, TrackerData } from './dataProvider'

// TODO: For now, it's hardcoded for dev purpose
export const DMAP_COMMITS_BASE = "https://github.com/debate-map/app/commit"
export const RAW_HTML_BASE = "https://debate-map.github.io/compile-timings/timings/raw_html"
export const TIMINGS_FETCH_BASE = "https://debate-map.github.io/compile-timings/timings"

type MaybeString = string | null | undefined

interface AppState{
    checkBoxTimestamps: {checkboxA: MaybeString, checkboxB: MaybeString},
    updateCheckBoxATimestamp: (timestamp: MaybeString) => void,
    updateCheckBoxBTimestamp: (timestamp: MaybeString) => void,

    splitRatio: number,
    setSplitRatio: (ratio: number) => void,

    trackerData : TrackerData,
    setTrackerData : (td : TrackerData) => void

    buildMetadatas : {[key: string]: BuildMetadata},
    setBuildMetadatas : (bm : BuildMetadatas) => void

    buildUnitsData : {[key: string]: BuildUnitsData[]},
    addBuildUnitsData : (timestamp : string, build_units : BuildUnitsData[]) => void

    basisTimestamp : string | null,
    setBasisTimestamp : (timestamp : string) => void
}

const useAppStore = create<AppState>()((set) => ({
    checkBoxTimestamps: {checkboxA: null, checkboxB: null},
    updateCheckBoxATimestamp: (timestamp: MaybeString) => {
        set((state) => ({ checkBoxTimestamps: {...state.checkBoxTimestamps, checkboxA: timestamp,} }))
    },
    updateCheckBoxBTimestamp: (timestamp: MaybeString) => {
        set((state) => ({ checkBoxTimestamps: {...state.checkBoxTimestamps, checkboxB: timestamp,} }))
    },

    splitRatio: (() => {
        const stored = localStorage.getItem("splitRatio");
        return stored ? parseFloat(stored) : 0.5
    })(),
    setSplitRatio: (ratio: number) => {
        localStorage.setItem("splitRatio", JSON.stringify(ratio));
        set(() => ({ splitRatio: ratio }));
    },

    basisTimestamp: (() => {
       return localStorage.getItem("basisTimestamp");
    })(),
    setBasisTimestamp: (timestamp: string) => {
        localStorage.setItem("basisTimestamp", timestamp);
        set(() => ({ basisTimestamp: timestamp }));
    },

    trackerData: [],
    setTrackerData: (td: TrackerData) => set(() => ({ trackerData: td })),

    buildMetadatas: {},
    setBuildMetadatas: (bm: BuildMetadatas) => set(() => ({
        buildMetadatas: bm
    })),

    buildUnitsData: {},
    addBuildUnitsData: (timestamp: string, build_units: BuildUnitsData[]) => set((state) => ({
        buildUnitsData: {
            ...state.buildUnitsData,
            [timestamp]: build_units
        }
    }))
}))

export default useAppStore
