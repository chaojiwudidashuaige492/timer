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

// 舒缓的风铃声 - 优先使用这个声音
const ALERT_SOUND_BASE64 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjEyLjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAADAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjE5AAAAAAAAAAAAAAAAJAZFAAAAAAAABobUrU2CAAAAAAD/+xDEAAAKZAF39BEABfxEr/8DAAENGWAL5MDhLjG1nGdPs1KrDDdt2MwKzcdjt/6sz5alwH///ezV/tY+1s6URAGAOY7Lp5UEqAKYAUwBgAAAUByAMgA44IjF1EJyfyt4xzKJfiN4qQCdldXSAwpsjqZIE2duM9XESe/WUMPttU9J+JMBOqWTBMVWPKiLT6CwE8fS4yLz6Chea0VPFLX//TWc9DnO0VDSY9Vt1akI07DBnv6LO1Omi7////v/nWT5HwpnHLT+sYyAABABgJAHiCEgcYKYNYBRgmg0mJYKWY8Z+J9UFfEsTCrJJAsCYOgGDGDwDAwxgKAcYBoChgrggGCYBkGO4CAYHeQ5j/lRGN+SqL3o5q/UKjP9RgN5aJmKuvS9KGb+tGCMUYBi9q1BhM8tra5MzExnV/9bnacSUpi6mCK5kFCN/////+e37///7///////1///v//4fjRkQAAAAUGAUAUCACAgMADBYwlMDTATAMwoMDcCMBAgYCIGZgJAimCKAGYEYCL/+yDEFgAHXMMhfKRgCQQJJPeGMAIxgUAoMAQAAwCwHTANADAwWmAgMMjElnZNSpjIziNxN4zQNktpTIhCdq2LCm0XM0RIpG5tqrMxIqk6NKLMPKM6Ndup3Q66EQGa0yYVGdah8ppSZJkPLLq1pQltcYs00KaZ3SppGaXqerTUnt5nelSupTS9Svg5ZdDIalbJdGDqXCXDJTWltwhkOhkqhDFQl8uiXSqZLJNLiGZKXVepcxuDABDAgCGBAABBgEAAQYBgAMmAYAEZgOAAsYCYAcGAcAABgEAA8YAwADGAOASBIAKGAwAP5gGAA0YBAASmAGAChgEgAqYAIAFGHEUD7JEM9UoTVyX1Kmm2pNmzEaNXb9s1bGnv9s0+9bG9LOhtET336wmhLp0mwpN+t0n36T6G63VaHeD73rYZ7dDo39aorep6Uta907UPvWtKValZR7QlLZJvUsr2lrVpY1Let2pbEt6W9e1jVoSmzr2pfek9LZE29AhDZcKAQEBAQFXXLx1Llyy5cuXLlksUWIQlwQh9F1JcEIcIQ4XLLhFFFiiiiixAAAAAA//tAxCUAE/UtXfmskAohhOr/PYABLLe1qrUFKtqlFbUqtVpaS2tpaAFoALUmYxiMRgKIxGIMAQMA38BB+Xw5q/CpDmrGpDmuNSHNQl8aqhQwVHAocUDZDmxShhQuKGFDggocKGKFxWsUVrCh0csd7FY72KkqRtJGkbbaaPJmjyZo8mkaSNJGk0jaTR5M0kbbaSpHk0h5NIeTSHk0h5NI22kjTbGm22222220kbSRpJG0UORCrEYqqFA4HA4HA4HA4HAFCMREREREREAAREREREREREREREREREREREQ43UmxwdTxwcHBwcHD/+xDEDAPLrIdb+ewACM2MZz89gAEBwcHBwcHBwcHBwcHBwcHCIiIiJxO+InGIiIiIREREQiIiIicTvEMxugYVDB4YPHhYyMYnE74icYiIiIREREQiIiIhERERERERERERERERExERERBtG00bRtG0bRpGkaRpG0bRtG0bRtG0bRtG0bRtG0aRpGjf4qqqqqqqqM5znOc5znOc5znAgQIAAAJcuXMrWLsUBAgQAAAACuXLly5cuXLly5vZIiIiIiIAIiIiIiIcdBwcHBwcHBwcHBwcHBwSIiIiJxO+InFYwMHhg8MHDg4ODg4ODg4ODg4ODg4ODhERERERERERCIiI/////iIiIiIiIiIiIiIiIiIiIiIiIiIx3fxERERERERg4ODhERERCIiIiInE74iiIiIiERERERERERERERERERF/+4qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=';

