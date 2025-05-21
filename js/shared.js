// 共享函数
// ===============================

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ===============================
// 数据访问函数 - 现在使用 IndexedDB
// 这些函数是 IndexedDB.js 中对应函数的代理
// ===============================

// 为了保持代码的兼容性，我们保留相同的函数签名，但内部实现调用 IndexedDB 函数

// 获取特定日期的记录
async function getRecordsByDate(date) {
    return await window.dbHelpers.getRecordsByDate(date);
}

// 保存学习记录
async function saveRecord(tag, duration) {
    return await window.dbHelpers.saveRecord(tag, duration);
}

// 获取记录的所有日期
async function getAllRecordDates() {
    return await window.dbHelpers.getAllRecordDates();
}

// 加载标签
async function loadTags() {
    return await window.dbHelpers.loadTags();
}

// 保存标签
async function saveTags(tags) {
    return await window.dbHelpers.saveTags(tags);
}

// 保存当前选中的标签
async function saveSelectedTag(tag) {
    return await window.dbHelpers.saveSelectedTag(tag);
}

// 获取当前选中的标签
async function getSelectedTag() {
    return await window.dbHelpers.getSelectedTag();
}

// 导出所有记录数据
async function exportAllData() {
    return await window.dbHelpers.exportAllData();
}

// 获取过去7天的数据
async function getPastWeekData() {
    return await window.dbHelpers.getPastWeekData();
}

// 使用简单可靠的提示音 - 这是一个有效的短MP3数据
const ALERT_SOUND_BASE64 = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADbgCA//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////////AAAA/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMQAAAesTXRQRMAIrKnaj0CgBBAAmJqzOgIAlgDO3azgBAEABwB3d3cAd3d3AAAACAIAgCDoOP8QBAP/g+D4Pgg/8uDgIAgIf/BwEH//5CEPggCAIf//iDoJwiHwfBAEAQdBAEAwf//y4Pv/8H3/+XB//+D7///wfACBLLLL//tgxAaAca0NGnBGAACDLLLLLLLAAAAIERERERERERERERERERERERERERERERERERERERERERE=';

// 备用声音 - beep声
const BACKUP_SOUND_BASE64 = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vb2//////f/9//3//f/9//3//f/9//3//f/9//3//f/9//3//fw==';

/**
 * 简化版音频播放函数 - 更加稳定，适用于GitHub Pages
 * 返回Promise以支持异步操作，在声音播放成功或失败后解决
 */
function playSound() {
  return new Promise((resolve) => {
    // 创建一个标志，用于跟踪是否已经解决了Promise
    let isResolved = false;
    
    // 设置超时，确保Promise一定会被解决
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        resolve(false);
      }
    }, 1000);
    
    // 在一些浏览器环境下（如GitHub Pages）声音可能无法正常工作
    // 采用最简单的方法，并且不抛出错误
    try {
      // 尝试最简单的Beep声音 - 使用Audio元素
      const sound = new Audio();
      
      // 设置加载成功事件
      sound.oncanplaythrough = function() {
        try {
          const playPromise = sound.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (!isResolved) {
                  isResolved = true;
                  resolve('HTML5 Audio播放成功');
                }
              })
              .catch(e => {
                console.log("播放失败，静默处理:", e);
                if (!isResolved) {
                  isResolved = true;
                  resolve('无法播放音频，但已静默处理');
                }
              });
          } else {
            // 旧版浏览器可能没有返回promise
            if (!isResolved) {
              isResolved = true;
              resolve('旧版浏览器音频播放');
            }
          }
        } catch (playError) {
          console.log("播放尝试出错，静默处理:", playError);
          if (!isResolved) {
            isResolved = true;
            resolve('播放尝试出错，但已静默处理');
          }
        }
      };
      
      // 设置错误处理
      sound.onerror = function(e) {
        console.log("音频加载失败，静默处理:", e);
        if (!isResolved) {
          isResolved = true;
          resolve('音频加载失败，但已静默处理');
        }
      };
      
      // 设置音频数据 - 使用较小的WAV beep
      sound.src = BACKUP_SOUND_BASE64;
      
    } catch (e) {
      console.log("音频API不可用，静默处理:", e);
      if (!isResolved) {
        isResolved = true;
        resolve('音频API不可用，但已静默处理');
      }
    }
    
    // 如果1秒后仍未播放声音，则静默通过
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.log("音频播放超时，静默处理");
        resolve('音频播放超时，但已静默处理');
      }
    }, 1000);
  });
}
