// timer.js - 学习计时器页面脚本

// DOM 元素
const timerText = document.getElementById('timerText');
const timerStatus = document.getElementById('timerStatus');
const restCountdown = document.getElementById('restCountdown');
const nextRestTimeSpan = document.getElementById('nextRestTime');
const tagDisplay = document.getElementById('tagDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const notification = document.getElementById('notification');
const restOverlay = document.getElementById('restOverlay');
const restTimer = document.getElementById('restTimer');
const backBtn = document.getElementById('backBtn'); // 添加返回按钮引用

// 初始化 ECharts 圆环图
const timerChart = echarts.init(document.getElementById('timerCircle'));

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
let nextRestTime = null;

// 检查是否有选中的标签
function checkSelectedTag() {
    selectedTag = getSelectedTag();
    if (selectedTag) {
        tagDisplay.textContent = selectedTag;
        return true;
    } else {
        alert('请先在主页面选择一个学习标签！');
        window.location.href = 'index.html';
        return false;
    }
}

// 更新圆环图
function updateTimerCircle(percentage) {
    const option = {
        series: [{
            type: 'pie',
            radius: ['80%', '100%'],
            avoidLabelOverlap: false,
            startAngle: 90,
            hoverOffset: 0,
            label: {
                show: false,
            },
            emphasis: {
                scale: false
            },
            data: [
                {
                    value: percentage,
                    name: '已完成',
                    itemStyle: {
                        color: '#4CAF50'
                    }
                },
                {
                    value: 100 - percentage,
                    name: '剩余',
                    itemStyle: {
                        color: '#E0E0E0'
                    }
                }
            ],
            animation: false
        }]
    };
    timerChart.setOption(option);
}

// 更新计时器显示
function updateTimerDisplay() {
    timerText.textContent = formatTime(currentSeconds);
    
    // 计算进度百分比并更新圆环图
    const percentage = ((TOTAL_SECONDS - currentSeconds) / TOTAL_SECONDS) * 100;
    updateTimerCircle(percentage);
    
    // 不再显示下一次休息时间
    restCountdown.style.display = 'none';
}

// 开始计时器
function startTimer() {
    if (!checkSelectedTag()) {
        return;
    }
    
    if (!timer) {
        startTime = new Date().getTime() - elapsedBeforePause;
        
        // 设置下一次休息时间
        scheduleNextRest();
        
        timer = setInterval(() => {
            if (!isPaused) {
                currentSeconds--;
                updateTimerDisplay();
                
                // 检查是否到了休息时间
                if (nextRestTime && new Date().getTime() >= nextRestTime) {
                    startRest();
                }
                
                if (currentSeconds <= 0) {
                    completeTimer();
                }
            }
        }, 1000);
        
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        
        timerStatus.textContent = "正在学习中...";
        timerStatus.className = "timer-status status-studying";
    }
}

// 安排下一次休息时间
function scheduleNextRest() {
    // 临时设置为5秒，用于测试声音播放
    const restDelaySeconds = 5;
    const restDelay = restDelaySeconds * 1000; // 转换为毫秒
    
    nextRestTime = new Date().getTime() + restDelay;
    
    // 提前2秒显示通知
    setTimeout(() => {
        if (timer && !isPaused) {
            showNotification();
        }
    }, restDelay - 2000);
    
    console.log('已安排下一次休息时间，将在5秒后响起');
}

// 显示通知
function showNotification() {
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 开始休息
function startRest() {
    isPaused = true;
    let restSeconds = 10;
    
    // 使用shared.js中的playSound函数播放提示音
    playSound()
        .then(() => {
            console.log('休息提示音成功播放');
        })
        .catch(error => {
            console.error('休息提示音播放失败，但会继续进入休息模式:', error);
        });
    
    restOverlay.style.display = 'flex';
    restTimer.textContent = restSeconds;
    
    restInterval = setInterval(() => {
        restSeconds--;
        restTimer.textContent = restSeconds;
        
        if (restSeconds <= 0) {
            endRest();
        }
    }, 1000);
}

// 结束休息
function endRest() {
    clearInterval(restInterval);
    restOverlay.style.display = 'none';
    isPaused = false;
    
    // 设置下一次休息时间
    scheduleNextRest();
    
    timerStatus.textContent = "休息结束，继续学习中...";
    timerStatus.className = "timer-status status-studying";
}

// 暂停计时器
function pauseTimer() {
    if (timer && !isPaused) {
        isPaused = true;
        elapsedBeforePause = TOTAL_SECONDS - currentSeconds;
        pauseBtn.textContent = "继续";
        
        timerStatus.textContent = "已暂停";
        timerStatus.className = "timer-status status-paused";
    } else {
        isPaused = false;
        startTime = new Date().getTime() - elapsedBeforePause;
        pauseBtn.textContent = "暂停";
        
        timerStatus.textContent = "继续学习中...";
        timerStatus.className = "timer-status status-studying";
        
        // 如果暂停时通过了休息时间，重新安排休息
        if (nextRestTime && new Date().getTime() > nextRestTime) {
            scheduleNextRest();
        }
    }
}

// 停止计时器
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        
        // 计算实际学习的时间（秒）
        const elapsedSeconds = TOTAL_SECONDS - currentSeconds;
        
        // 保存记录
        if (elapsedSeconds > 0) {
            saveRecord(selectedTag, elapsedSeconds);
            alert(`已记录 ${Math.floor(elapsedSeconds / 60)} 分钟 ${elapsedSeconds % 60} 秒的学习时间。`);
        }
        
        // 重置计时器
        timer = null;
        currentSeconds = TOTAL_SECONDS;
        elapsedBeforePause = 0;
        isPaused = false;
        nextRestTime = null;
        
        // 清除localStorage中的计时器状态
        localStorage.removeItem('timer_paused');
        localStorage.removeItem('timer_currentSeconds');
        localStorage.removeItem('timer_elapsedBeforePause');
        
        updateTimerDisplay();
        
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = "暂停";
        stopBtn.disabled = true;
        
        timerStatus.textContent = "准备开始学习";
        timerStatus.className = "timer-status";
        restCountdown.style.display = 'none';
    }
}

