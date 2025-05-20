// index.js - 学习计时管理系统主页脚本

// DOM 元素
const tagList = document.getElementById('tagList');
const newTagInput = document.getElementById('newTagInput');
const addTagBtn = document.getElementById('addTagBtn');
const todayRecords = document.getElementById('todayRecords');
const statsDate = document.getElementById('statsDate');
const currentTagDisplay = document.getElementById('currentTagDisplay');
const currentTagName = document.getElementById('currentTagName');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const timerBtn = document.getElementById('timerBtn');

// 日历热力图相关元素
const calendarTitle = document.getElementById('calendarTitle');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthBtn = document.getElementById('currentMonth');

// 变量
let selectedTag = null;
let pieChart = null;
let barChart = null;
let dayPercentChart = null;

// 日历相关变量
let currentDate = new Date();
let selectedDate = new Date(); // 当前选中的日期

// 初始化日期选择器为今天
const today = new Date();
statsDate.valueAsDate = today;

// 加载标签
function loadTagsUI() {
    // 清空标签列表
    tagList.innerHTML = '';
    
    // 加载标签
    const tags = loadTags();
    
    // 创建标签元素
    tags.forEach(tag => {
        addTagElement(tag);
    });
    
    // 恢复选中状态
    const savedTag = getSelectedTag();
    if (savedTag) {
        selectedTag = savedTag;
        currentTagName.textContent = savedTag;
        
        // 找到对应标签元素并添加选中样式
        document.querySelectorAll('.tag').forEach(tagElement => {
            if (tagElement.getAttribute('data-tag') === savedTag) {
                tagElement.classList.add('selected');
            }
        });
        
        // 启用开始按钮
        timerBtn.disabled = false;
    }
}

// 添加标签元素
function addTagElement(tag) {
    const tagElement = document.createElement('div');
    tagElement.classList.add('tag');
    tagElement.setAttribute('data-tag', tag);
    tagElement.textContent = tag;
    
    // 添加删除按钮
    const deleteBtn = document.createElement('span');
    deleteBtn.classList.add('delete-tag');
    deleteBtn.textContent = '×';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        
        // 如果正在删除选中的标签，清除选中状态
        if (selectedTag === tag) {
            selectedTag = null;
            currentTagName.textContent = '无';
            saveSelectedTag('');
            timerBtn.disabled = true;
        }
        
        tagElement.remove();
        
        // 更新localStorage
        updateTags();
    };
    
    tagElement.appendChild(deleteBtn);
    tagList.appendChild(tagElement);
}

// 更新标签到localStorage
function updateTags() {
    const tags = [];
    document.querySelectorAll('.tag').forEach(tagElement => {
        tags.push(tagElement.getAttribute('data-tag'));
    });
    saveTags(tags);
}

// 标签选择处理
tagList.addEventListener('click', (event) => {
    if (event.target.classList.contains('tag')) {
        // 移除所有标签的选中状态
        document.querySelectorAll('.tag').forEach(tag => {
            tag.classList.remove('selected');
        });
        
        // 添加选中状态到点击的标签
        event.target.classList.add('selected');
        selectedTag = event.target.getAttribute('data-tag');
        
        // 更新当前选中标签显示
        currentTagName.textContent = selectedTag;
        
        // 保存选中标签
        saveSelectedTag(selectedTag);
        
        // 启用开始按钮
        timerBtn.disabled = false;
    }
});

// 添加新标签
addTagBtn.addEventListener('click', () => {
    const newTag = newTagInput.value.trim();
    if (newTag) {
        // 检查标签是否已存在
        const tags = loadTags();
        if (!tags.includes(newTag)) {
            addTagElement(newTag);
            updateTags();
        }
        newTagInput.value = '';
    }
});

// 开始计时器
timerBtn.addEventListener('click', () => {
    if (selectedTag) {
        // 跳转到计时器页面
        window.location.href = 'timer.html';
    } else {
        alert('请先选择一个学习标签！');
    }
});

