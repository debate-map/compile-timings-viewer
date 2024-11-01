import { create } from 'zustand'
import { BuildMetadata, BuildMetadatas, BuildUnitsData, TrackerData } from './dataProvider'

// TODO: For now, it's hardcoded for dev purpose
export const DMAP_COMMITS_BASE = "https://github.com/debate-map/app/commit"
export const RAW_HTML_BASE = "https://debate-map.github.io/compile-timings/timings/raw_html"

interface AppState{
    trackerData : TrackerData,
    setTrackerData : (td : TrackerData) => void

    buildMetadatas : {[key: string]: BuildMetadata},
    setBuildMetadatas : (bm : BuildMetadatas) => void

    buildUnitsData : {[key: string]: BuildUnitsData[]},
    addBuildUnitsData : (timestamp : string, build_units : BuildUnitsData[]) => void
}

const useAppStore = create<AppState>()((set) => ({
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
