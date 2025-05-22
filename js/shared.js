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
 * 增强版音频播放函数 - 提供更舒缓的提示音
 * 返回Promise以支持异步操作，在声音播放成功或失败后解决
 */
function playSound() {
  return new Promise((resolve, reject) => {
    // 创建一个标志，用于跟踪是否已经解决了Promise
    let isResolved = false;
    
    // 使用Web Audio API创建更舒缓的风铃声音效果
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 创建增益节点以控制音量
      const masterGain = audioContext.createGain();
      masterGain.gain.value = 0.3; // 设置整体音量较低
      masterGain.connect(audioContext.destination);
      
      // 创建多个振荡器来模拟风铃声
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // 和谐的音符频率 (C5, E5, G5, C6)
      
      frequencies.forEach((freq, index) => {
        // 创建振荡器
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // 正弦波声音
        oscillator.frequency.value = freq;
        
        // 创建增益节点，控制淡入淡出效果
        const gainNode = audioContext.createGain();
        
        // 起始音量为0
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        // 淡入 - 在200毫秒内音量线性增加
        gainNode.gain.linearRampToValueAtTime(0.2 - index * 0.03, audioContext.currentTime + 0.2);
        // 持续一段时间
        gainNode.gain.setValueAtTime(0.2 - index * 0.03, audioContext.currentTime + 0.8);
        // 淡出 - 缓慢降低音量
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        // 开始播放，交错开始使声音更自然
        setTimeout(() => {
          oscillator.start();
          // 1.5秒后停止播放
          setTimeout(() => oscillator.stop(), 1500);
        }, index * 100);
      });
      
      // 所有声音播放完成后完成Promise
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve('Web Audio API风铃音播放成功');
        }
      }, 2000);
      
      console.log("使用Web Audio API播放舒缓的风铃声");
      return;  // 如果成功，直接返回
    } catch (e) {
      console.warn("Web Audio API播放失败，尝试使用更简单的舒缓声音:", e);
      
      // 如果复杂的方法失败，尝试更简单的方式创建舒缓的声音
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建振荡器 - 使用较低频率
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';  // 正弦波声音
        oscillator.frequency.value = 440;  // 设置频率为440Hz (A4音符)
        
        // 创建增益节点以控制音量和淡入淡出
        const gainNode = audioContext.createGain();
        
        // 设置淡入淡出
        gainNode.gain.setValueAtTime(0, audioContext.currentTime); 
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.7);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.2);
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 开始播放
        oscillator.start();
        
        // 1.2秒后停止播放
        setTimeout(() => {
          oscillator.stop();
          if (!isResolved) {
            isResolved = true;
            resolve('简单舒缓音播放成功');
          }
        }, 1200);
        
        return; // 如果成功，直接返回
      } catch (e) {
        console.warn("简单舒缓音播放失败，尝试使用Audio元素:", e);
      }
    }
    
    // 备选方案：使用HTML5 Audio元素
    try {
      const sound = new Audio();
      
      // 设置事件监听器
      sound.oncanplaythrough = function() {
        sound.play()
          .then(() => {
            if (!isResolved) {
              isResolved = true;
              resolve('HTML5 Audio播放成功');
            }
          })
          .catch(e => {
            console.warn("MP3播放失败，尝试备用WAV格式:", e);
            sound.src = BACKUP_SOUND_BASE64;
            
            sound.oncanplaythrough = function() {
              sound.play()
                .then(() => {
                  if (!isResolved) {
                    isResolved = true;
                    resolve('备用WAV播放成功');
                  }
                })
                .catch(finalError => {
                  if (!isResolved) {
                    console.error("所有音频方法均失败:", finalError);
                    isResolved = true;
                    reject(finalError);
                  }
                });
            };
          });
      };
      
      sound.onerror = function(e) {
        console.warn("加载音频失败:", e);
        // 不立即拒绝，因为我们可能尝试其他方法
      };
      
      // 设置音频源为MP3
      sound.src = ALERT_SOUND_BASE64;
      console.log("尝试使用HTML5 Audio播放MP3");
    } catch (e) {
      console.error("所有音频播放方法均失败:", e);
      if (!isResolved) {
        isResolved = true;
        reject(e);
      }
    }
    
    // 如果3秒后仍未播放声音，则视为失败
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.warn("音频播放超时");
        reject(new Error("音频播放超时"));
      }
    }, 3000);
  });
}
