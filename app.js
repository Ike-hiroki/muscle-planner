// === メインアプリケーション ===
const App = {
  currentDayIndex: 0,
  currentMenu: null,
  chart: null,

  init() {
    this.setupTabs();
    this.setupProfile();
    this.setupMenu();
    this.setupRecord();

    ProfileManager.loadFormValues();

    const menu = MenuGenerator.getMenu();
    if (menu) {
      this.currentMenu = WeightAdjuster.adjustMenu(menu);
      this.renderMenu();
    }

    this.renderHistory();
  },

  // === タブ切り替え ===
  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('.notice .btn-ghost[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'menu') {
      const menu = MenuGenerator.getMenu();
      if (menu) {
        this.currentMenu = WeightAdjuster.adjustMenu(menu);
        this.renderMenu();
      } else {
        this.showMenuNotice();
      }
    } else if (tabId === 'progress') {
      this.renderProgress();
    } else if (tabId === 'history') {
      this.renderHistory();
    }
  },

  // === プロフィール ===
  setupProfile() {
    document.getElementById('saveProfile').addEventListener('click', () => {
      const profile = ProfileManager.getFormValues();
      const errors = ProfileManager.validate(profile);
      const msg = document.getElementById('profileMessage');

      if (errors.length > 0) {
        msg.textContent = errors.join('、');
        msg.className = 'message error';
        msg.classList.remove('hidden');
        return;
      }

      ProfileManager.saveProfile(profile);
      const menu = MenuGenerator.generate(profile);
      this.currentMenu = WeightAdjuster.adjustMenu(menu);

      msg.textContent = 'メニューを生成しました！「Today」タブで確認できます';
      msg.className = 'message success';
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 3000);
    });
  },

  // === メニュー表示 ===
  setupMenu() {
    document.getElementById('prevDay').addEventListener('click', () => {
      if (!this.currentMenu) return;
      this.currentDayIndex = (this.currentDayIndex - 1 + this.currentMenu.days.length) % this.currentMenu.days.length;
      this.renderMenuDay();
    });
    document.getElementById('nextDay').addEventListener('click', () => {
      if (!this.currentMenu) return;
      this.currentDayIndex = (this.currentDayIndex + 1) % this.currentMenu.days.length;
      this.renderMenuDay();
    });
    document.getElementById('startTraining').addEventListener('click', () => {
      this.startTrainingFromMenu();
    });
  },

  showMenuNotice() {
    document.getElementById('menuNotice').classList.remove('hidden');
    document.getElementById('menuSummary').classList.add('hidden');
    document.getElementById('menuDaySelector').classList.add('hidden');
    document.getElementById('menuContent').innerHTML = '';
    document.getElementById('startTraining').classList.add('hidden');
  },

  renderMenu() {
    if (!this.currentMenu || !this.currentMenu.days.length) {
      this.showMenuNotice();
      return;
    }
    document.getElementById('menuNotice').classList.add('hidden');
    document.getElementById('menuSummary').classList.remove('hidden');
    document.getElementById('menuDaySelector').classList.remove('hidden');
    document.getElementById('startTraining').classList.remove('hidden');
    this.renderMenuDay();
  },

  estimateTime(day) {
    let totalSeconds = 5 * 60; // ウォームアップ5分
    day.exercises.forEach(ex => {
      const setTime = 40; // 1セット約40秒
      const restTime = ex.rest || 75;
      totalSeconds += ex.sets * (setTime + restTime);
    });
    return Math.round(totalSeconds / 60);
  },

  renderMenuDay() {
    const day = this.currentMenu.days[this.currentDayIndex];
    document.getElementById('currentDay').textContent = day.name;

    // サマリー更新
    const totalSets = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const estimatedMin = this.estimateTime(day);
    document.getElementById('menuExCount').textContent = day.exercises.length;
    document.getElementById('menuSetCount').textContent = totalSets;
    document.getElementById('menuTime').textContent = estimatedMin;

    const container = document.getElementById('menuContent');
    container.innerHTML = day.exercises.map(ex => {
      const changeIcon = ex.weightChange === 'up' ? '<span class="weight-change weight-up">&#9650;</span>'
        : ex.weightChange === 'down' ? '<span class="weight-change weight-down">&#9660;</span>'
        : ex.weightChange === 'same' && ex.weightReason !== '記録なし（初回）'
          ? '<span class="weight-change weight-same">&#8594;</span>' : '';

      const weightDisplay = ex.isTimeBased ? '-' : `${ex.weight}kg${changeIcon}`;

      const adjustmentHtml = ex.weightReason && ex.weightReason !== '記録なし（初回）'
        ? `<div class="exercise-adjustment ${ex.weightChange}">${ex.weightReason}</div>` : '';

      return `
        <div class="exercise-card">
          <div class="exercise-header">
            <span class="exercise-name">${ex.name}</span>
            <span class="exercise-target">${ex.target}</span>
          </div>
          <div class="exercise-detail">
            <div class="detail-item">
              <span class="detail-label">Weight</span>
              <span class="detail-value">${weightDisplay}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Reps</span>
              <span class="detail-value">${ex.reps}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sets</span>
              <span class="detail-value">${ex.sets}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Rest</span>
              <span class="detail-value">${ex.rest}s</span>
            </div>
          </div>
          ${adjustmentHtml}
          <div class="exercise-tip">${ex.tip}</div>
        </div>
      `;
    }).join('');
  },

  // === トレーニング記録 ===
  setupRecord() {
    document.getElementById('saveRecord').addEventListener('click', () => {
      this.saveTrainingRecord();
    });
  },

  startTrainingFromMenu() {
    const day = this.currentMenu.days[this.currentDayIndex];
    this.renderRecordForm(day);
    this.switchTab('record');
  },

  renderRecordForm(day) {
    const today = Recorder.getTodayString();
    document.getElementById('recordDate').textContent =
      `${Recorder.formatDate(today)} - ${day.name}`;
    document.getElementById('recordNotice').classList.add('hidden');
    document.getElementById('saveRecord').classList.remove('hidden');

    const container = document.getElementById('recordContent');
    container.innerHTML = day.exercises.map((ex, exIdx) => {
      const setsHtml = Array.from({ length: ex.sets }, (_, setIdx) => {
        const weightVal = ex.isTimeBased ? '' : ex.weight;
        const repsMin = typeof ex.reps === 'string' ? ex.reps.split('-')[0] : ex.reps;
        return `
          <div class="record-set">
            <span class="set-label">S${setIdx + 1}</span>
            <input type="number" class="record-weight" data-ex="${exIdx}" data-set="${setIdx}"
              value="${weightVal}" placeholder="kg" step="${ex.weightIncrement || 1}"
              ${ex.isTimeBased ? 'disabled' : ''}>
            <input type="number" class="record-reps" data-ex="${exIdx}" data-set="${setIdx}"
              value="${repsMin}" placeholder="${ex.isTimeBased ? '秒' : '回'}" min="0">
          </div>
        `;
      }).join('');

      return `
        <div class="record-exercise" data-exercise-id="${ex.id}">
          <div class="record-exercise-name">${ex.name}</div>
          <div class="record-sets">${setsHtml}</div>
        </div>
      `;
    }).join('');

    container.dataset.dayIndex = this.currentDayIndex;
    container.dataset.dayName = day.name;
  },

  saveTrainingRecord() {
    const container = document.getElementById('recordContent');
    const dayIndex = parseInt(container.dataset.dayIndex);
    const dayName = container.dataset.dayName;
    const today = Recorder.getTodayString();

    const exerciseEls = container.querySelectorAll('.record-exercise');
    const exercises = Array.from(exerciseEls).map(el => {
      const exerciseId = el.dataset.exerciseId;
      const weightInputs = el.querySelectorAll('.record-weight');
      const repsInputs = el.querySelectorAll('.record-reps');
      const sets = Array.from(weightInputs).map((wInput, setIdx) => ({
        weight: parseFloat(wInput.value) || 0,
        reps: parseInt(repsInputs[setIdx].value) || 0,
      }));
      return { id: exerciseId, sets };
    });

    Recorder.saveRecord({ date: today, dayIndex, dayName, exercises });

    const msg = document.getElementById('recordMessage');
    msg.textContent = 'Record saved!';
    msg.className = 'message success';
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);

    const baseMenu = MenuGenerator.getMenu();
    if (baseMenu) {
      this.currentMenu = WeightAdjuster.adjustMenu(baseMenu);
    }
  },

  // === 進捗グラフ ===
  renderProgress() {
    const records = Recorder.getAllRecords();
    const notice = document.getElementById('progressNotice');
    const tabsEl = document.getElementById('progressTabs');
    const chartEl = document.getElementById('progressChart');
    const statsEl = document.getElementById('progressStats');

    if (records.length === 0) {
      notice.classList.remove('hidden');
      tabsEl.classList.add('hidden');
      chartEl.classList.add('hidden');
      statsEl.classList.add('hidden');
      return;
    }

    notice.classList.add('hidden');
    tabsEl.classList.remove('hidden');
    chartEl.classList.remove('hidden');
    statsEl.classList.remove('hidden');

    // 記録にある全種目を取得
    const exerciseIds = new Set();
    records.forEach(r => r.exercises.forEach(e => exerciseIds.add(e.id)));
    const exerciseList = Array.from(exerciseIds);

    // タブ生成
    const activeId = tabsEl.dataset.activeExercise || exerciseList[0];
    tabsEl.innerHTML = exerciseList.map(id => {
      const data = EXERCISES[id];
      const name = data ? data.name : id;
      const isActive = id === activeId ? 'active' : '';
      return `<button class="progress-tab ${isActive}" data-exercise="${id}">${name}</button>`;
    }).join('');

    tabsEl.querySelectorAll('.progress-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsEl.dataset.activeExercise = btn.dataset.exercise;
        this.renderProgress();
      });
    });

    // 選択中の種目のデータを集計
    this.renderExerciseChart(activeId, records);
    this.renderExerciseStats(activeId, records);
  },

  renderExerciseChart(exerciseId, records) {
    const reversed = [...records].reverse(); // 古い順
    const labels = [];
    const weights = [];
    const volumes = [];

    reversed.forEach(record => {
      const ex = record.exercises.find(e => e.id === exerciseId);
      if (!ex) return;
      const maxWeight = Math.max(...ex.sets.map(s => s.weight));
      const totalVolume = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      labels.push(Recorder.formatDate(record.date));
      weights.push(maxWeight);
      volumes.push(totalVolume);
    });

    if (this.chart) this.chart.destroy();

    const ctx = document.getElementById('exerciseChart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '最大重量 (kg)',
            data: weights,
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#4ade80',
          },
          {
            label: '総ボリューム (kg)',
            data: volumes,
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129, 140, 248, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#818cf8',
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            labels: { color: '#888', font: { size: 11, family: 'Inter' }, boxWidth: 12 }
          }
        },
        scales: {
          x: {
            ticks: { color: '#555', font: { size: 10 }, maxRotation: 45 },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            position: 'left',
            ticks: { color: '#4ade80', font: { size: 10 } },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'kg', color: '#4ade80', font: { size: 10 } }
          },
          y1: {
            position: 'right',
            ticks: { color: '#818cf8', font: { size: 10 } },
            grid: { display: false },
            title: { display: true, text: 'vol', color: '#818cf8', font: { size: 10 } }
          }
        }
      }
    });
  },

  renderExerciseStats(exerciseId, records) {
    const statsEl = document.getElementById('progressStats');
    const dataPoints = [];

    [...records].reverse().forEach(record => {
      const ex = record.exercises.find(e => e.id === exerciseId);
      if (!ex) return;
      const maxWeight = Math.max(...ex.sets.map(s => s.weight));
      const totalVolume = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const totalReps = ex.sets.reduce((sum, s) => sum + s.reps, 0);
      dataPoints.push({ date: record.date, maxWeight, totalVolume, totalReps });
    });

    if (dataPoints.length === 0) {
      statsEl.innerHTML = '<div class="stat-card"><div class="stat-label">データなし</div></div>';
      return;
    }

    const latest = dataPoints[dataPoints.length - 1];
    const first = dataPoints[0];
    const weightDiff = latest.maxWeight - first.maxWeight;
    const volumeDiff = latest.totalVolume - first.totalVolume;

    const weightChangeClass = weightDiff > 0 ? 'positive' : weightDiff < 0 ? 'negative' : 'neutral';
    const volumeChangeClass = volumeDiff > 0 ? 'positive' : volumeDiff < 0 ? 'negative' : 'neutral';
    const weightSign = weightDiff > 0 ? '+' : '';
    const volumeSign = volumeDiff > 0 ? '+' : '';

    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Max Weight</div>
        <div class="stat-value">${latest.maxWeight}kg</div>
        <div class="stat-change ${weightChangeClass}">${weightSign}${weightDiff}kg from start</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Volume</div>
        <div class="stat-value">${latest.totalVolume.toLocaleString()}kg</div>
        <div class="stat-change ${volumeChangeClass}">${volumeSign}${volumeDiff.toLocaleString()}kg</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sessions</div>
        <div class="stat-value">${dataPoints.length}</div>
        <div class="stat-change neutral">total records</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Last Reps</div>
        <div class="stat-value">${latest.totalReps}</div>
        <div class="stat-change neutral">total reps</div>
      </div>
    `;
  },

  // === 履歴表示 ===
  renderHistory() {
    const records = Recorder.getAllRecords();
    const container = document.getElementById('historyContent');
    const notice = document.getElementById('historyNotice');

    if (records.length === 0) {
      notice.classList.remove('hidden');
      container.innerHTML = '';
      return;
    }

    notice.classList.add('hidden');

    container.innerHTML = records.map((record, idx) => {
      // 総ボリューム計算
      let totalVolume = 0;
      const exercisesHtml = record.exercises.map(ex => {
        const exerciseData = EXERCISES[ex.id];
        const name = exerciseData ? exerciseData.name : ex.id;
        let exVolume = 0;
        const setsStr = ex.sets.map((s, i) => {
          exVolume += s.weight * s.reps;
          return `${s.weight}kg &times; ${s.reps}`;
        }).join(' / ');
        totalVolume += exVolume;

        return `
          <div class="history-exercise">
            <div class="history-exercise-name">${name}</div>
            <div class="history-set-list">${setsStr}</div>
            <div class="history-volume">Vol: ${exVolume.toLocaleString()}kg</div>
          </div>
        `;
      }).join('');

      const exCount = record.exercises.length;

      return `
        <div class="history-day ${idx === 0 ? 'open' : ''}" data-idx="${idx}">
          <div class="history-day-header" onclick="App.toggleHistory(${idx})">
            <div>
              <div>${Recorder.formatDate(record.date)}</div>
              <div class="history-day-meta">${record.dayName || ''} &middot; ${exCount}種目 &middot; ${totalVolume.toLocaleString()}kg</div>
            </div>
            <span class="history-toggle">&#9660;</span>
          </div>
          <div class="history-day-body">${exercisesHtml}</div>
        </div>
      `;
    }).join('');
  },

  toggleHistory(idx) {
    const el = document.querySelector(`.history-day[data-idx="${idx}"]`);
    if (el) el.classList.toggle('open');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
