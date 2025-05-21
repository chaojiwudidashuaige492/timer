// IndexedDB 数据持久化管理

// 数据库配置
const DB_NAME = 'studyTimerDB';
const DB_VERSION = 1;
const STORES = {
  RECORDS: 'studyRecords',
  TAGS: 'tags',
  SETTINGS: 'settings'
};

// 打开数据库连接
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("数据库打开失败:", event.target.error);
      reject("数据库打开失败");
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建记录仓库
      if (!db.objectStoreNames.contains(STORES.RECORDS)) {
        const recordsStore = db.createObjectStore(STORES.RECORDS, { keyPath: 'id', autoIncrement: true });
        recordsStore.createIndex('date', 'date', { unique: false });
        recordsStore.createIndex('tag', 'tag', { unique: false });
      }
      
      // 创建标签仓库
      if (!db.objectStoreNames.contains(STORES.TAGS)) {
        const tagsStore = db.createObjectStore(STORES.TAGS, { keyPath: 'name' });
      }
      
      // 创建设置仓库
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        const settingsStore = db.createObjectStore(STORES.SETTINGS, { keyPath: 'name' });
      }
    };
  });
}

// 添加或更新标签
async function saveTags(tags) {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.TAGS, 'readwrite');
  const store = transaction.objectStore(STORES.TAGS);
  
  // 清除所有现有标签
  store.clear();
  
  // 添加新标签
  for (const tag of tags) {
    store.add({ name: tag });
  }
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = (event) => {
      console.error("保存标签失败:", event.target.error);
      reject(event.target.error);
    };
  });
}

// 获取所有标签
async function loadTags() {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.TAGS, 'readonly');
  const store = transaction.objectStore(STORES.TAGS);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const tags = event.target.result.map(tag => tag.name);
      // 如果没有标签，提供默认值
      if (tags.length === 0) {
        resolve(["Java", "操作系统", "数据结构", "算法"]);
      } else {
        resolve(tags);
      }
    };
    
    request.onerror = (event) => {
      console.error("加载标签失败:", event.target.error);
      reject(event.target.error);
    };
  });
}

// 保存学习记录
async function saveRecord(tag, duration) {
  console.log(`保存记录: 标签=${tag}, 时长=${duration}秒`);
  if (!tag) {
    console.error("无法保存记录：标签为空");
    throw new Error("标签不能为空");
  }
  
  const date = formatDate(new Date());
  const time = new Date().toTimeString().slice(0, 5);
  
  const record = {
    date,
    tag,
    duration,
    time
  };
  
  console.log("开始打开数据库...");
  try {
    const db = await openDatabase();
    console.log("数据库打开成功");
    
    console.log("创建事务...");
    const transaction = db.transaction(STORES.RECORDS, 'readwrite');
    const store = transaction.objectStore(STORES.RECORDS);
    
  console.log("添加记录到存储...");
    return new Promise((resolve, reject) => {
      const request = store.add(record);
      
      request.onsuccess = () => {
        console.log("记录添加成功");
        resolve(true);
      };
      request.onerror = (event) => {
        console.error("保存记录失败:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("保存记录过程中出错:", error);
    throw error;
  }
}

// 获取指定日期的记录
async function getRecordsByDate(date) {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.RECORDS, 'readonly');
  const store = transaction.objectStore(STORES.RECORDS);
  const index = store.index('date');
  const request = index.getAll(date);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      resolve(event.target.result || []);
    };
    
    request.onerror = (event) => {
      console.error("获取记录失败:", event.target.error);
      reject(event.target.error);
    };
  });
}

// 获取所有记录日期
async function getAllRecordDates() {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.RECORDS, 'readonly');
  const store = transaction.objectStore(STORES.RECORDS);
  const index = store.index('date');
  const request = index.openKeyCursor();
  
  const dates = new Set();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        dates.add(cursor.key);
        cursor.continue();
      } else {
        resolve([...dates].sort());
      }
    };
    
    request.onerror = (event) => {
      console.error("获取日期失败:", event.target.error);
      reject(event.target.error);
    };
  });
}

