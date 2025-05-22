// timer.js - 学习计时器页面脚本

// 处理GitHub Pages上的运行时错误
(function() {
  // 解决 "runtime.lastError: A listener indicated an asynchronous response..." 的错误
  // 这通常由于Chrome扩展或页面过快关闭导致的未完成的Promise
  window.addEventListener('beforeunload', function(event) {
    // 尝试关闭所有潜在的异步操作
    try {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      
      // 如果Notification API可用，取消任何可能的权限请求
      if ('Notification' in window && Notification.permission === 'default') {
        // 不请求通知权限，避免页面关闭时出现的问题
      }
      
      // 清空其他可能的超时
      const highestTimeoutId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
    } catch (e) {
      // 忽略任何错误
    }
  });
})();

// DOM 元素变量声明
let timerText, timerStatus, restCountdown, nextRestTimeSpan, tagDisplay;
let startBtn, pauseBtn, stopBtn, notification, restOverlay, restTimer, backBtn, soundToggleBtn;

// 初始化 ECharts 圆环图
let timerChart;

// 常量
const TOTAL_SECONDS = 90 * 60; // 90分钟

// 变量
let timer = null;
let currentSeconds = TOTAL_SECONDS;
let isPaused = false;
let startTime = null;
let elapsedBeforePause = 0;
let selectedTag = null;
let restInterval = null;
let soundEnabled = true; // 控制声音的启用状态

// 其他变量
let nextRestTime = null; // 下次休息时间
const REST_INTERVAL_MIN = 3; // 最少3分钟休息一次
const REST_INTERVAL_MAX = 5; // 最多5分钟休息一次
const REST_DURATION_SEC = 10; // 默认休息10秒

// 检查是否有暂停的计时器
async function checkPausedTimer() {
    const timerState = await window.dbHelpers.getTimerState();
    console.log("获取计时器状态:", timerState);
    
    if (timerState.paused) {
        console.log("发现已暂停的计时器");
        currentSeconds = timerState.seconds || TOTAL_SECONDS;
        elapsedBeforePause = timerState.elapsedBeforePause || 0;
        isPaused = true;
        
        console.log(`恢复暂停的计时器: currentSeconds=${currentSeconds}, elapsedBeforePause=${elapsedBeforePause}`);
    }
}

// 加载已选择的标签
async function loadSelectedTag() {
    selectedTag = await getSelectedTag();
    
    if (!selectedTag) {
        // 如果没有选中的标签，跳回主页
        window.location.href = 'index.html';
        return;
    }
    
    // 检查是否有暂停的计时器，确保使用正确的标签
    const timerState = await window.dbHelpers.getTimerState();
    if (timerState.paused) {
        // 如果有暂停的计时器，再次确认标签是正确的
        console.log(`继续暂停的学习会话，使用标签: ${selectedTag}`);
    }
    
    // 显示标签
    tagDisplay.textContent = selectedTag;
}

// 更新计时器显示
function updateTimerDisplay() {
    // 计算分钟和秒数
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = currentSeconds % 60;
    
    // 更新文本显示
    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // 更新状态显示
    if (timer) {
        timerStatus.textContent = "学习中";
        timerStatus.className = "status-active";
    } else if (isPaused) {
        timerStatus.textContent = "已暂停";
        timerStatus.className = "status-paused";
    } else {
        timerStatus.textContent = "未开始";
        timerStatus.className = "status-inactive";
    }
    
    // 计算学习进度百分比
    const progressPercent = ((TOTAL_SECONDS - currentSeconds) / TOTAL_SECONDS) * 100;
    
    // 更新圆环图
    updateTimerChart(progressPercent);    // 更新下次休息时间显示
    updateNextRestTimeDisplay();
    
    // 更新按钮状态
    updateButtonStates();
    
    // 更新页面标题，显示剩余时间
    document.title = `${timerText.textContent} - 学习计时`;
}

