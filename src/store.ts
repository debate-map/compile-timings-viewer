import { create } from 'zustand'
import { BuildMetadata, BuildUnitsData, TrackerData } from './dataProvider'

interface AppState{
    trackerData : TrackerData,
    setTrackerData : (td : TrackerData) => void

    buildMetadatas : Set<BuildMetadata>,
    addBuildMetadata : (bm : BuildMetadata[]) => void

    buildUnitsData : {[key: string]: BuildUnitsData[]},
    addBuildUnitsData : (timestamp : string, build_units : BuildUnitsData[]) => void
}

const useAppStore = create<AppState>()((set) => ({
    trackerData: [],
    setTrackerData: (td: TrackerData) => set(() => ({ trackerData: td })),

    buildMetadatas: new Set<BuildMetadata>(),
    addBuildMetadata: (bm: BuildMetadata[]) => set((state) => ({ buildMetadatas: new Set([...state.buildMetadatas, ...bm]) })),

    buildUnitsData: {},
    addBuildUnitsData: (timestamp: string, build_units: BuildUnitsData[]) => set((state) => {
        const newBuildUnitsData = { ...state.buildUnitsData };
        newBuildUnitsData[timestamp] = build_units;
        return { buildUnitsData: newBuildUnitsData };
    })
}))

export default useAppStore