// 备用声音 - 更轻柔的提示音
const BACKUP_SOUND_BASE64 = 'data:audio/wav;base64,UklGRogrAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWQrAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////+/v79/f38/Pz7+/v6+vr5+fn4+Pj39/f29vb19fX09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3s7Ozr6+vq6urp6eno6Ojn5+fm5ubk5OTl5eXj4+Pi4uLh4eHg4ODe3t7f39/d3d3c3Nzb29va2trZ2dnY2NjW1tbX19fV1dTT09PS0tLR0dHQ0NDPz8/Ozs7Nzc3Ly8vMzMzKysnIyMjHx8fGxsbFxcXDw8PExMTCwsHAwMC/v7++vr69vb28vLy7u7u6urq5ubm4uLi3t7e2tra1tbW0tLSzs7OysrKxsbGwsLCvr6+urq6tra2srKyrq6uqqqqpqaminp6enJycmpqamJiYlpaWlJSUkpKSkJCQjo6OjIyMioqKiIiIhoaGhISEgoKCgICAf39/fX19e3t7eXl5d3d3dXV1c3NzcXFxb29vbW1ta2trZ2dnaWlpZWVlY2NjYWFhX19fXV1dW1tbWVlZV1dXVVVVU1NTUVFRTk5OTExMSEhIRkZGREREQkJCQEBAOjo6PDw8Nzc3NTU1MzMzLy8vLS0tKioqKCgoJiYmJCQkIiIiICAgHh4eHBwcGhoaGBgYFhYWFBQUEhISEBAQDg4ODAwMCgoKBgYGCAgIBAQEAgICAAAAAP7+/vz8/Pr6+vj4+Pb29vT09PLy8vDw8O7u7uzs7Orq6ujo6Obm5uTk5OLi4uDg4N7e3tzc3NjY2Nra2tbW1tTU1NLS0tDQ0M7Ozs7OzszMzMzMzMzMzM7Ozs7Ozs7OztDQ0NLS0tTU1NbW1tjY2Nra2tzc3N7e3uDg4OLi4uTk5Obm5ujo6Orq6uzs7O7u7vDw8PLy8vT09Pb29vj4+Pr6+v///////////////wAA/v7+/Pz8+vr6+Pj49vb28/Pz8fHx7+/v7e3t6+vr6enp5+fn5eXl4+Pj4eHh39/f3d3d29vb2dnZ19fX1dXV09PT0dHRz8/Pzc3Ny8vLycnJx8fHxcXFw8PDwcHBv7+/vb29u7u7ubm5t7e3tbW1s7OzsbGxr6+vrKystLS0srKysLCwrq6urKysqqqqqKiopaWlpKSkpKSkpaWlp6enqampq6ursLCws7OztbW1t7e3urq6vLy8vr6+wcHBw8PDxcXFx8fHycnJy8vLzc3Nz8/P0dHR09PT1dXV19fX2dnZ29vb3d3d39/f4eHh4+Pj5eXl5+fn6enp6+vr7e3t7+/v8fHx8/Pz9vb2+Pj4+vr6/Pz8/v7+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////+/v79/f38/Pz7+/v6+vr5+fn4+Pj39/f29vb19fX09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3s7Ozr6+vq6urp6eno6Ojn5+fm5ubk5OTl5eXj4+Pi4uLh4eHg4ODe3t7f39/d3d3c3Nzb29va2trZ2dnY2NjW1tbX19fV1dTT09PS0tLR0dHQ0NDPz8/Ozs7Nzc3Ly8vMzMzKysnIyMjHx8fGxsbFxcXDw8PExMTCwsHAwMC/v7++vr69vb28vLy7u7u6urq5ubm4uLi3t7e2tra1tbW0tLSzs7OysrKxsbGwsLCvr6+urq6tra2srKyrq6uqqqqpqaminp6enJycmpqamJiYlpaWlJSUkpKSkJCQjo6OjIyMioqKiIiIhoaGhISEgoKCgICAf39/fX19e3t7eXl5d3d3dXV1c3NzcXFxb29vbW1ta2trZ2dnaWlpZWVlY2NjYWFhX19fXV1dW1tbWVlZV1dXVVVVU1NTUVFRTk5OTExMSEhIRkZGREREQkJCQEBAOjo6PDw8Nzc3NTU1MzMzLy8vLS0tKioqKCgoJiYmJCQkIiIiICAgHh4eHBwcGhoaGBgYFhYWFBQUEhISEBAQDg4ODAwMCgoKBgYGCAgIBAQEAgICAAAAAP7+/vz8/Pr6+vj4+Pb29vT09PLy8vDw8O7u7uzs7Orq6ujo6Obm5uTk5OLi4uDg4N7e3tzc3NjY2Nra2tbW1tTU1NLS0tDQ0M7Ozs7OzszMzMzMzMzMzM7Ozs7Ozs7OztDQ0NLS0tTU1NbW1tjY2Nra2tzc3N7e3uDg4OLi4uTk5Obm5ujo6Orq6uzs7O7u7vDw8PLy8vT09Pb29vj4+Pr6+v///////////////wAA/v7+/Pz8+vr6+Pj49vb28/Pz8fHx7+/v7e3t6+vr6enp5+fn5eXl4+Pj4eHh39/f3d3d29vb2dnZ19fX1dXV09PT0dHRz8/Pzc3Ny8vLycnJx8fHxcXFw8PDwcHBv7+/vb29u7u7ubm5t7e3tbW1s7OzsbGxr6+vrKystLS0srKysLCwrq6urKysqqqqqKiopaWlpKSkpKSkpaWlp6enqampq6ursLCws7OztbW1t7e3urq6vLy8vr6+wcHBw8PDxcXFx8fHycnJy8vLzc3Nz8/P0dHR09PT1dXV19fX2dnZ29vb3d3d39/f4eHh4+Pj5eXl5+fn6enp6+vr7e3t7+/v8fHx8/Pz9vb2+Pj4+vr6/Pz8/v7+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////+/v79/f38/Pz7+/v6+vr5+fn4+Pj39/f29vb19fX09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3s7Ozr6+vq6urp6eno6Ojn5+fm5ubk5OTl5eXj4+Pi4uLh4eHg4ODe3t7f39/d3d3c3Nzb29va2trZ2dnY2NjW1tbX19fV1dTT09PS0tLR0dHQ0NDPz8/Ozs7Nzc3Ly8vMzMzKysnIyMjHx8fGxsbFxcXDw8PExMTCwsHAwMC/v7++vr69vb28vLy7u7u6urq5ubm4uLi3t7e2tra1tbW0tLSzs7OysrKxsbGwsLCvr6+urq6tra2srKyrq6uqqqqpqaminp6enJycmpqamJiYlpaWlJSUkpKSkJCQjo6OjIyMioqKiIiIhoaGhISEgoKCgICAf39/fX19e3t7eXl5d3d3dXV1c3NzcXFxb29vbW1ta2trZ2dnaWlpZWVlY2NjYWFhX19fXV1dW1tbWVlZV1dXVVVVU1NTUVFRTk5OTExMSEhIRkZGREREQkJCQEBAOjo6PDw8Nzc3NTU1MzMzLy8vLS0tKioqKCgoJiYmJCQkIiIiICAgHh4eHBwcGhoaGBgYFhYWFBQUEhISEBAQDg4ODAwMCgoKBgYGCAgIBAQEAgICAAAAAP7+/vz8/Pr6+vj4+Pb29vT09PLy8vDw8O7u7uzs7Orq6ujo6Obm5uTk5OLi4uDg4N7e3tzc3NjY2Nra2tbW1tTU1NLS0tDQ0M7Ozs7OzszMzMzMzMzMzM7Ozs7Ozs7OztDQ0NLS0tTU1NbW1tjY2Nra2tzc3N7e3uDg4OLi4uTk5Obm5ujo6Orq6uzs7O7u7vDw8PLy8vT09Pb29vj4+Pr6+v///////////////wAA/v7+/Pz8+vr6+Pj49vb28/Pz8fHx7+/v7e3t6+vr6enp5+fn5eXl4+Pj4eHh39/f3d3d29vb2dnZ19fX1dXV09PT0dHRz8/Pzc3Ny8vLycnJx8fHxcXFw8PDwcHBv7+/vb29u7u7ubm5t7e3tbW1s7OzsbGxr6+vrKystLS0srKysLCwrq6urKysqqqqqKiopaWlpKSkpKSkpaWlp6enqampq6ursLCws7OztbW1t7e3urq6vLy8vr6+wcHBw8PDxcXFx8fHycnJy8vLzc3Nz8/P0dHR09PT1dXV19fX2dnZ29vb3d3d39/f4eHh4+Pj5eXl5+fn6enp6+vr7e3t7+/v8fHx8/Pz9vb2+Pj4+vr6/Pz8/v7+';

