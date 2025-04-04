import { FileData, Picture, Video, Audio } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { openDB, DBSchema } from 'idb';

export type MediaType = "videos" | "audios" | "pictures" | "files" | "sharelinks";

export const TAB_OPTIONS: MediaType[] = ["videos", "audios", "pictures", "files", "sharelinks"];

// Define default empty data
export const DEFAULT_DATA: MySpaceData = {
  videos: [],
  audios: [],
  pictures: [],
  files: [],
  sharelinks: [],
};

// Define data type interface
export interface MySpaceData {
  videos: Video[];
  audios: Audio[];
  pictures: Picture[];
  files: FileData[];
  sharelinks: ShareLink[];
}

export interface ShareLink {
  id?: string;
  name?: string;
  url: string;
  isMySpace: boolean;
  type: string;
  title?: string;
  description?: string;  
  createdAt?: string;
  uuid: string;
}


// Define database schema
interface MySpaceDBSchema extends DBSchema {
  myspace: {
    key: string;
    value: MySpaceData;
  };
}

const DB_NAME = 'myspace-db';
const STORE_NAME = 'myspace';
const DB_VERSION = 2;

// Initialize IndexedDB
const initDB = async () => {
  try {
    const db = await openDB<MySpaceDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          console.log("Creating object store:", STORE_NAME);
          db.createObjectStore(STORE_NAME);
        }
      },
    });
    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
//check if  url include in  sharelinks
//  const params = new URLSearchParams(window.location.search);
 // onst jsonParam = params.get("json");
export const getShareLinkList = async () => {
  const params = new URLSearchParams(window.location.search);
  const jsonParam = params.get("json") || "no json";
    const sharelinks = (await getMySpaceDataByType(
      "sharelinks"
    )) as ShareLink[];
    const sharelinkList = sharelinks?.filter((sharelink) => {
      const sharelinkUrl = sharelink.url?.split("share?json=")[0]; 
      const jsonParamWithoutShareLink = sharelink.url?.replace(
        sharelinkUrl + "share?json=",
        ""
      );
      return jsonParamWithoutShareLink === jsonParam;
    });
    return sharelinkList||[];
  
};

// Get data from IndexedDB
export const getMySpaceData = async (): Promise<MySpaceData> => {
  try {
    const db = await initDB();
    const data = await db.get(STORE_NAME, 'data');
    console.log("Retrieved data from IDB:", data);
    if (!data) {
      console.log("No data found, returning default data");
      await setMySpaceData(DEFAULT_DATA); // 初始化默认数据
      return DEFAULT_DATA;
    }
    return data;
  } catch (error) {
    console.error("Error getting MySpace data:", error);
    return DEFAULT_DATA;
  }
};

// Save data to IndexedDB
export const setMySpaceData = async (data: MySpaceData): Promise<void> => {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, data, 'data');
  } catch (error) {
    console.error("Error setting MySpace data:", error);
  }
};

// Update data for a specific type
export const updateMySpaceData = async (type: MediaType, items: Video[] | Audio[] | Picture[] | FileData[] | ShareLink[]): Promise<void> => {
  try {
    const currentData = await getMySpaceData();

    if (type === "sharelinks") {
      currentData.sharelinks = items as ShareLink[];
    } else {
      currentData[type] = items as Video[] | Audio[] | Picture[] | FileData[];
    }
    await setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error updating ${type} data:`, error);
  }
};

// Add a single item to a specific type with UUID
export const addMySpaceItemAutoType = async (item: Video | Audio | Picture | FileData | ShareLink): Promise<void> => {
  try {
    const currentData = await getMySpaceData();
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
    } else if (item.type?.startsWith('sharelink')) {
      currentData.sharelinks.push(itemWithUuid);
    } else {
      currentData.files.push(itemWithUuid);
    }

    await setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error adding item:`, error);
  }
};

// Add a single item to a specific type with UUID
export const addMySpaceItem = async (type: keyof typeof DEFAULT_DATA, item: Video | Audio | Picture | FileData | ShareLink): Promise<void> => {
  try {
    const currentData = await getMySpaceData();
    const itemWithUuid = {
      ...item,
      id: parseInt(uuidv4().replace(/-/g, '').slice(0, 8), 16),
      uuid: uuidv4()
    };
    if (type === "sharelinks") {    
      currentData.sharelinks.push(itemWithUuid as ShareLink);
    } else {
      currentData[type] = [...currentData[type], itemWithUuid as Video | Audio | Picture | FileData];
    }
    await setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error adding ${type} item:`, error);
  }
};

// Remove a single item from a specific type by UUID
export const removeMySpaceItem = async (type: keyof typeof DEFAULT_DATA, itemId: number): Promise<void> => {
  try {
    const currentData = await getMySpaceData();
    if (type === "sharelinks") {
      currentData.sharelinks = currentData.sharelinks.filter(item => item.id !== itemId);
    } else {
      currentData[type] = currentData[type].filter(item => item.id !== itemId);
    }
    await setMySpaceData(currentData);
  } catch (error) {
    console.error(`Error removing ${type} item:`, error);
  }
};

// Get data of a specific type
export const getMySpaceDataByType = async (type: keyof typeof DEFAULT_DATA): Promise<Video[] | Audio[] | Picture[] | FileData[] | ShareLink[]> => {
  try {
    const data = await getMySpaceData();
    return data[type] as Video[] | Audio[] | Picture[] | FileData[] | ShareLink[];
  } catch (error) {
    console.error(`Error getting ${type} data:`, error);
    return [];
  }
};

// Clear all MySpace data
export const clearAllMySpaceData = async (): Promise<void> => {
  try {
    const db = await initDB();
    await db.clear(STORE_NAME);
    await setMySpaceData(DEFAULT_DATA);
  } catch (error) {
    console.error("Error clearing MySpace data:", error);
  }
}; 