// 更新圆环图显示
function updateTimerChart(percent) {
    const option = {
        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                pointer: {
                    show: false
                },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                        color: '#1976D2'
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 18,
                        color: [[1, '#E0E0E0']]
                    }
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                detail: {
                    show: false
                },
                data: [
                    {
                        value: percent
                    }
                ]
            }
        ]
    };
    
    timerChart.setOption(option);
}

// 更新下次休息时间显示
function updateNextRestTimeDisplay() {
    if (nextRestTime) {
        const now = new Date();
        const diffMilliseconds = nextRestTime - now;
        
        if (diffMilliseconds > 0) {
            const diffMinutes = Math.floor(diffMilliseconds / (60 * 1000));
            const diffSeconds = Math.floor((diffMilliseconds % (60 * 1000)) / 1000);
            
            // 显示分钟和秒
            nextRestTimeSpan.textContent = `${diffMinutes}:${String(diffSeconds).padStart(2, '0')}`;
            restCountdown.classList.remove('hidden');
        } else {
            restCountdown.classList.add('hidden');
        }
    } else {
        restCountdown.classList.add('hidden');
    }
}

// 更新按钮状态
function updateButtonStates() {
    console.log(`更新按钮状态: timer=${!!timer}, isPaused=${isPaused}, currentSeconds=${currentSeconds}`);
    
    if (timer) {
        // 正在计时
        console.log("状态: 正在计时");
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        backBtn.disabled = true; // 计时中不能返回
    } else if (isPaused) {
        // 已暂停
        console.log("状态: 已暂停");
        startBtn.disabled = false;
        startBtn.textContent = "继续";
        pauseBtn.disabled = true;
        stopBtn.disabled = false; // 明确设置为可用
        backBtn.disabled = false; // 暂停时可以返回
    } else {
        // 未开始
        console.log("状态: 未开始");
        startBtn.disabled = false;
        startBtn.textContent = "开始";
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        backBtn.disabled = false; // 未开始时可以返回
    }
    
    // 确保按钮元素引用存在
    if (!stopBtn) console.error("stopBtn元素引用丢失!");
    if (!startBtn) console.error("startBtn元素引用丢失!");
    if (!pauseBtn) console.error("pauseBtn元素引用丢失!");
    if (!backBtn) console.error("backBtn元素引用丢失!");
}

// 开始或恢复计时器
function startTimer() {
    if (isPaused) {
        // 恢复计时
        startTime = new Date() - elapsedBeforePause;
        isPaused = false;
    } else {
        // 新开始计时
        startTime = new Date();
        currentSeconds = TOTAL_SECONDS;
        elapsedBeforePause = 0;
        
        // 设置第一次休息时间
        scheduleNextRest();
    }
      // 清除状态
    window.dbHelpers.saveTimerState(false, 0, 0);
    
    // 设置计时器
    timer = setInterval(updateTimer, 1000);
    updateTimerDisplay();
}

// 暂停计时器
function pauseTimer() {
    if (timer) {
        console.log("暂停计时器");
        clearInterval(timer);
        timer = null;
        
        // 记录暂停前已经流逝的时间
        const now = new Date();
        elapsedBeforePause = now - startTime;
        isPaused = true;
        
        console.log(`保存暂停状态: currentSeconds=${currentSeconds}, elapsedBeforePause=${elapsedBeforePause}`);
        
        // 保存状态到 IndexedDB
        window.dbHelpers.saveTimerState(true, currentSeconds, elapsedBeforePause);
        
        updateTimerDisplay();
    }
}

// 更新计时器
function updateTimer() {
    const now = new Date();
    const elapsedMilliseconds = now - startTime;
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    
    // 更新剩余时间
    currentSeconds = Math.max(0, TOTAL_SECONDS - elapsedSeconds);
    
    // 检查是否该休息了
    if (nextRestTime && now >= nextRestTime) {
        showRestReminder();
        scheduleNextRest(); // 安排下一次休息
    }
    
    // 更新显示
    updateTimerDisplay();
    
    // 检查是否结束
    if (currentSeconds <= 0) {
        clearInterval(timer);
        timer = null;        // 保存记录
        window.dbHelpers.saveRecord(selectedTag, TOTAL_SECONDS);
        
        showNotification("计时结束", "恭喜！本次学习时间已完成。");
        playSoundIfEnabled();
        
        // 重置计时器
        currentSeconds = TOTAL_SECONDS;
        elapsedBeforePause = 0;
        isPaused = false;
    }
}