// 设置ECharts
function initCharts() {
    pieChart = echarts.init(document.getElementById('pieChart'));
    barChart = echarts.init(document.getElementById('barChart'));
    dayPercentChart = echarts.init(document.getElementById('dayPercentChart'));
    
    // 加载初始统计数据
    updateCharts();
    
    // 监听窗口大小变化，重新调整图表大小
    window.addEventListener('resize', () => {
        pieChart.resize();
        barChart.resize();
        dayPercentChart.resize();
    });
}

// 更新图表
function updateCharts() {
    const selectedDate = statsDate.value;
    const records = getRecordsByDate(selectedDate);
    
    // 按标签分组
    const tagStats = {};
    let totalTime = 0;
    
    records.forEach(record => {
        if (!tagStats[record.tag]) {
            tagStats[record.tag] = 0;
        }
        tagStats[record.tag] += record.duration;
        totalTime += record.duration;
    });
    
    // 饼图数据
    const pieData = Object.keys(tagStats).map(tag => {
        return {
            name: tag,
            value: Math.round(tagStats[tag] / 60) // 转换为分钟
        };
    });
    
    const pieOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}分钟 ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 0,
            top: 'middle',
            left: 'auto',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                fontSize: 11
            },
            data: Object.keys(tagStats)
        },
        grid: {
            containLabel: true
        },
        series: [
            {
                name: '学习时间',
                type: 'pie',
                radius: ['40%', '60%'],
                center: ['35%', '50%'],
                avoidLabelOverlap: true,
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '12',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: pieData
            }
        ]
    };
    
    // 获取过去7天的数据
    const pastWeekData = getPastWeekData();
    
    const barOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}分钟'
        },
        xAxis: {
            type: 'category',
            data: pastWeekData.dates
        },
        yAxis: {
            type: 'value',
            name: '学习时间(分钟)'
        },
        series: [{
            data: pastWeekData.minutes,
            type: 'bar',
            color: '#2196F3'
        }]
    };
    
    pieChart.setOption(pieOption);
    barChart.setOption(barOption);
    
    // 更新今日时间占比图表，确保使用相同的数据集
    updateTodayPercentChart(records, totalTime);
}

