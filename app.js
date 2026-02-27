// === メインアプリケーション ===
const App = {
  currentDayIndex: 0,
  currentMenu: null,

  init() {
    this.setupTabs();
    this.setupProfile();
    this.setupMenu();
    this.setupRecord();
    this.setupHistory();

    // 保存済みプロフィールがあればロード
    ProfileManager.loadFormValues();

    // メニューがあれば表示
    const menu = MenuGenerator.getMenu();
    if (menu) {
      this.currentMenu = WeightAdjuster.adjustMenu(menu);
      this.renderMenu();
    }

    // 履歴を表示
    this.renderHistory();
  },

  // === タブ切り替え ===
  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // notice内のボタンもタブ切り替え
    document.querySelectorAll('.notice .btn-secondary[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    // タブ切り替え時の更新処理
    if (tabId === 'menu') {
      const menu = MenuGenerator.getMenu();
      if (menu) {
        this.currentMenu = WeightAdjuster.adjustMenu(menu);
        this.renderMenu();
      } else {
        this.showMenuNotice();
      }
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

      // メニュー生成
      const menu = MenuGenerator.generate(profile);
      this.currentMenu = WeightAdjuster.adjustMenu(menu);

      msg.textContent = 'プロフィールを保存し、メニューを生成しました！';
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
    document.getElementById('menuDaySelector').classList.remove('hidden');
    document.getElementById('startTraining').classList.remove('hidden');

    this.renderMenuDay();
  },

  renderMenuDay() {
    const day = this.currentMenu.days[this.currentDayIndex];
    document.getElementById('currentDay').textContent = day.name;

    const container = document.getElementById('menuContent');
    container.innerHTML = day.exercises.map(ex => {
      const changeIcon = ex.weightChange === 'up' ? '<span class="weight-change weight-up">&#9650;</span>'
        : ex.weightChange === 'down' ? '<span class="weight-change weight-down">&#9660;</span>'
        : ex.weightChange === 'same' && ex.weightReason !== '記録なし（初回）'
          ? '<span class="weight-change weight-same">&#9654;</span>'
          : '';

      const weightDisplay = ex.isTimeBased ? '-' : `${ex.weight}kg${changeIcon}`;
      const restDisplay = `${ex.rest}秒`;

      return `
        <div class="exercise-card">
          <div class="exercise-header">
            <span class="exercise-name">${ex.name}</span>
            <span class="exercise-target">${ex.target}</span>
          </div>
          <div class="exercise-detail">
            <div class="detail-item">
              <span class="detail-label">重量</span>
              <span class="detail-value">${weightDisplay}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">回数</span>
              <span class="detail-value">${ex.reps}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">セット</span>
              <span class="detail-value">${ex.sets}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">休憩</span>
              <span class="detail-value">${restDisplay}</span>
            </div>
          </div>
          ${ex.weightReason && ex.weightReason !== '記録なし（初回）' ? `<div class="exercise-tip" style="margin-bottom:8px;border-left-color:${ex.weightChange === 'up' ? 'var(--success)' : ex.weightChange === 'down' ? 'var(--danger)' : 'var(--warning)'}">重量調整: ${ex.weightReason}</div>` : ''}
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
            <span class="set-label">Set ${setIdx + 1}</span>
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

    // 記録フォームのday情報を保持
    container.dataset.dayIndex = this.currentDayIndex;
    container.dataset.dayName = day.name;
  },

  saveTrainingRecord() {
    const container = document.getElementById('recordContent');
    const dayIndex = parseInt(container.dataset.dayIndex);
    const dayName = container.dataset.dayName;
    const today = Recorder.getTodayString();

    const exerciseEls = container.querySelectorAll('.record-exercise');
    const exercises = Array.from(exerciseEls).map((el, exIdx) => {
      const exerciseId = el.dataset.exerciseId;
      const weightInputs = el.querySelectorAll('.record-weight');
      const repsInputs = el.querySelectorAll('.record-reps');

      const sets = Array.from(weightInputs).map((wInput, setIdx) => ({
        weight: parseFloat(wInput.value) || 0,
        reps: parseInt(repsInputs[setIdx].value) || 0,
      }));

      return { id: exerciseId, sets };
    });

    const record = {
      date: today,
      dayIndex,
      dayName,
      exercises,
    };

    Recorder.saveRecord(record);

    const msg = document.getElementById('recordMessage');
    msg.textContent = 'トレーニング記録を保存しました！';
    msg.className = 'message success';
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);

    // メニューの重量を記録ベースで再調整
    const baseMenu = MenuGenerator.getMenu();
    if (baseMenu) {
      this.currentMenu = WeightAdjuster.adjustMenu(baseMenu);
    }
  },

  // === 履歴表示 ===
  setupHistory() {},

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
      const exercisesHtml = record.exercises.map(ex => {
        const exerciseData = EXERCISES[ex.id];
        const name = exerciseData ? exerciseData.name : ex.id;
        const setsStr = ex.sets.map((s, i) =>
          `Set${i + 1}: ${s.weight}kg × ${s.reps}回`
        ).join(' / ');

        return `
          <div class="history-exercise">
            <div class="history-exercise-name">${name}</div>
            <div class="history-set-list">${setsStr}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="history-day ${idx === 0 ? 'open' : ''}" data-idx="${idx}">
          <div class="history-day-header" onclick="App.toggleHistory(${idx})">
            <span>${Recorder.formatDate(record.date)} - ${record.dayName || ''}</span>
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

// アプリ起動
document.addEventListener('DOMContentLoaded', () => App.init());