// 停止计时器
async function stopTimer() {
    console.log("stopTimer 函数被调用");
    try {
        // 检查是否有计时器或处于暂停状态        // 添加更多调试信息
        console.log(`当前计时器状态: timer=${!!timer}, isPaused=${isPaused}, currentSeconds=${currentSeconds}, elapsedBeforePause=${elapsedBeforePause}`);
        
        if (timer || isPaused) {
            console.log(`开始停止流程: timer=${!!timer}, isPaused=${isPaused}`);
            
            // 如果计时器还在运行，先停止它
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
              // 计算实际学习的时间（秒）
            let elapsedSeconds = TOTAL_SECONDS - currentSeconds;
            console.log(`实际学习时间: ${elapsedSeconds}秒`);
              // 检查必要变量
            console.log(`selectedTag: ${selectedTag}`);
            console.log(`window.dbHelpers存在: ${!!window.dbHelpers}`);
            console.log(`saveRecord函数存在: ${!!window.dbHelpers?.saveRecord}`);
            
            // 如果处于暂停状态但学习时间为0，可能是计时器状态不一致
            // 在这种情况下，我们检查elapsedBeforePause是否有值
            if (elapsedSeconds <= 0 && isPaused && elapsedBeforePause > 0) {
                console.log(`处于暂停状态但elapsedSeconds为0，使用elapsedBeforePause计算: ${elapsedBeforePause}ms`);
                const pauseSeconds = Math.floor(elapsedBeforePause / 1000);
                if (pauseSeconds > 0) {
                    console.log(`使用计算出的学习时间: ${pauseSeconds}秒`);
                    // 重新赋值elapsedSeconds
                    elapsedSeconds = pauseSeconds;
                }
            }
            
            // 重置状态变量(先执行，确保UI立即响应)
            isPaused = false;
            currentSeconds = TOTAL_SECONDS;
            elapsedBeforePause = 0;
            nextRestTime = null;
            
            // 立即更新UI显示
            updateTimerDisplay();
            
            // 保存记录
            if (elapsedSeconds > 0) {
                try {
                    console.log("尝试保存学习记录...");
                    const result = await window.dbHelpers.saveRecord(selectedTag, elapsedSeconds);
                    console.log("保存记录结果:", result);
                    alert(`已记录 ${Math.floor(elapsedSeconds / 60)} 分钟 ${elapsedSeconds % 60} 秒的学习时间。`);                } catch (saveError) {
                    console.error("保存记录时出错:", saveError);
                    alert("保存学习记录时出错: " + (saveError.message || saveError));
                }
            }
            
            try {
                console.log("清除IndexedDB计时器状态...");
                // 清除IndexedDB中的计时器状态
                const stateResult = await window.dbHelpers.saveTimerState(false, 0, 0);
                console.log("清除计时器状态结果:", stateResult);
            } catch (stateError) {
                console.error("清除计时器状态时出错:", stateError);
            }
            
            // 再次更新UI以确保显示正确
            console.log("更新计时器显示");
            updateTimerDisplay();        } else {
            console.warn("timer不存在且不处于暂停状态，没有需要结束的计时器");
            alert("没有可结束的学习计时器");
        }
    } catch (error) {
        console.error("stopTimer函数执行出错:", error);
        alert("停止计时器时发生错误: " + (error.message || error));
    }
}

