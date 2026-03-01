// === メインアプリケーション ===
const App = {
  currentDayIndex: 0,
  currentMenu: null,
  addedExercises: [],
  chart: null,
  bodyCompChart: null,
  progressMode: 'training',
  restTimerId: null,
  restTimeLeft: 0,
  restTotalTime: 0,

  init() {
    this.setupTabs();
    this.setupProfile();
    this.setupWorkout();
    this.setupGuide();

    ProfileManager.loadFormValues();

    const menu = MenuGenerator.getMenu();
    if (menu) {
      this.currentMenu = WeightAdjuster.adjustMenu(menu);
    }

    this.renderWorkout();
  },

  // === タブ切り替え ===
  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('[data-tab]').forEach(btn => {
      if (!btn.classList.contains('tab-btn')) {
        btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
      }
    });
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (tabBtn) tabBtn.classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'workout') this.renderWorkout();
    else if (tabId === 'progress') this.renderProgress();
    else if (tabId === 'history') this.renderHistory();
  },

  // === SETTINGS ===
  setupProfile() {
    document.getElementById('saveProfile').addEventListener('click', () => {
      const profile = ProfileManager.getFormValues();
      const errors = ProfileManager.validate(profile);
      const msg = document.getElementById('profileMessage');

      if (errors.length > 0) {
        msg.textContent = errors.join('\u3001');
        msg.className = 'message error';
        msg.classList.remove('hidden');
        return;
      }

      ProfileManager.saveProfile(profile);
      const menu = MenuGenerator.generate(profile);
      this.currentMenu = WeightAdjuster.adjustMenu(menu);
      this.currentDayIndex = 0;
      this.addedExercises = [];

      msg.textContent = '\u30e1\u30cb\u30e5\u30fc\u3092\u751f\u6210\u3057\u307e\u3057\u305f\uff01';
      msg.className = 'message success';
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 3000);
    });

    document.getElementById('saveBodyComp').addEventListener('click', () => {
      const profile = ProfileManager.getFormValues();
      if (!profile.weight) {
        alert('\u4f53\u91cd\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044');
        return;
      }
      Recorder.saveBodyComp({
        date: Recorder.getTodayString(),
        weight: profile.weight,
        bodyFat: profile.bodyFat,
        muscleMass: profile.muscleMass
      });
      const msg = document.getElementById('bodyCompMessage');
      msg.textContent = '\u4f53\u7d44\u6210\u3092\u8a18\u9332\u3057\u307e\u3057\u305f\uff01';
      msg.className = 'message success';
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 3000);
    });
  },

  // === WORKOUT ===
  setupWorkout() {
    document.getElementById('prevDay').addEventListener('click', () => {
      if (!this.currentMenu) return;
      this.currentDayIndex = (this.currentDayIndex - 1 + this.currentMenu.days.length) % this.currentMenu.days.length;
      this.addedExercises = [];
      this.renderWorkout();
    });
    document.getElementById('nextDay').addEventListener('click', () => {
      if (!this.currentMenu) return;
      this.currentDayIndex = (this.currentDayIndex + 1) % this.currentMenu.days.length;
      this.addedExercises = [];
      this.renderWorkout();
    });
    document.getElementById('saveWorkout').addEventListener('click', () => {
      this.saveWorkout();
    });
  },

  estimateTime(day) {
    let sec = 5 * 60; // ウォームアップ・ストレッチ
    const allExercises = [...day.exercises, ...this.addedExercises];
    allExercises.forEach(ex => {
      sec += ex.sets * 50;                          // 1セットの実施時間
      sec += (ex.sets - 1) * (ex.rest || 75);       // セット間休憩（最終セット後は不要）
      sec += 150;                                    // 種目間の移動・準備・片付け
    });
    return Math.round(sec / 60);
  },

  renderWorkout() {
    if (!this.currentMenu) {
      document.getElementById('workoutNotice').classList.remove('hidden');
      document.getElementById('weekProgress').classList.add('hidden');
      document.getElementById('workoutDaySelector').classList.add('hidden');
      document.getElementById('workoutSummary').classList.add('hidden');
      document.getElementById('workoutContent').innerHTML = '';
      document.getElementById('saveWorkout').classList.add('hidden');
      return;
    }

    document.getElementById('workoutNotice').classList.add('hidden');
    document.getElementById('weekProgress').classList.remove('hidden');
    document.getElementById('workoutDaySelector').classList.remove('hidden');
    document.getElementById('workoutSummary').classList.remove('hidden');
    document.getElementById('saveWorkout').classList.remove('hidden');

    // 週の進捗
    const profile = ProfileManager.getProfile();
    if (profile) {
      const records = Recorder.getAllRecords();
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const thisWeekRecords = records.filter(r => new Date(r.date + 'T00:00:00') >= monday);
      const freq = profile.frequency;
      document.getElementById('weekCount').textContent = `${thisWeekRecords.length} / ${freq}`;
      const dotsEl = document.getElementById('weekDots');
      const dots = [];
      for (let i = 0; i < freq; i++) {
        dots.push(`<div class="week-dot ${i < thisWeekRecords.length ? 'done' : ''}"></div>`);
      }
      dotsEl.innerHTML = dots.join('');
    }

    const day = this.currentMenu.days[this.currentDayIndex];
    document.getElementById('currentDay').textContent = day.name;

    const totalEx = day.exercises.length + this.addedExercises.length;
    document.getElementById('wkExCount').textContent = totalEx;
    document.getElementById('wkTime').textContent = `\u7d04${this.estimateTime(day)}\u5206`;

    const container = document.getElementById('workoutContent');

    // スワイプヒント
    const hintHtml = '<div class="swipe-hint"><span class="swipe-hint-arrow">&larr;</span> スワイプで種目を削除</div>';

    // 生成メニュー
    const menuHtml = day.exercises.map((ex, i) => this.wrapExCard(ex, i, false)).join('');
    // 追加種目
    const addedHtml = this.addedExercises.map((ex, i) => {
      return this.wrapExCard(ex, day.exercises.length + i, true);
    }).join('');
    // 種目追加セレクター
    const selectorHtml = this.buildExSelector(day);

    container.innerHTML = hintHtml + menuHtml + addedHtml + selectorHtml;

    // スワイプイベントをセットアップ
    this.setupSwipe();
  },

  wrapExCard(ex, exIdx, isAdded) {
    const cardHtml = this.renderExCard(ex, exIdx, isAdded);
    return `
      <div class="wk-exercise-wrapper" data-ex-idx="${exIdx}">
        <div class="wk-exercise-delete-bg" onclick="App.deleteExercise(${exIdx})">削除</div>
        ${cardHtml}
      </div>
    `;
  },

  renderExCard(ex, exIdx, isAdded) {
    const weightVal = ex.isTimeBased ? '' : ex.weight;
    const repsMin = typeof ex.reps === 'string' ? ex.reps.split('-')[0] : ex.reps;
    const illustSvg = ILLUST.get(ex.id);

    // 前回記録
    const prevRecord = Recorder.getLatestForExercise(ex.id);
    let prevHtml = '';
    if (prevRecord) {
      const prevSets = prevRecord.sets.map(s => `${s.weight}kg\u00d7${s.reps}`).join(' / ');
      prevHtml = `<div class="wk-prev-record">\u524d\u56de: <span>${prevSets}</span></div>`;
    }

    const setsHtml = Array.from({ length: ex.sets }, (_, si) => `
      <div class="wk-set-row">
        <span class="wk-set-label">S${si + 1}</span>
        <input type="number" class="wk-weight" data-ex="${exIdx}" data-set="${si}"
          value="${weightVal}" placeholder="kg" step="${ex.weightIncrement || 1}"
          ${ex.isTimeBased ? 'disabled' : ''}>
        <input type="number" class="wk-reps" data-ex="${exIdx}" data-set="${si}"
          value="${repsMin}" placeholder="${ex.isTimeBased ? '\u79d2' : '\u56de'}" min="0">
        <button class="wk-check" data-ex="${exIdx}" data-set="${si}" onclick="App.toggleCheck(this)">\u2713</button>
      </div>
    `).join('');

    const setsControlHtml = `
      <div class="wk-sets-control">
        <button class="wk-set-adjust" onclick="App.adjustSets(${exIdx}, -1)">\u2212 \u30bb\u30c3\u30c8\u524a\u9664</button>
        <button class="wk-set-adjust" onclick="App.adjustSets(${exIdx}, 1)">+ \u30bb\u30c3\u30c8\u8ffd\u52a0</button>
      </div>
    `;

    const adjustHtml = ex.weightReason && ex.weightReason !== '\u8a18\u9332\u306a\u3057\uff08\u521d\u56de\uff09'
      ? `<div class="exercise-adjustment ${ex.weightChange}">${ex.weightReason}</div>` : '';

    const removeBtn = '';

    const exerciseData = EXERCISES[ex.id];
    const tipHtml = exerciseData && exerciseData.tip
      ? `<div class="wk-tip">${exerciseData.tip}</div>` : '';

    return `
      <div class="wk-exercise" data-exercise-id="${ex.id}" data-ex-idx="${exIdx}">
        <div class="wk-exercise-inner">
          <div class="wk-exercise-illust">${illustSvg}</div>
          <div class="wk-exercise-content">
            <div class="wk-exercise-header">
              <span class="wk-exercise-name">${ex.name}</span>
              <span class="wk-exercise-target">${ex.target}</span>
              ${removeBtn}
            </div>
            ${adjustHtml}
            ${prevHtml}
            <div class="wk-sets">${setsHtml}</div>
            ${setsControlHtml}
            ${tipHtml}
          </div>
        </div>
      </div>
    `;
  },

  buildExSelector(day) {
    const usedIds = new Set(day.exercises.map(e => e.id));
    this.addedExercises.forEach(e => { if (!e.id.startsWith('custom_')) usedIds.add(e.id); });

    let opts = '<option value="">\uff0b \u7a2e\u76ee\u3092\u8ffd\u52a0</option>';
    Object.entries(ILLUST.categories).forEach(([label, ids]) => {
      const available = ids.filter(id => !usedIds.has(id));
      if (available.length === 0) return;
      opts += `<optgroup label="${label}">`;
      available.forEach(id => {
        opts += `<option value="${id}">${EXERCISES[id].name}</option>`;
      });
      opts += '</optgroup>';
    });
    opts += '<option value="__custom__">\u30ab\u30b9\u30bf\u30e0\u7a2e\u76ee\u3092\u5165\u529b...</option>';

    return `
      <div class="add-exercise-area">
        <select class="add-exercise-select" onchange="App.addExercise(this.value); this.value='';">
          ${opts}
        </select>
      </div>
    `;
  },

  addExercise(value) {
    if (!value) return;

    if (value === '__custom__') {
      const name = prompt('\u7a2e\u76ee\u540d\u3092\u5165\u529b:');
      if (!name) return;
      this.addedExercises.push({
        id: 'custom_' + Date.now(), name, target: '\u30ab\u30b9\u30bf\u30e0',
        sets: 3, reps: 10, weight: 0, weightIncrement: 2.5, rest: 60, isTimeBased: false
      });
    } else {
      const data = EXERCISES[value];
      if (!data) return;
      const profile = ProfileManager.getProfile();
      const goal = profile?.goal || 'hypertrophy';
      const goalConfig = GOAL_SETTINGS[goal];
      const typeConfig = data.type === 'compound' ? goalConfig.compound : goalConfig.isolation;
      const rest = data.type === 'compound' ? goalConfig.restCompound : goalConfig.restIsolation;
      const weight = profile ? MenuGenerator.calculateWeight(data, profile) : 0;
      this.addedExercises.push({
        id: value, name: data.name, target: data.target,
        sets: 3, reps: typeConfig.reps, weight, weightIncrement: data.weightIncrement,
        rest: rest, isTimeBased: data.isTimeBased || false
      });
    }
    this.renderWorkout();
  },

  removeAdded(exIdx) {
    const day = this.currentMenu.days[this.currentDayIndex];
    const addedIdx = exIdx - day.exercises.length;
    if (addedIdx >= 0 && addedIdx < this.addedExercises.length) {
      this.addedExercises.splice(addedIdx, 1);
      this.renderWorkout();
    }
  },

  adjustSets(exIdx, delta) {
    const day = this.currentMenu.days[this.currentDayIndex];
    let exercise;
    if (exIdx < day.exercises.length) {
      exercise = day.exercises[exIdx];
    } else {
      exercise = this.addedExercises[exIdx - day.exercises.length];
    }
    if (!exercise) return;
    const newSets = exercise.sets + delta;
    if (newSets < 1 || newSets > 10) return;
    exercise.sets = newSets;
    this.renderWorkout();
  },

  toggleCheck(btn) {
    btn.classList.toggle('checked');
    const card = btn.closest('.wk-exercise');
    const allChecks = card.querySelectorAll('.wk-check');
    const allChecked = Array.from(allChecks).every(c => c.classList.contains('checked'));
    card.classList.toggle('completed', allChecked);

    if (btn.classList.contains('checked')) {
      const exIdx = parseInt(btn.dataset.ex);
      const day = this.currentMenu.days[this.currentDayIndex];
      let exercise;
      if (exIdx < day.exercises.length) {
        exercise = day.exercises[exIdx];
      } else {
        exercise = this.addedExercises[exIdx - day.exercises.length];
      }

      // PR判定: 入力重量が過去最大を超えているか
      const exerciseId = card.dataset.exerciseId;
      const setRow = btn.closest('.wk-set-row');
      const currentWeight = parseFloat(setRow.querySelector('.wk-weight').value) || 0;
      if (currentWeight > 0 && !card.classList.contains('pr-achieved')) {
        const historicalMax = Recorder.getMaxWeightForExercise(exerciseId);
        if (currentWeight > historicalMax && historicalMax > 0) {
          card.classList.add('pr-achieved');
          const header = card.querySelector('.wk-exercise-header');
          if (header && !header.querySelector('.pr-badge')) {
            const badge = document.createElement('span');
            badge.className = 'pr-badge';
            badge.textContent = '自己ベスト';
            header.appendChild(badge);
          }
          if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        }
      }

      // レストタイマー開始
      const restTime = exercise ? (exercise.rest || 90) : 90;
      this.startRestTimer(restTime);
    }
  },

  // === REST TIMER ===
  startRestTimer(seconds) {
    this.skipTimer();
    this.restTimeLeft = seconds;
    this.restTotalTime = seconds;
    document.getElementById('restTimer').classList.remove('hidden');
    this.updateTimerDisplay();

    this.restTimerId = setInterval(() => {
      this.restTimeLeft--;
      this.updateTimerDisplay();
      if (this.restTimeLeft <= 0) {
        this.skipTimer();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const min = Math.floor(this.restTimeLeft / 60);
    const sec = this.restTimeLeft % 60;
    document.getElementById('restTimerTime').textContent =
      min > 0 ? `${min}:${String(sec).padStart(2, '0')}` : sec;
    const pct = (this.restTimeLeft / this.restTotalTime) * 100;
    document.getElementById('restTimerProgress').style.width = pct + '%';
  },

  skipTimer() {
    if (this.restTimerId) {
      clearInterval(this.restTimerId);
      this.restTimerId = null;
    }
    const timerEl = document.getElementById('restTimer');
    if (timerEl) timerEl.classList.add('hidden');
  },

  saveWorkout() {
    const day = this.currentMenu.days[this.currentDayIndex];
    const today = Recorder.getTodayString();

    const exerciseEls = document.querySelectorAll('#workoutContent .wk-exercise');
    const exercises = [];

    exerciseEls.forEach(el => {
      const exerciseId = el.dataset.exerciseId;
      const setRows = el.querySelectorAll('.wk-set-row');
      const sets = [];

      setRows.forEach(row => {
        const checkBtn = row.querySelector('.wk-check');
        if (!checkBtn || !checkBtn.classList.contains('checked')) return;
        const weight = parseFloat(row.querySelector('.wk-weight').value) || 0;
        const reps = parseInt(row.querySelector('.wk-reps').value) || 0;
        sets.push({ weight, reps });
      });

      if (sets.length > 0) {
        exercises.push({ id: exerciseId, sets });
      }
    });

    if (exercises.length === 0) {
      const msg = document.getElementById('workoutMessage');
      msg.textContent = 'チェック（✓）されたセットがありません';
      msg.className = 'message error';
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 3000);
      return;
    }

    Recorder.saveRecord({
      date: today,
      dayIndex: this.currentDayIndex,
      dayName: day.name,
      exercises,
    });

    const msg = document.getElementById('workoutMessage');
    msg.textContent = '\u8a18\u9332\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\uff01';
    msg.className = 'message success';
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);

    this.skipTimer();
    this.currentDayIndex = (this.currentDayIndex + 1) % this.currentMenu.days.length;
    this.addedExercises = [];

    const baseMenu = MenuGenerator.getMenu();
    if (baseMenu) {
      this.currentMenu = WeightAdjuster.adjustMenu(baseMenu);
    }
  },

  // === PROGRESS ===
  renderProgress() {
    const records = Recorder.getAllRecords();
    const bodyCompRecords = Recorder.getBodyCompRecords();
    const notice = document.getElementById('progressNotice');
    const modeToggle = document.getElementById('progressModeToggle');
    const tabsEl = document.getElementById('progressTabs');
    const chartEl = document.getElementById('progressChart');
    const statsEl = document.getElementById('progressStats');
    const bodyChartEl = document.getElementById('bodyCompChart');
    const bodyStatsEl = document.getElementById('bodyCompStats');

    const hasTraining = records.length > 0;
    const hasBodyComp = bodyCompRecords.length > 0;

    // 全要素を一旦非表示
    [notice, modeToggle, tabsEl, chartEl, statsEl, bodyChartEl, bodyStatsEl]
      .forEach(el => el.classList.add('hidden'));

    if (!hasTraining && !hasBodyComp) {
      notice.querySelector('p').textContent = '\u30c8\u30ec\u30fc\u30cb\u30f3\u30b0\u8a18\u9332\u304c\u84c4\u7a4d\u3055\u308c\u308b\u3068\u30b0\u30e9\u30d5\u304c\u8868\u793a\u3055\u308c\u307e\u3059';
      notice.classList.remove('hidden');
      return;
    }

    modeToggle.classList.remove('hidden');
    modeToggle.querySelectorAll('.progress-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.progressMode);
      btn.onclick = () => {
        this.progressMode = btn.dataset.mode;
        this.renderProgress();
      };
    });

    if (this.progressMode === 'training') {
      if (!hasTraining) {
        notice.querySelector('p').textContent = '\u30c8\u30ec\u30fc\u30cb\u30f3\u30b0\u8a18\u9332\u304c\u84c4\u7a4d\u3055\u308c\u308b\u3068\u30b0\u30e9\u30d5\u304c\u8868\u793a\u3055\u308c\u307e\u3059';
        notice.classList.remove('hidden');
        return;
      }
      tabsEl.classList.remove('hidden');
      chartEl.classList.remove('hidden');
      statsEl.classList.remove('hidden');

      const exerciseIds = new Set();
      records.forEach(r => r.exercises.forEach(e => exerciseIds.add(e.id)));

      const firstId = Array.from(exerciseIds)[0];
      const activeId = tabsEl.dataset.activeExercise || firstId;

      // 部位別にカテゴライズして表示
      let tabsHtml = '';
      Object.entries(ILLUST.categories).forEach(([category, ids]) => {
        const matched = ids.filter(id => exerciseIds.has(id));
        if (matched.length === 0) return;
        tabsHtml += `<div class="progress-category-label">${category}</div>`;
        tabsHtml += matched.map(id => {
          const data = EXERCISES[id];
          const name = data ? data.name : id;
          return `<button class="progress-tab ${id === activeId ? 'active' : ''}" data-exercise="${id}">${name}</button>`;
        }).join('');
      });

      // カテゴリに属さないカスタム種目
      const categorizedIds = new Set(Object.values(ILLUST.categories).flat());
      const uncategorized = Array.from(exerciseIds).filter(id => !categorizedIds.has(id));
      if (uncategorized.length > 0) {
        tabsHtml += `<div class="progress-category-label">その他</div>`;
        tabsHtml += uncategorized.map(id => {
          return `<button class="progress-tab ${id === activeId ? 'active' : ''}" data-exercise="${id}">${id}</button>`;
        }).join('');
      }

      tabsEl.innerHTML = tabsHtml;

      tabsEl.querySelectorAll('.progress-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          tabsEl.dataset.activeExercise = btn.dataset.exercise;
          this.renderProgress();
        });
      });

      this.renderExerciseChart(activeId, records);
      this.renderExerciseStats(activeId, records);
    } else {
      if (!hasBodyComp) {
        notice.querySelector('p').textContent = 'Settings\u3067\u4f53\u7d44\u6210\u3092\u8a18\u9332\u3059\u308b\u3068\u30b0\u30e9\u30d5\u304c\u8868\u793a\u3055\u308c\u307e\u3059';
        notice.classList.remove('hidden');
        return;
      }
      bodyChartEl.classList.remove('hidden');
      bodyStatsEl.classList.remove('hidden');
      this.renderBodyCompChart(bodyCompRecords);
      this.renderBodyCompStats(bodyCompRecords);
    }
  },

  renderExerciseChart(exerciseId, records) {
    const reversed = [...records].reverse();
    const labels = [];
    const weights = [];
    const volumes = [];

    reversed.forEach(record => {
      const ex = record.exercises.find(e => e.id === exerciseId);
      if (!ex) return;
      labels.push(Recorder.formatDate(record.date));
      weights.push(Math.max(...ex.sets.map(s => s.weight)));
      volumes.push(ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0));
    });

    if (this.chart) this.chart.destroy();

    const ctx = document.getElementById('exerciseChart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '\u6700\u5927\u91cd\u91cf (kg)',
            data: weights,
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#4ade80',
          },
          {
            label: '\u7dcf\u30dc\u30ea\u30e5\u30fc\u30e0 (kg)',
            data: volumes,
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129, 140, 248, 0.1)',
            fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#818cf8',
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { labels: { color: '#888', font: { size: 11, family: 'Inter' }, boxWidth: 12 } }
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
      dataPoints.push({
        maxWeight: Math.max(...ex.sets.map(s => s.weight)),
        totalVolume: ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
        totalReps: ex.sets.reduce((sum, s) => sum + s.reps, 0),
      });
    });

    if (dataPoints.length === 0) { statsEl.innerHTML = ''; return; }

    const latest = dataPoints[dataPoints.length - 1];
    const first = dataPoints[0];
    const wDiff = latest.maxWeight - first.maxWeight;
    const vDiff = latest.totalVolume - first.totalVolume;
    const wClass = wDiff > 0 ? 'positive' : wDiff < 0 ? 'negative' : 'neutral';
    const vClass = vDiff > 0 ? 'positive' : vDiff < 0 ? 'negative' : 'neutral';

    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">\u6700\u5927\u91cd\u91cf</div>
        <div class="stat-value">${latest.maxWeight}kg</div>
        <div class="stat-change ${wClass}">${wDiff > 0 ? '+' : ''}${wDiff}kg</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">\u30dc\u30ea\u30e5\u30fc\u30e0</div>
        <div class="stat-value">${latest.totalVolume.toLocaleString()}kg</div>
        <div class="stat-change ${vClass}">${vDiff > 0 ? '+' : ''}${vDiff.toLocaleString()}kg</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">\u30bb\u30c3\u30b7\u30e7\u30f3\u6570</div>
        <div class="stat-value">${dataPoints.length}</div>
        <div class="stat-change neutral">\u56de</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">\u524d\u56de\u30ec\u30c3\u30d7</div>
        <div class="stat-value">${latest.totalReps}</div>
        <div class="stat-change neutral">\u56de</div>
      </div>
    `;
  },

  // === BODY COMPOSITION ===
  renderBodyCompChart(records) {
    const reversed = [...records].reverse();
    const labels = reversed.map(r => Recorder.formatDate(r.date));
    const weights = reversed.map(r => r.weight);
    const bodyFats = reversed.map(r => r.bodyFat);
    const muscleMasses = reversed.map(r => r.muscleMass);

    if (this.bodyCompChart) this.bodyCompChart.destroy();

    const ctx = document.getElementById('bodyCompCanvas').getContext('2d');

    const datasets = [
      {
        label: '\u4f53\u91cd (kg)',
        data: weights,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#4ade80',
      }
    ];

    if (bodyFats.some(v => v != null)) {
      datasets.push({
        label: '\u4f53\u8102\u80aa\u7387 (%)',
        data: bodyFats,
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#f87171',
        yAxisID: 'y1',
      });
    }

    if (muscleMasses.some(v => v != null)) {
      datasets.push({
        label: '\u9aa8\u683c\u7b4b\u91cf (kg)',
        data: muscleMasses,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#818cf8',
      });
    }

    const scales = {
      x: {
        ticks: { color: '#555', font: { size: 10 }, maxRotation: 45 },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        position: 'left',
        ticks: { color: '#4ade80', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        title: { display: true, text: 'kg', color: '#4ade80', font: { size: 10 } }
      }
    };

    if (bodyFats.some(v => v != null)) {
      scales.y1 = {
        position: 'right',
        ticks: { color: '#f87171', font: { size: 10 } },
        grid: { display: false },
        title: { display: true, text: '%', color: '#f87171', font: { size: 10 } }
      };
    }

    this.bodyCompChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { labels: { color: '#888', font: { size: 11, family: 'Inter' }, boxWidth: 12 } }
        },
        scales
      }
    });
  },

  renderBodyCompStats(records) {
    const statsEl = document.getElementById('bodyCompStats');
    if (records.length === 0) { statsEl.innerHTML = ''; return; }

    const latest = records[0];
    const oldest = records[records.length - 1];

    let html = '';

    const wDiff = latest.weight - oldest.weight;
    html += `
      <div class="stat-card">
        <div class="stat-label">\u73fe\u5728\u306e\u4f53\u91cd</div>
        <div class="stat-value">${latest.weight}kg</div>
        <div class="stat-change neutral">${wDiff > 0 ? '+' : ''}${wDiff.toFixed(1)}kg</div>
      </div>
    `;

    if (latest.bodyFat != null) {
      const bfDiff = latest.bodyFat - (oldest.bodyFat || latest.bodyFat);
      const bfClass = bfDiff < 0 ? 'positive' : bfDiff > 0 ? 'negative' : 'neutral';
      html += `
        <div class="stat-card">
          <div class="stat-label">\u4f53\u8102\u80aa\u7387</div>
          <div class="stat-value">${latest.bodyFat}%</div>
          <div class="stat-change ${bfClass}">${bfDiff > 0 ? '+' : ''}${bfDiff.toFixed(1)}%</div>
        </div>
      `;
    }

    if (latest.muscleMass != null) {
      const mmDiff = latest.muscleMass - (oldest.muscleMass || latest.muscleMass);
      const mmClass = mmDiff > 0 ? 'positive' : mmDiff < 0 ? 'negative' : 'neutral';
      html += `
        <div class="stat-card">
          <div class="stat-label">\u9aa8\u683c\u7b4b\u91cf</div>
          <div class="stat-value">${latest.muscleMass}kg</div>
          <div class="stat-change ${mmClass}">${mmDiff > 0 ? '+' : ''}${mmDiff.toFixed(1)}kg</div>
        </div>
      `;
    }

    html += `
      <div class="stat-card">
        <div class="stat-label">\u8a18\u9332\u6570</div>
        <div class="stat-value">${records.length}</div>
        <div class="stat-change neutral">\u56de</div>
      </div>
    `;

    statsEl.innerHTML = html;
  },

  // === HISTORY ===
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
      let totalVolume = 0;
      const exercisesHtml = record.exercises.map(ex => {
        const exerciseData = EXERCISES[ex.id];
        const name = exerciseData ? exerciseData.name : ex.id;
        let exVol = 0;
        const setsStr = ex.sets.map(s => {
          exVol += s.weight * s.reps;
          return `${s.weight}kg \u00d7 ${s.reps}`;
        }).join(' / ');
        totalVolume += exVol;
        return `
          <div class="history-exercise">
            <div class="history-exercise-name">${name}</div>
            <div class="history-set-list">${setsStr}</div>
            <div class="history-volume">Vol: ${exVol.toLocaleString()}kg</div>
          </div>
        `;
      }).join('');

      return `
        <div class="history-day ${idx === 0 ? 'open' : ''}" data-idx="${idx}">
          <div class="history-day-header" onclick="App.toggleHistory(${idx})">
            <div>
              <div>${Recorder.formatDate(record.date)}</div>
              <div class="history-day-meta">${record.dayName || ''} \u00b7 ${record.exercises.length}\u7a2e\u76ee \u00b7 ${totalVolume.toLocaleString()}kg</div>
            </div>
            <div class="history-actions">
              <button class="history-delete" onclick="event.stopPropagation(); App.deleteRecord('${record.date}')" title="\u524a\u9664">\u00d7</button>
              <span class="history-toggle">\u25bc</span>
            </div>
          </div>
          <div class="history-day-body">${exercisesHtml}</div>
        </div>
      `;
    }).join('');
  },

  deleteRecord(date) {
    if (!confirm(`${Recorder.formatDate(date)} \u306e\u8a18\u9332\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f`)) return;
    Recorder.deleteRecord(date);
    const baseMenu = MenuGenerator.getMenu();
    if (baseMenu) {
      this.currentMenu = WeightAdjuster.adjustMenu(baseMenu);
    }
    this.renderHistory();
  },

  toggleHistory(idx) {
    const el = document.querySelector(`.history-day[data-idx="${idx}"]`);
    if (el) el.classList.toggle('open');
  },

  // === GUIDE ===
  setupGuide() {
    document.querySelectorAll('.guide-header').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.guide-item').classList.toggle('open');
      });
    });

    // Settings セクション開閉
    document.querySelectorAll('.settings-section-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.closest('.settings-section');
        if (section.classList.contains('always-open')) return;
        section.classList.toggle('open');
      });
    });

    // Chip toggle
    document.querySelectorAll('.chip-group .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });
  },

  // === SWIPE TO DELETE ===
  setupSwipe() {
    const container = document.getElementById('workoutContent');
    if (!container) return;

    let startX = 0, startY = 0, currentX = 0, swiping = false, activeWrapper = null;

    container.addEventListener('touchstart', (e) => {
      const wrapper = e.target.closest('.wk-exercise-wrapper');
      if (!wrapper) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = 0;
      swiping = false;
      activeWrapper = wrapper;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!activeWrapper) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // 水平移動が垂直より大きい場合のみスワイプ判定
      if (!swiping && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        swiping = true;
      }

      if (!swiping) return;
      e.preventDefault();

      currentX = Math.min(0, dx); // 左方向のみ
      const card = activeWrapper.querySelector('.wk-exercise');
      if (card) {
        card.style.transition = 'none';
        card.style.transform = `translateX(${currentX}px)`;
      }
    }, { passive: false });

    container.addEventListener('touchend', () => {
      if (!activeWrapper) return;
      const card = activeWrapper.querySelector('.wk-exercise');
      if (!card) { activeWrapper = null; return; }

      card.style.transition = 'transform 0.2s ease';

      if (currentX < -80) {
        // 削除ボタン表示状態で固定
        card.style.transform = 'translateX(-80px)';
        activeWrapper.classList.add('swiped');
      } else {
        card.style.transform = 'translateX(0)';
        activeWrapper.classList.remove('swiped');
      }
      activeWrapper = null;
      swiping = false;
    }, { passive: true });
  },

  // スワイプ削除実行
  deleteExercise(exIdx) {
    const day = this.currentMenu.days[this.currentDayIndex];
    if (exIdx < day.exercises.length) {
      day.exercises.splice(exIdx, 1);
      // メニューをlocalStorageに反映
      const menu = MenuGenerator.getMenu();
      if (menu && menu.days[this.currentDayIndex]) {
        menu.days[this.currentDayIndex].exercises = day.exercises;
        localStorage.setItem(MenuGenerator.STORAGE_KEY, JSON.stringify(menu));
      }
    } else {
      const addedIdx = exIdx - day.exercises.length;
      if (addedIdx >= 0 && addedIdx < this.addedExercises.length) {
        this.addedExercises.splice(addedIdx, 1);
      }
    }
    this.renderWorkout();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