// 更新今日时间占比图表 - 改为平滑的饼图
function updateTodayPercentChart(records) {
    // 将一天的记录按时间顺序整理
    const sortedRecords = [...records].sort((a, b) => {
        const timeA = a.time.split(':');
        const timeB = b.time.split(':');
        return parseInt(timeA[0]) * 60 + parseInt(timeA[1]) - 
                (parseInt(timeB[0]) * 60 + parseInt(timeB[1]));
    });
    
    // 创建饼图数据
    const pieData = [];
    let totalMinutesStudied = 0;
    
    // 每天总分钟数
    const totalDayMinutes = 24 * 60;
    
    // 上一段结束时间（分钟）
    let lastEndTimeInMinutes = 0;
    
    // 处理每条记录，添加学习时间段和非学习时间段
    sortedRecords.forEach(record => {
        // 解析开始时间（转换为分钟）
        const timeParts = record.time.split(':');
        const startTimeInMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
        
        // 如果开始时间大于上一段结束时间，添加一个非学习时间段
        if (startTimeInMinutes > lastEndTimeInMinutes) {
            const nonStudyMinutes = startTimeInMinutes - lastEndTimeInMinutes;
            pieData.push({
                name: '未学习',
                value: nonStudyMinutes,
                itemStyle: {
                    color: '#E0E0E0' // 灰色
                },
                startTime: formatMinutesToTime(lastEndTimeInMinutes),
                endTime: formatMinutesToTime(startTimeInMinutes),
                isStudyTime: false
            });
        }
        
        // 计算学习结束时间（分钟）
        const durationInMinutes = Math.floor(record.duration / 60);
        const endTimeInMinutes = startTimeInMinutes + durationInMinutes;
        
        // 添加学习时间段
        pieData.push({
            name: record.tag,
            value: durationInMinutes,
            itemStyle: {
                color: '#4CAF50' // 绿色
            },
            startTime: formatMinutesToTime(startTimeInMinutes),
            endTime: formatMinutesToTime(endTimeInMinutes),
            duration: durationInMinutes,
            isStudyTime: true
        });
        
        // 更新上一段结束时间和总学习时间
        lastEndTimeInMinutes = endTimeInMinutes;
        totalMinutesStudied += durationInMinutes;
    });
    
    // 如果最后一段结束时间小于一天总时间，添加最后一个非学习时间段
    if (lastEndTimeInMinutes < totalDayMinutes) {
        const remainingMinutes = totalDayMinutes - lastEndTimeInMinutes;
        pieData.push({
            name: '未学习',
            value: remainingMinutes,
            itemStyle: {
                color: '#E0E0E0' // 灰色
            },
            startTime: formatMinutesToTime(lastEndTimeInMinutes),
            endTime: '24:00',
            isStudyTime: false
        });
    }
    
    // 如果没有记录，显示完整的24小时未学习
    if (pieData.length === 0) {
        pieData.push({
            name: '未学习',
            value: totalDayMinutes,
            itemStyle: {
                color: '#E0E0E0' // 灰色
            },
            startTime: '00:00',
            endTime: '24:00',
            isStudyTime: false
        });
    }
    
    const todayPercentOption = {
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.data.isStudyTime) {
                    return `${params.data.name}<br/>` +
                            `开始: ${params.data.startTime}<br/>` + 
                            `结束: ${params.data.endTime}<br/>` + 
                            `持续: ${params.data.duration}分钟`;
                } else {
                    return `未学习时间<br/>` + 
                            `${params.data.startTime} - ${params.data.endTime}`;
                }
            }
        },
        series: [
            {
                name: '今日时间占比',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                startAngle: 90, // 0时刻从12点钟方向开始
                clockwise: true,
                itemStyle: {
                    borderRadius: 0,
                    borderWidth: 1,
                    borderColor: '#fff'
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: false
                    },
                    scale: false
                },
                data: pieData
            }
        ]
    };
    
    dayPercentChart.setOption(todayPercentOption);
    
    // 更新今日总时间显示
    const totalHours = Math.floor(totalMinutesStudied / 60);
    const totalMins = totalMinutesStudied % 60;
    
    // 格式化显示，精确到分钟
    let timeDisplay = "";
    if (totalHours > 0) {
        timeDisplay += `${totalHours}小时`;
    }
    if (totalMins > 0 || totalHours === 0) {
        timeDisplay += `${totalMins}分钟`;
    }
    
    document.getElementById('todayTotalTime').textContent = timeDisplay;
}

// 将分钟数格式化为时间字符串 (例如: 65 -> "01:05")
function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// 根据标签获取颜色
function getColorByTag(tag) {
    // 为不同标签生成固定颜色（使用简单的哈希算法）
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 转换为HSL颜色，保持饱和度和亮度固定，只变化色相
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// 更新今日记录列表
function updateRecordsList() {
    const today = formatDate(new Date());
    const records = getRecordsByDate(today);
    
    // 清除之前的记录（保留标题）
    const heading = todayRecords.querySelector('h3');
    todayRecords.innerHTML = '';
    todayRecords.appendChild(heading);
    
    // 判断是否有记录
    if (records.length === 0) {
        const noRecords = document.createElement('div');
        noRecords.className = 'no-records';
        noRecords.textContent = '今天还没有学习记录';
        todayRecords.appendChild(noRecords);
        return;
    }
    
    // 添加每条记录到列表
    records.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.classList.add('record-item');
        
        // 创建记录信息部分（包含标签和时间）
        const recordInfo = document.createElement('div');
        recordInfo.classList.add('record-info');
        
        // 创建标签部分
        const recordTag = document.createElement('span');
        recordTag.classList.add('record-tag');
        recordTag.textContent = record.tag;
        
        // 创建时间部分
        const recordTime = document.createElement('span');
        recordTime.classList.add('record-time');
        recordTime.textContent = record.time;
        
        // 创建持续时间部分
        const recordDuration = document.createElement('span');
        recordDuration.classList.add('record-duration');
        recordDuration.textContent = `${Math.round(record.duration / 60)} 分钟`;
        
        // 组装记录信息（标签和时间）
        recordInfo.appendChild(recordTag);
        recordInfo.appendChild(recordTime);
        
        // 将记录信息和持续时间添加到记录项
        recordItem.appendChild(recordInfo);
        recordItem.appendChild(recordDuration);
        
        todayRecords.appendChild(recordItem);
    });
}