// 显示通知
function showNotification(title, message) {
    // 确保notification元素存在
    if (!notification) {
        console.log("Notification元素不存在，创建简单通知");
        try {
            notification = document.createElement('div');
            notification.className = 'notification';
            notification.id = 'notification';
            document.body.appendChild(notification);
        } catch (err) {
            console.log("无法创建通知元素:", err);
        }
    }

    // 始终显示屏幕上的通知
    try {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    } catch (err) {
        console.log("显示内部通知失败:", err);
    }

    // 检查浏览器是否支持通知API
    if (!("Notification" in window)) {
        console.log("浏览器不支持Notification API");
        return;
    }
    
    try {
        // 检查用户是否已授予通知权限
        if (Notification.permission === "granted") {
            // 创建并显示通知
            try {
                const notification = new Notification(title, {
                    body: message,
                    icon: "./images/favicon.ico", // 相对路径，适用于GitHub Pages
                    requireInteraction: false, // 不要求用户交互
                    silent: false // 使用系统声音
                });
                
                // 确保通知在5秒后关闭
                setTimeout(() => {
                    notification.close();
                }, 5000);
            } catch (err) {
                console.log("创建系统通知失败:", err);
            }
        } else if (Notification.permission !== "denied") {
            // 请求权限但不立即显示通知
            try {
                Notification.requestPermission();
                // 不在权限请求后立即创建通知，避免未完成的Promise
            } catch (err) {
                console.log("请求通知权限失败:", err);
            }
        }
    } catch (err) {
        console.log("通知系统出错:", err);
    }
}

// 安排下一次休息提醒
function scheduleNextRest() {
    const now = new Date();
    // 生成3-5分钟之间的随机休息间隔（转换为毫秒）
    const randomInterval = (Math.random() * (REST_INTERVAL_MAX - REST_INTERVAL_MIN) + REST_INTERVAL_MIN) * 60 * 1000;
    console.log(`设置随机休息间隔: ${Math.round(randomInterval / 1000 / 60 * 10) / 10}分钟`);
    nextRestTime = new Date(now.getTime() + randomInterval);
    
    updateNextRestTimeDisplay();
}

// 显示休息提醒
function showRestReminder() {
    console.log("显示休息提醒");
    
    // 暂停计时器
    if (timer) {
        clearInterval(timer);
        timer = null;
        
        // 记录暂停前已经流逝的时间
        const now = new Date();
        elapsedBeforePause = now - startTime;
        
        isPaused = true;
        console.log(`计时器暂停，已学习时间: ${Math.floor(elapsedBeforePause/1000)}秒`);
    }
      // 显示休息提示层
    restOverlay.classList.add('show');
    
    // 播放提示音
    playSoundIfEnabled();    // 设置休息倒计时
    let restSeconds = REST_DURATION_SEC;
    console.log(`设置休息时间: ${REST_DURATION_SEC}秒`);
    showNotification("休息时间", `10秒短暂休息后将自动继续`);
    updateRestTimerDisplay(restSeconds);
    
    // 启动休息计时器
    restInterval = setInterval(() => {
        restSeconds--;
        updateRestTimerDisplay(restSeconds);
        
        if (restSeconds <= 0) {
            clearInterval(restInterval);
            endRest();
        }
    }, 1000);
}

// 更新休息计时器显示
function updateRestTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    restTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// 结束休息
function endRest() {
    // 隐藏休息提示层
    restOverlay.classList.remove('show');
    
    // 清除休息计时器
    if (restInterval) {
        clearInterval(restInterval);
        restInterval = null;
    }
      // 恢复学习计时器
    if (isPaused) {
        startTimer();
    }
    
    // 播放提示音
    playSoundIfEnabled();
}

// 有条件地播放声音
function playSoundIfEnabled() {
    if (soundEnabled) {
        return playSound().catch(err => console.log("无法播放声音:", err));
    }
    return Promise.resolve("声音已禁用");
}