// 保存设置
async function saveSetting(name, value) {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
  const store = transaction.objectStore(STORES.SETTINGS);
  
  return new Promise((resolve, reject) => {
    const request = store.put({ name, value });
    
    request.onsuccess = () => resolve(true);
    request.onerror = (event) => {
      console.error("保存设置失败:", event.target.error);
      reject(event.target.error);
    };
  });
}

// 获取设置
async function getSetting(name) {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.SETTINGS, 'readonly');
  const store = transaction.objectStore(STORES.SETTINGS);
  const request = store.get(name);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const setting = event.target.result;
      resolve(setting ? setting.value : null);
    };
    
    request.onerror = (event) => {
      console.error("获取设置失败:", event.target.error);
      reject(event.target.error);
    };
  });
}

// 获取所有记录
async function getAllRecords() {
  const db = await openDatabase();
  const transaction = db.transaction(STORES.RECORDS, 'readonly');
  const store = transaction.objectStore(STORES.RECORDS);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      resolve(event.target.result || []);
    };
    
    request.onerror = (event) => {
      console.error("获取所有记录失败:", event.target.error);
      reject(event.target.error);
    };
  });
}

// 导出所有数据
async function exportAllData() {
  try {
    const records = await getAllRecords();
    const tags = await loadTags();
    
    // 按日期组织记录
    const recordsByDate = {};
    records.forEach(record => {
      if (!recordsByDate[record.date]) {
        recordsByDate[record.date] = [];
      }
      recordsByDate[record.date].push(record);
    });
    
    const allData = {
      records: recordsByDate,
      tags: tags
    };
    
    const dataStr = JSON.stringify(allData);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'study-records.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return true;
  } catch (error) {
    console.error("导出数据失败:", error);
    return false;
  }
}

// 导入数据
async function importData(data) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORES.RECORDS, STORES.TAGS], 'readwrite');
    const recordsStore = transaction.objectStore(STORES.RECORDS);
    const tagsStore = transaction.objectStore(STORES.TAGS);
    
    // 清除现有数据
    recordsStore.clear();
    tagsStore.clear();
    
    // 导入标签
    if (data.tags) {
      for (const tag of data.tags) {
        tagsStore.add({ name: tag });
      }
    }
    
    // 导入记录
    if (data.records) {
      for (const date in data.records) {
        for (const record of data.records[date]) {
          recordsStore.add(record);
        }
      }
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = (event) => {
        console.error("导入数据失败:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("导入数据失败:", error);
    throw error;
  }
}

// 保存选中的标签
function saveSelectedTag(tag) {
  return saveSetting('currentStudyTag', tag);
}

// 获取选中的标签
function getSelectedTag() {
  return getSetting('currentStudyTag');
}

// 保存计时器状态
function saveTimerState(paused, seconds, elapsedBeforePause = 0) {
  return Promise.all([
    saveSetting('timer_paused', paused),
    saveSetting('timer_currentSeconds', seconds),
    saveSetting('timer_elapsedBeforePause', elapsedBeforePause)
  ]);
}

// 获取计时器状态
async function getTimerState() {
  try {
    const paused = await getSetting('timer_paused');
    const seconds = await getSetting('timer_currentSeconds');
    const elapsedBeforePause = await getSetting('timer_elapsedBeforePause');
    return {
      paused: paused === 'true' || paused === true,
      seconds: Number(seconds) || 0,
      elapsedBeforePause: Number(elapsedBeforePause) || 0
    };
  } catch (error) {
    console.error("获取计时器状态失败:", error);
    return { paused: false, seconds: 0, elapsedBeforePause: 0 };
  }
}

// 获取过去7天的数据
async function getPastWeekData() {
  const dates = [];
  const minutes = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = formatDate(date);
    
    dates.push(dateString.slice(5)); // 只显示月和日
    
    const records = await getRecordsByDate(dateString);
    const totalMinutes = records.reduce((sum, record) => sum + record.duration, 0) / 60;
    minutes.push(Math.round(totalMinutes));
  }
  
  return { dates, minutes };
}

// 导出函数
window.dbHelpers = {
  saveTags,
  loadTags,
  saveRecord,
  getRecordsByDate,
  getAllRecordDates,
  saveSelectedTag,
  getSelectedTag,
  saveTimerState,
  getTimerState,
  exportAllData,
  importData,
  getPastWeekData
};