// 完成计时器
function completeTimer() {
    clearInterval(timer);
    
    // 保存90分钟完整记录
    saveRecord(selectedTag, TOTAL_SECONDS);
    
    // 使用shared.js中的playSound函数播放完成提示音
    playSound()
        .then(() => {
            console.log('完成提示音成功播放');
        })
        .catch(error => {
            console.error('完成提示音播放失败:', error);
        });
    
    // 重置计时器
    timer = null;
    currentSeconds = TOTAL_SECONDS;
    elapsedBeforePause = 0;
    isPaused = false;
    nextRestTime = null;
    
    updateTimerDisplay();
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    
    timerStatus.textContent = "准备开始学习";
    timerStatus.className = "timer-status";
    restCountdown.style.display = 'none';
    
    alert("恭喜您完成了一个完整的学习周期！");
}

// 事件监听器
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);

// 返回按钮处理函数 - 确保在返回时保存暂停状态
backBtn.addEventListener('click', () => {
    // 如果计时器正在运行且没有暂停，则保存当前状态
    if (timer && !isPaused) {
        localStorage.setItem('timer_paused', 'true');
        localStorage.setItem('timer_currentSeconds', currentSeconds.toString());
        localStorage.setItem('timer_elapsedBeforePause', (TOTAL_SECONDS - currentSeconds).toString());
    }
    
    // 如果计时器已经处于暂停状态，确保暂停状态已被保存
    if (timer && isPaused) {
        // 确保状态已保存（即使已经保存过）
        localStorage.setItem('timer_paused', 'true');
        localStorage.setItem('timer_currentSeconds', currentSeconds.toString());
        localStorage.setItem('timer_elapsedBeforePause', elapsedBeforePause.toString());
    }

    // 跳转回主页
    window.location.href = 'index.html';
});

// 初始化
window.addEventListener('load', () => {
    // 检查选中的标签
    checkSelectedTag();
    
    // 初始化定时器圆环
    updateTimerCircle(0);
    
    // 检查是否有保存的计时状态
    const timerPaused = localStorage.getItem('timer_paused');
    const savedSeconds = localStorage.getItem('timer_currentSeconds');
    const savedElapsed = localStorage.getItem('timer_elapsedBeforePause');
    
    if (timerPaused === 'true' && savedSeconds && savedElapsed) {
        // 恢复计时状态
        currentSeconds = parseInt(savedSeconds);
        elapsedBeforePause = parseInt(savedElapsed);
        
        // 更新UI
        updateTimerDisplay();
        
        // 启用相关按钮
        startBtn.disabled = true; // 禁用开始按钮
        pauseBtn.disabled = false;
        pauseBtn.textContent = "继续";
        stopBtn.disabled = false;
        
        timerStatus.textContent = "已暂停";
        timerStatus.className = "timer-status status-paused";
        
        // 设置暂停状态
        isPaused = true;
        
        // 自动创建计时器，这样用户只需点击"继续"
        timer = setInterval(() => {
            if (!isPaused) {
                currentSeconds--;
                updateTimerDisplay();
                
                // 检查是否到了休息时间
                if (nextRestTime && new Date().getTime() >= nextRestTime) {
                    startRest();
                }
                
                if (currentSeconds <= 0) {
                    completeTimer();
                }
            }
        }, 1000);
    }
    
    // 调整窗口大小时重绘图表
    window.addEventListener('resize', () => {
        timerChart.resize();
    });
});

// 页面离开时自动暂停
window.addEventListener('beforeunload', () => {
    if (timer && !isPaused) {
        // 保存当前状态到localStorage
        localStorage.setItem('timer_paused', 'true');
        localStorage.setItem('timer_currentSeconds', currentSeconds.toString());
        localStorage.setItem('timer_elapsedBeforePause', (TOTAL_SECONDS - currentSeconds).toString());
    }
});