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
    try {
      // 检查IndexedDB是否可用
      if (!window.indexedDB) {
        console.error("您的浏览器不支持IndexedDB");
        // 使用内存存储模式（会话期间有效）
        if (!window._memoryDB) {
          window._memoryDB = {
            RECORDS: [],
            TAGS: [],
            SETTINGS: {}
          };
        }
        resolve("memory");
        return;
      }
      
      // 在GitHub Pages环境下，如果检测到运行在跨域iframe中，直接使用内存模式
      // 这有助于避免某些浏览器扩展导致的IndexedDB问题
      try {
        if (window.location.href.includes('github.io') && window !== window.top) {
          console.warn("检测到GitHub Pages环境中的iframe，使用内存模式");
          if (!window._memoryDB) {
            window._memoryDB = {
              RECORDS: [],
              TAGS: [],
              SETTINGS: {}
            };
          }
          resolve("memory");
          return;
        }
      } catch (err) {
        // 访问window.top可能会因为跨域安全限制而失败
        // 忽略错误，继续使用IndexedDB
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      // 设置超时处理，避免浏览器插件阻塞
      const timeoutId = setTimeout(() => {
        console.warn("数据库打开操作超时，可能是由于浏览器扩展冲突");
        // 使用内存模式作为备选
        if (!window._memoryDB) {
          window._memoryDB = {
            RECORDS: [],
            TAGS: [],
            SETTINGS: {}
          };
        }
        resolve("memory");
      }, 1000); // 1秒超时，缩短超时时间避免运行时错误
      
      request.onerror = (event) => {
        clearTimeout(timeoutId);
        console.error("数据库打开失败:", event.target.error);
        // 使用内存模式作为备选
        if (!window._memoryDB) {
          window._memoryDB = {
            RECORDS: [],
            TAGS: [],
            SETTINGS: {}
          };
        }
        resolve("memory");
      };
      
      request.onsuccess = (event) => {
        clearTimeout(timeoutId);
        const db = event.target.result;
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        try {
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
        } catch (err) {
          console.error("升级数据库时出错:", err);
        }
      };
    } catch (err) {
      console.error("启动数据库时出错:", err);
      // 使用内存模式作为备选
      if (!window._memoryDB) {
        window._memoryDB = {
          RECORDS: [],
          TAGS: [],
          SETTINGS: {}
        };
      }
      resolve("memory");
    }
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
async function saveSelectedTag(tag) {
  try {
    return await saveSetting('currentStudyTag', tag);
  } catch (err) {
    console.log("保存选中标签出错，使用内存存储:", err);
    if (window._memoryDB) {
      window._memoryDB.SETTINGS['currentStudyTag'] = tag;
      return true;
    }
    return false;
  }
}

// 获取选中的标签
async function getSelectedTag() {
  try {
    return await getSetting('currentStudyTag');
  } catch (err) {
    console.log("获取选中标签出错，尝试从内存获取:", err);
    if (window._memoryDB && window._memoryDB.SETTINGS['currentStudyTag']) {
      return window._memoryDB.SETTINGS['currentStudyTag'];
    }
    return null;
  }
}

// 保存计时器状态
async function saveTimerState(paused, seconds, elapsedBeforePause = 0) {
  try {
    // 使用Promise.allSettled确保即使某个操作失败，其他操作也能继续
    const results = await Promise.allSettled([
      saveSetting('timer_paused', paused),
      saveSetting('timer_currentSeconds', seconds),
      saveSetting('timer_elapsedBeforePause', elapsedBeforePause)
    ]);
    
    // 检查是否所有操作都成功
    const allSucceeded = results.every(result => result.status === 'fulfilled');
    
    // 如果有操作失败，使用内存存储作为备份
    if (!allSucceeded && window._memoryDB) {
      window._memoryDB.SETTINGS['timer_paused'] = paused;
      window._memoryDB.SETTINGS['timer_currentSeconds'] = seconds;
      window._memoryDB.SETTINGS['timer_elapsedBeforePause'] = elapsedBeforePause;
    }
    
    return true;
  } catch (err) {
    console.log("保存计时器状态出错，使用内存存储:", err);
    if (window._memoryDB) {
      window._memoryDB.SETTINGS['timer_paused'] = paused;
      window._memoryDB.SETTINGS['timer_currentSeconds'] = seconds;
      window._memoryDB.SETTINGS['timer_elapsedBeforePause'] = elapsedBeforePause;
      return true;
    }
    return false;
  }
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
    console.log("获取计时器状态失败，尝试从内存获取:", error);
    
    // 从内存模式中读取
    if (window._memoryDB) {
      const memPaused = window._memoryDB.SETTINGS['timer_paused'];
      const memSeconds = window._memoryDB.SETTINGS['timer_currentSeconds'];
      const memElapsed = window._memoryDB.SETTINGS['timer_elapsedBeforePause'];
      
      if (memPaused !== undefined) {
        return {
          paused: memPaused === 'true' || memPaused === true,
          seconds: Number(memSeconds) || 0,
          elapsedBeforePause: Number(memElapsed) || 0
        };
      }
    }
    
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