/**
 * 舒缓风铃声音频播放函数 - 专为提供舒缓的学习提示音
 * 返回Promise以支持异步操作，在声音播放成功或失败后解决
 */
function playSound() {
  return new Promise((resolve) => {
    // 创建一个标志，用于跟踪是否已经解决了Promise
    let isResolved = false;
    
    // 确保Promise在2秒内被解决（风铃声需要更长的播放时间）
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        resolve(true); // 即使没有播放声音，也返回成功，避免错误提示
      }
    }, 2000);
    
    // 尝试播放风铃声
    try {
      // 首先尝试播放主风铃声
      const chime = new Audio(ALERT_SOUND_BASE64);
      chime.volume = 0.5; // 适中的音量
      
      const playPromise = chime.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!isResolved) {
              // 在声音播放完成后解决Promise
              chime.onended = () => {
                if (!isResolved) {
                  isResolved = true;
                  resolve(true);
                }
              };
              
              // 如果声音没有触发onended事件，我们也确保在合理时间内解决Promise
              setTimeout(() => {
                if (!isResolved) {
                  isResolved = true;
                  resolve(true);
                }
              }, 1500); // 风铃声大约持续1-2秒
            }
          })
          .catch(e => {
            console.log("主风铃声播放失败，尝试备用声音:", e);
            // 如果主声音失败，尝试备用声音
            try {
              const backupSound = new Audio(BACKUP_SOUND_BASE64);
              backupSound.volume = 0.3;
              
              const backupPlayPromise = backupSound.play();
              if (backupPlayPromise !== undefined) {
                backupPlayPromise
                  .then(() => {
                    if (!isResolved) {
                      isResolved = true;
                      resolve(true);
                    }
                  })
                  .catch(e => {
                    console.log("备用声音也失败，尝试AudioContext:", e);
                    tryAudioContext();
                  });
              } else {
                if (!isResolved) {
                  isResolved = true;
                  resolve(true);
                }
              }
            } catch (err) {
              console.log("备用音频播放失败，尝试AudioContext:", err);
              tryAudioContext();
            }
          });
      } else {
        // 如果play()没有返回promise (老浏览器)，尝试AudioContext
        tryAudioContext();
      }
    } catch (e) {
      console.log("Audio元素方法失败，尝试AudioContext:", e);
      tryAudioContext();
    }
    
    // 如果其他方法都失败，尝试使用AudioContext创建简单的音调
    function tryAudioContext() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          // 创建一个柔和的风铃模拟声音
          
          // 主音调
          const oscillator1 = audioCtx.createOscillator();
          oscillator1.type = 'sine';
          oscillator1.frequency.value = 700; // 主频率
          
          // 和声
          const oscillator2 = audioCtx.createOscillator();
          oscillator2.type = 'sine';
          oscillator2.frequency.value = 840; // 和声频率
          
          // 音量控制
          const gainNode = audioCtx.createGain();
          gainNode.gain.value = 0.2; // 较低的音量
          
          // 连接节点
          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          // 设置淡入淡出效果
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
          
          // 开始播放
          oscillator1.start();
          oscillator2.start();
          
          // 1.5秒后停止
          setTimeout(() => {
            try {
              oscillator1.stop();
              oscillator2.stop();
            } catch (e) {
              // 忽略停止时的错误
            }
            
            if (!isResolved) {
              isResolved = true;
              resolve(true);
            }
          }, 1500);
        } else {
          // 如果AudioContext不可用，解决Promise
          if (!isResolved) {
            isResolved = true;
            resolve(true);
          }
        }
      } catch (e) {
        // 所有音频方法都失败，但仍标记为成功
        console.log("所有音频方法都失败:", e);
        if (!isResolved) {
          isResolved = true;
          resolve(true);
        }
      }
    }
  });
}
