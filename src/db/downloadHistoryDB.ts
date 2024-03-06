import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';

import DownloadHistoryItem from '../interface/DownloadHistoryItem';

// const databaseName = 'downloadHistory';
const tableName = 'musicInfo';

enablePromise(true);

export const downloadHistory_OpenDB = async () => {
  const db = openDatabase({ name: 'downloadHistory.db', location: 'default'} , () => {
    // console.log(" downloadHistory_OpenDB success! ");
  }, () => {
    // console.log(" downloadHistory_OpenDB error! ");
    return undefined;
  });
  return db;
};

export const downloadHistory_createTable = async (db: SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}
  (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    bvid TEXT NOT NULL UNIQUE,
    part TEXT NOT NULL,
    cid TEXT NOT NULL UNIQUE
  );`;
  try {
    await db.executeSql(query);
  } catch (err) {
    console.log(err);
  };
};

export const downloadHistory_getAllDownloadHistory = async (db: SQLiteDatabase) => {
  try {
    const DownloadHistoryItems: DownloadHistoryItem[] = [];
    const results = await db.executeSql(`SELECT * FROM ${tableName}`);
    results.forEach((result) => {
      for (let index = 0; index < result.rows.length; index++) {
        DownloadHistoryItems.push(result.rows.item(index))
      }
    });
    return DownloadHistoryItems;
  } catch (error) {
    console.error(error);
  }
  return [];
};

export const downloadHistory_addDownloadHistory = async (db: SQLiteDatabase, item: DownloadHistoryItem) => {
  try {
    const insertQuery =
      `INSERT OR REPLACE INTO ${tableName} (title, bvid, part, cid) values (?, ?, ?, ?);`
    return db.executeSql(insertQuery, [item.title, item.bvid, item.part, item.cid]);
  } catch (error) {
    console.error(error);
  }
  return [] as DownloadHistoryItem[];
};

export const downloadHistory_deleteTable = async (db: SQLiteDatabase) => {
  const query = `DROP table ${tableName}`;

  await db.executeSql(query);
};

export const downloadHistory_cleanTable = async (db: SQLiteDatabase) => {
  const query = `DELETE from ${tableName}; DELETE FROM sqlite_sequence WHERE name = ${tableName};`;

  await db.executeSql(query);
};
