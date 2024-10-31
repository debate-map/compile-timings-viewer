import { create } from 'zustand'
import { BuildMetadata, BuildUnitsData, TrackerData } from './dataProvider'

interface AppState{
    trackerData : TrackerData,
    setTrackerData : (td : TrackerData) => void

    buildMetadatas : {[key: string]: BuildMetadata},
    addBuildMetadata : (bm : BuildMetadata[]) => void

    buildUnitsData : {[key: string]: BuildUnitsData[]},
    addBuildUnitsData : (timestamp : string, build_units : BuildUnitsData[]) => void
}

const useAppStore = create<AppState>()((set) => ({
    trackerData: [],
    setTrackerData: (td: TrackerData) => set(() => ({ trackerData: td })),

    buildMetadatas: {},
    addBuildMetadata: (bm: BuildMetadata[]) => set((state) => ({
        buildMetadatas: {
            ...state.buildMetadatas,
            ...Object.fromEntries(bm.map(metadata => [metadata.bf, metadata]))
        }
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
