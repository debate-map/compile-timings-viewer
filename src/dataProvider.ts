import { TIMINGS_FETCH_BASE } from "./store";

/**
 * An array of timestamps in the format "YYYYMMDDTHHMMSSZ".
 */
export type TrackerData = string[];
export type BuildMetadatas = {
    [timestamp: string]: BuildMetadata;
}

/** Represents metadata for a build process. **/
export type BuildMetadata = {
  /** Total build time in seconds */
  t: number;

  /** Version of the Rust compiler used */
  r: string;

  /** Number of compilation units */
  u: number;

  /** Build Unix timestamp */
  b: number;

  /** Corresponding Commit Hash */
  h : string

  /** Build time timestamp(formatted) */
  bf: string;

};

/** Represents data for individual build units. **/
export type BuildUnitsData = {
  /** Name of the compilation unit */
  u: string;

  /** Build time taken for this unit in seconds */
  t: number;
};

export const fetchTrackerData = async (): Promise<TrackerData> => {
  try {
      const resp = await fetch(`${TIMINGS_FETCH_BASE}/tracker.json`);
      const data = await resp.json();
      return data;
    } catch (error) {
      console.error('Error fetching tracker data:', error);
      throw error;
    }
};

/**
 * Fetches build metadata for a specific timestamp.
 */
export const fetchBuildMetadatas = async (): Promise<BuildMetadatas> => {
  try {
    const resp = await fetch(`${TIMINGS_FETCH_BASE}/build_metadatas.json`);
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error('Error fetching build metadata:', error);
    throw error;
  }
};

/**
 * Fetches build units for a specific timestamp.
 * @param {string} timestamp - The timestamp in the format "YYYYMMDDTHHMMSSZ".
 */
export const fetchBuildUnitsData = async (timestamp : string) : Promise<BuildUnitsData[]> => {
  try {
    const resp = await fetch(`${TIMINGS_FETCH_BASE}/build_units/units_${timestamp}.json`);
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error('Error fetching build metadata:', error);
    throw error;
  }
}