// 切换声音状态
function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundToggleButton();
    
    // 保存声音设置
    try {
        // 尝试使用IndexedDB
        if (window.dbHelpers && typeof window.dbHelpers.saveSetting === 'function') {
            window.dbHelpers.saveSetting('soundEnabled', soundEnabled);
        }
        
        // 同时使用localStorage作为备份
        localStorage.setItem('soundEnabled', soundEnabled.toString());
        
        // 播放测试声音
        if (soundEnabled) {
            playSound().catch(err => console.log("测试声音失败:", err));
        }
    } catch (error) {
        console.error("保存声音设置失败:", error);
    }
    
    // 显示状态反馈
    const message = soundEnabled ? "声音已开启" : "声音已静音";
    showNotification("声音设置", message);
}

// 更新声音切换按钮的状态
function updateSoundToggleButton() {
    if (soundToggleBtn) {
        soundToggleBtn.innerHTML = soundEnabled ? 
            '<span class="icon">🔊</span>' : 
            '<span class="icon">🔇</span>';
        soundToggleBtn.title = soundEnabled ? "静音" : "开启声音";
    }
}

// 加载声音设置
async function loadSoundSettings() {
    try {
        // 检查window.dbHelpers是否存在以及是否包含getSetting方法
        if (window.dbHelpers && typeof window.dbHelpers.getSetting === 'function') {
            const savedSetting = await window.dbHelpers.getSetting('soundEnabled');
            
            // 如果有保存的设置，则使用它
            if (savedSetting !== null) {
                soundEnabled = savedSetting === 'true' || savedSetting === true;
            }
            
            console.log(`加载声音设置: ${soundEnabled ? '已启用' : '已禁用'}`);
        } else {
            console.log("dbHelpers.getSetting方法不存在，使用默认设置");
            // 直接使用localStorage作为备选
            const localSetting = localStorage.getItem('soundEnabled');
            if (localSetting !== null) {
                soundEnabled = localSetting === 'true';
            }
        }
        
        updateSoundToggleButton();
    } catch (error) {
        console.error("加载声音设置失败:", error);
        // 保持默认设置（启用声音）
    }
}

// 显示键盘快捷键提示
async function showKeyboardShortcutHint() {
    try {
        let hasShownHint = false;
        
        // 检查window.dbHelpers是否存在以及是否包含getSetting方法
        if (window.dbHelpers && typeof window.dbHelpers.getSetting === 'function') {
            hasShownHint = await window.dbHelpers.getSetting('keyboardShortcutsHintShown');
        } else {
            // 直接使用localStorage作为备选
            hasShownHint = localStorage.getItem('keyboardShortcutsHintShown') === 'true';
        }
        
        if (!hasShownHint) {
            setTimeout(() => {
                showNotification("提示", "键盘快捷键: 空格=开始/暂停, ESC=停止, S=声音切换, B=返回");
                
                // 保存提示已显示状态
                if (window.dbHelpers && typeof window.dbHelpers.saveSetting === 'function') {
                    window.dbHelpers.saveSetting('keyboardShortcutsHintShown', true);
                } else {
                    localStorage.setItem('keyboardShortcutsHintShown', 'true');
                }
            }, 2000);
        }
    } catch (error) {
        console.error("显示键盘快捷键提示失败:", error);
    }
}

// 处理PC后台运行提示
function setupPCNotice() {
    const pcNotice = document.getElementById('pcNotice');
    const closeNoticeBtn = document.getElementById('closeNoticeBtn');
    const dontShowAgainCheckbox = document.getElementById('dontShowAgainCheckbox');
    
    if (!pcNotice || !closeNoticeBtn) return;
    
    // 立即在DOM元素创建时隐藏通知元素，防止闪烁
    pcNotice.style.display = 'none';
    
    // 检查是否已经选择不再显示通知
    const dontShowAgain = localStorage.getItem('pcNoticeDontShowAgain') === 'true';
    
    // 如果用户已选择不再提醒，保持隐藏状态
    if (dontShowAgain) {
        return;
    }
    
    // 在一个requestAnimationFrame中启用通知显示，确保DOM完全渲染后再显示
    requestAnimationFrame(() => {
        pcNotice.style.display = 'flex';
    });
    
    // 点击关闭按钮
    closeNoticeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        pcNotice.style.display = 'none';
        
        // 如果勾选了"不再提醒"，则保存设置
        if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
            localStorage.setItem('pcNoticeDontShowAgain', 'true');
        }
    });
    
    // 处理复选框状态变化
    if (dontShowAgainCheckbox) {
        dontShowAgainCheckbox.addEventListener('change', function() {
            // 可以在这里添加额外的逻辑，如果需要的话
            console.log("不再提醒选项变更为:", this.checked);
        });
    }
}

