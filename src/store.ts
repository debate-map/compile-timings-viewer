import { create } from 'zustand'
import { BuildMetadata, BuildMetadatas, BuildUnitsData, TrackerData } from './dataProvider'

export const DMAP_COMMITS_BASE = "https://github.com/debate-map/app/commit"
export const RAW_HTML_BASE = "https://debate-map.github.io/compile-timings/timings/raw_html"
export const TIMINGS_FETCH_BASE = "https://debate-map.github.io/compile-timings/timings"

type MaybeString = string | null | undefined

interface AppState{
    // a and b are the timestamps for two different builds comparison
    cboxTS: {a: MaybeString, b: MaybeString},
    updateCboxA: (timestamp: MaybeString) => void,
    updateCboxB: (timestamp: MaybeString) => void,

    // btw we can't hide both regions i.e when the top one is hidden
    // then the bottom one must be shown
    showTopRegion: boolean,
    displayTopRegion: (display: boolean) => void,
    showBottomRegion: boolean,
    displayBottomRegion: (display: boolean) => void,
    splitRatio: number,
    setSplitRatio: (ratio: number) => void,

    trackerData : TrackerData,
    setTrackerData : (td : TrackerData) => void

    buildMetadatas : {[key: string]: BuildMetadata},
    setBuildMetadatas : (bm : BuildMetadatas) => void

    buildUnitsData : {[key: string]: BuildUnitsData[]},
    addBuildUnitsData : (timestamp : string, build_units : BuildUnitsData[]) => void

    // timstamp of the base information
    basisTimestamp : string | null,
    setBasisTimestamp : (timestamp : string) => void

    // timestamp of the information against which we are making comparison
    competitorTs : string | null,
    setCompetitorTs : (timestamp : string) => void
}

const useAppStore = create<AppState>()((set) => ({
    cboxTS: (() => {
        const basisTs = localStorage.getItem("basisTs");
        const competitorTs = localStorage.getItem("competitorTs");
        return {a: basisTs, b: competitorTs};
    })(),
    updateCboxA: (timestamp: MaybeString) => {
        if (timestamp) {
            localStorage.setItem("basisTs", timestamp);
        } else {
            localStorage.removeItem("basisTs");
        }
        set((state) => ({ cboxTS: {...state.cboxTS, a: timestamp} }))
    },
    updateCboxB: (timestamp: MaybeString) => {
        if (timestamp) {
            localStorage.setItem("competitorTs", timestamp);
        } else {
            localStorage.removeItem("competitorTs");
        }
        set((state) => ({ cboxTS: {...state.cboxTS, b: timestamp} }))
    },

    splitRatio: (() => {
        const stored = localStorage.getItem("splitRatio");
        return stored ? parseFloat(stored) : 0.7
    })(),
    showBottomRegion: (() => {
        const stored = localStorage.getItem("showBottomRegion");
        return stored ? JSON.parse(stored) : true
    })(),
    showTopRegion: (() => {
        const stored = localStorage.getItem("showTopRegion");
        return stored ? JSON.parse(stored) : true
    })(),
    setSplitRatio: (ratio: number) => {
        localStorage.setItem("splitRatio", JSON.stringify(ratio));
        set(() => ({ splitRatio: ratio }));
    },
    displayTopRegion: (display: boolean) => {
        set((state) => {
            if (!display && !state.showBottomRegion) {
                return state;
            }
            return { showTopRegion: display };
        });
        localStorage.setItem("showTopRegion", JSON.stringify(display));
    },
    displayBottomRegion: (display: boolean) => {
        set((state) => {
            if (!display && !state.showTopRegion) {
                return state;
            }
            return { showBottomRegion: display };
        });
    },

    basisTimestamp: (() => {
       return localStorage.getItem("basisTs");
    })(),
    setBasisTimestamp: (timestamp: string) => {
        localStorage.setItem("basisTimestamp", timestamp);
        set(() => ({ basisTimestamp: timestamp }));
    },

    competitorTs: (() => {
        return localStorage.getItem("competitorTs");
    })(),
    setCompetitorTs: (timestamp: string) => {
        localStorage.setItem("competitorTs", timestamp);
        set(() => ({ competitorTs: timestamp }));
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