// 导入记录数据
function importData(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            Object.keys(data).forEach(date => {
                const records = data[date];
                const storageKey = `studyRecords_${date}`;
                localStorage.setItem(storageKey, JSON.stringify(records));
                updateRecordIndex(date);
            });
            
            alert('导入成功！');
            updateRecordsList();
            updateCharts();
        } catch (error) {
            alert('导入失败，请确保文件格式正确');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// 检查是否有暂停的计时器
function checkPausedTimer() {
    const timerPaused = localStorage.getItem('timer_paused');
    const savedSeconds = localStorage.getItem('timer_currentSeconds');
    
    if (timerPaused === 'true' && savedSeconds) {
        // 如果有暂停的计时器，更新按钮样式和文本
        timerBtn.classList.add('continue');
        
        // 添加倒计时剩余时间的显示
        const minutes = Math.floor(parseInt(savedSeconds) / 60);
        const seconds = parseInt(savedSeconds) % 60;
        timerBtn.textContent = `继续上次学习 (${minutes}:${seconds.toString().padStart(2, '0')} 剩余)`;
        
        // 即使没有选择标签也启用按钮
        timerBtn.disabled = false;
    } else {
        // 如果没有暂停的计时器，恢复按钮样式和文本
        timerBtn.classList.remove('continue');
        timerBtn.textContent = '开始学习计时';
        
        // 根据是否选择了标签决定按钮是否可用
        timerBtn.disabled = !selectedTag;
    }
}

// 获取上次学习的标签
function getLastRecord() {
    const timerPaused = localStorage.getItem('timer_paused');
    const savedTag = getSelectedTag();
    
    if (timerPaused === 'true' && savedTag) {
        return { tag: savedTag };
    }
    return null;
}

// 事件监听器
statsDate.addEventListener('change', updateCharts);
exportBtn.addEventListener('click', exportAllData);
importFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        importData(file);
    }
});

// 生成日历热力图
function generateCalendar(year, month) {
    // 清空日历网格（除了星期标题）
    const weekdayHeaders = calendarGrid.querySelectorAll('.weekday-header');
    calendarGrid.innerHTML = '';
    
    // 重新添加星期标题
    weekdayHeaders.forEach(header => {
        calendarGrid.appendChild(header);
    });
    
    // 更新标题
    calendarTitle.textContent = `${year}年${month + 1}月`;
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay();
    
    // 获取当月有多少天
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 获取上个月的最后几天
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // 计算需要显示多少格子（最多6行）
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
    
    // 如果第一天不是星期日，填充上个月的最后几天
    for (let i = 0; i < firstDayIndex; i++) {
        const day = prevMonthLastDay - firstDayIndex + i + 1;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayData = getDayData(dateString);
        
        addCalendarDay(day, 'inactive', dayData, dateString);
    }
    
    // 填充当前月的天数
    for (let i = 1; i <= daysInMonth; i++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayData = getDayData(dateString);
        
        let classes = '';
        
        // 检查是否是今天
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            classes += ' today';
        }
        
        // 检查是否是选中的日期
        if (year === selectedDate.getFullYear() && month === selectedDate.getMonth() && i === selectedDate.getDate()) {
            classes += ' selected';
        }
        
        addCalendarDay(i, classes, dayData, dateString);
    }
    
    // 如果有剩余格子，填充下个月的前几天
    const remainingCells = totalCells - (firstDayIndex + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const dayData = getDayData(dateString);
        
        addCalendarDay(i, 'inactive', dayData, dateString);
    }
}