// 事件监听器已移至window.load事件中

// 页面加载时初始化
window.addEventListener('load', async () => {
    console.log("页面加载完成，开始初始化");
    
    // 获取DOM元素
    timerText = document.getElementById('timerText');
    timerStatus = document.getElementById('timerStatus');
    restCountdown = document.getElementById('restCountdown');
    nextRestTimeSpan = document.getElementById('nextRestTime');
    tagDisplay = document.getElementById('tagDisplay');
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    stopBtn = document.getElementById('stopBtn');
    notification = document.getElementById('notification');
    restOverlay = document.getElementById('restOverlay');    restTimer = document.getElementById('restTimer');
    backBtn = document.getElementById('backBtn');
    soundToggleBtn = document.getElementById('soundToggleBtn');
      console.log("DOM元素获取完成，stopBtn:", stopBtn);
    
    // 添加事件监听器
    console.log("添加事件监听器");
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (stopBtn) {
        console.log("为stopBtn添加点击事件");
        stopBtn.addEventListener('click', function() {
            console.log("stopBtn被点击！");
            stopTimer();
        });
    } else {
        console.error("未找到stopBtn元素!");
    }
    
    const skipRestBtn = document.getElementById('skipRestBtn');
    if (skipRestBtn) {
        skipRestBtn.addEventListener('click', endRest);
    } else {
        console.warn("未找到skipRestBtn元素，但这是正常的，因为它只在休息时才会出现");
    }
    
    // 返回按钮事件
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (!timer) { // 确保不是正在计时状态
                window.location.href = 'index.html';
            }
        });
    }
    
    // 声音切换按钮事件
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', toggleSound);
    } else {
        console.error("未找到soundToggleBtn元素!");
    }
    
    // 加载选中的标签
    await loadSelectedTag();
      // 检查是否有暂停的计时器
    await checkPausedTimer();
    
    // 加载声音设置
    await loadSoundSettings();
      
    // 初始化ECharts图表
    timerChart = echarts.init(document.getElementById('timerCircle'));
    console.log("ECharts初始化完成");
      // 初始化显示
    updateTimerDisplay();
      // 请求通知权限
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
      // 显示键盘快捷键提示
    await showKeyboardShortcutHint();
    
    // 设置PC后台运行提示
    setupPCNotice();
    
    // 防止页面关闭时计时器丢失
    window.addEventListener('beforeunload', (event) => {
        if (timer) {
            pauseTimer(); // 自动暂停
            
            // 弹出确认框询问是否离开
            event.preventDefault();
            event.returnValue = '';
        }
    });
    
    // 添加键盘快捷键
    window.addEventListener('keydown', (event) => {
        // 只在没有输入框获得焦点时处理快捷键
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(event.key) {
            case ' ':  // 空格键切换开始/暂停
                if (timer) {
                    pauseBtn.click();
                } else if (isPaused) {
                    startBtn.click();
                } else {
                    startBtn.click();
                }
                event.preventDefault();
                break;
                
            case 'Escape':  // ESC键停止计时器
                if (timer || isPaused) {
                    stopBtn.click();
                }
                break;
                
            case 's':  // s键切换声音
                soundToggleBtn.click();
                break;
                
            case 'b':  // b键返回，如果不在计时状态
                if (!timer) {
                    backBtn.click();
                }
                break;
        }
    });
});