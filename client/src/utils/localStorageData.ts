import { FileData, Picture, Video, Audio } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';


export type MediaType = "videos" | "audios" | "pictures" | "files";

export const TAB_OPTIONS: MediaType[] = ["videos", "audios", "pictures", "files"];

// Define default empty data
export const DEFAULT_DATA: MySpaceData = {
  videos: [],
  audios: [],
  pictures: [],
  files: [],
};
// Define data type interface
export interface MySpaceData {
  videos : Video[];
  audios:  Audio[];
  pictures: Picture[];
  files: FileData[];
}

// Storage key name
const STORAGE_KEY = "myspace-data";

// Get data from localStorage
export const getMySpaceData = (): MySpaceData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Return empty arrays if no data exists
      return {
        videos: [],
        audios: [],
        pictures: [],
        files: [],
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting MySpace data:", error);
    return {
      videos: [],
      audios: [],
      pictures: [],
      files: [],
    };
  }
};

// Save data to localStorage
export const setMySpaceData = (data: MySpaceData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error setting MySpace data:", error);
  }
};

// Update data for a specific type
export const updateMySpaceData = (type:MediaType, items: Video[] | Audio[] | Picture[] | FileData[]): void => {
  try {
    const currentData = getMySpaceData();
    currentData[type] = items;
    setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error updating ${type} data:`, error);
  }
};

// Add a single item to a specific type with UUID
export const addMySpaceItemAutoType = (item: Video | Audio | Picture | FileData): void => {
  try {
    const currentData = getMySpaceData();
    const itemWithUuid = {
      ...item,
      id: parseInt(uuidv4().replace(/-/g, '').slice(0, 8), 16),
      uuid: uuidv4()
    };
    if (item.type?.startsWith('video')) {
      currentData.videos.push(itemWithUuid);
    } else if (item.type?.startsWith('audio')) {
      currentData.audios.push(itemWithUuid);
    } else if (item.type?.startsWith('image')) {
        currentData.pictures.push(itemWithUuid);
    } else {
      currentData.files.push(itemWithUuid);
    }

    setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error adding ${type} item:`, error);
  }
};

// Add a single item to a specific type with UUID
export const addMySpaceItem = (type: keyof typeof DEFAULT_DATA, item: Video | Audio | Picture | FileData): void => {
  try {
    const currentData = getMySpaceData();
    const itemWithUuid = {
      ...item,
      id: parseInt(uuidv4().replace(/-/g, '').slice(0, 8), 16),
      uuid: uuidv4()
    };
    currentData[type] = [...currentData[type], itemWithUuid];
    setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error adding ${type} item:`, error);
  }
};

// Remove a single item from a specific type by UUID
export const removeMySpaceItem = (type: keyof typeof DEFAULT_DATA, itemId: number ): void => {
  try {
    const currentData = getMySpaceData();
    currentData[type] = currentData[type].filter(item => item.id === itemId);
    setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error removing ${type} item:`, error);
  }
};

// Get data of a specific type
export const getMySpaceDataByType = (type: keyof typeof DEFAULT_DATA): Video[] | Audio[] | Picture[] | FileData[] => {
  try {
    const data = getMySpaceData();
    return data[type];
  } catch (error) {
    console.error(`Error getting ${type} data:`, error);
    return [];
  }
};

// Clear all MySpace data
export const clearAllMySpaceData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    setMySpaceData({
      videos: [],
      audios: [],
      pictures: [],
      files: [],
    });
  } catch (error) {
    console.error("Error clearing MySpace data:", error);
  }
}; 