// 获取某天的学习数据
function getDayData(dateString) {
    const records = getRecordsByDate(dateString);
    if (records.length === 0) {
        return { level: 0, minutes: 0, tooltip: '无学习记录' };
    }
    
    // 计算总学习时间（分钟）
    const totalMinutes = records.reduce((sum, record) => sum + Math.round(record.duration / 60), 0);
    
    // 计算小时数
    const totalHours = totalMinutes / 60;
    
    // 根据学习时间确定热力等级（新的时间范围）
    let level = 0;
    if (totalHours > 0 && totalHours < 3) {
        level = 1; // <3小时
    } else if (totalHours >= 3 && totalHours < 4.5) {
        level = 2; // 3-4.5小时
    } else if (totalHours >= 4.5 && totalHours < 6) {
        level = 3; // 4.5-6小时
    } else if (totalHours >= 6 && totalHours < 8) {
        level = 4; // 6-8小时
    } else if (totalHours >= 8) {
        level = 5; // >8小时
    }
    
    // 格式化时间显示
    let timeDisplay = '';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hours > 0) {
        timeDisplay += `${hours}小时`;
    }
    if (mins > 0 || hours === 0) {
        timeDisplay += `${mins}分钟`;
    }
    
    // 添加标签信息到提示
    const tagStats = {};
    records.forEach(record => {
        if (!tagStats[record.tag]) {
            tagStats[record.tag] = 0;
        }
        tagStats[record.tag] += Math.round(record.duration / 60);
    });
    
    let tagInfo = '<br>学习内容:<br>';
    Object.keys(tagStats).forEach(tag => {
        const tagMinutes = tagStats[tag];
        const tagHours = Math.floor(tagMinutes / 60);
        const tagMins = tagMinutes % 60;
        
        let tagTimeStr = '';
        if (tagHours > 0) {
            tagTimeStr += `${tagHours}小时`;
        }
        if (tagMins > 0 || tagHours === 0) {
            tagTimeStr += `${tagMins}分钟`;
        }
        
        tagInfo += `- ${tag}: ${tagTimeStr}<br>`;
    });
    
    return {
        level,
        minutes: totalMinutes,
        tooltip: `总学习时间: ${timeDisplay}${tagInfo}`
    };
}

// 添加日历单元格
function addCalendarDay(day, classes, dayData, dateString) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-day');
    dayElement.classList.add(`heat-level-${dayData.level}`);
    
    if (classes) {
        classes.split(' ').forEach(cls => {
            if (cls) dayElement.classList.add(cls);
        });
    }
    
    // 添加日期数字
    const dayNumber = document.createElement('div');
    dayNumber.classList.add('day-number');
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // 添加提示
    if (dayData.minutes > 0) {
        const tooltip = document.createElement('div');
        tooltip.classList.add('day-tooltip');
        tooltip.textContent = dayData.tooltip;
        dayElement.appendChild(tooltip);
    }
    
    // 点击事件处理
    dayElement.addEventListener('click', () => {
        // 点击日期时更新选中状态
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        if (!dayElement.classList.contains('inactive')) {
            dayElement.classList.add('selected');
            
            // 解析日期字符串并更新选中日期
            selectedDate = new Date(dateString);
            
            // 更新隐藏的日期输入框以兼容现有的updateCharts函数
            statsDate.value = dateString;
            
            // 更新图表数据
            updateCharts();
        } else {
            // 如果点击的是非当前月的日期，切换到对应月份
            const newDate = new Date(dateString);
            currentDate = newDate;
            generateCalendar(newDate.getFullYear(), newDate.getMonth());
            
            // 设置为选中状态
            selectedDate = newDate;
            statsDate.value = dateString;
            updateCharts();
        }
    });
    
    calendarGrid.appendChild(dayElement);
}

// 月份导航事件处理
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

currentMonthBtn.addEventListener('click', () => {
    currentDate = new Date();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

// 页面加载时初始化
window.addEventListener('load', () => {
    loadTagsUI();
    initCharts();
    updateRecordsList();
    
    // 检查是否有暂停的计时器
    checkPausedTimer();
    
    // 初始化日历热力图
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    
    // 窗口大小变化时调整图表大小
    window.addEventListener('resize', () => {
        if (pieChart && barChart) {
            pieChart.resize();
            barChart.resize();
        }
    });
});