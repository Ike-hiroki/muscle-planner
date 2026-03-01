// 目標別設定（グローバル: app.jsからも参照）
const GOAL_SETTINGS = {
  strength: {
    label: '筋力アップ',
    compound: { reps: '3-5', intensity: 0.85 },
    isolation: { reps: '6-8', intensity: 0.80 },
    restCompound: 180,
    restIsolation: 120
  },
  hypertrophy: {
    label: '筋肥大（バランス型）',
    compound: { reps: '8-10', intensity: 0.725 },
    isolation: { reps: '10-12', intensity: 0.70 },
    restCompound: 90,
    restIsolation: 60
  },
  endurance: {
    label: '持久力・引き締め',
    compound: { reps: '12-15', intensity: 0.55 },
    isolation: { reps: '15-20', intensity: 0.50 },
    restCompound: 45,
    restIsolation: 30
  }
};

// メニュー生成モジュール
const MenuGenerator = {
  STORAGE_KEY: 'mp_menu',

  // メニューを生成して保存
  generate(profile) {
    const frequency = profile.frequency;
    const split = PROGRAMS.splits[frequency];
    if (!split) return null;

    const goal = profile.goal || 'hypertrophy';
    const goalConfig = GOAL_SETTINGS[goal];

    const menu = {
      splitName: split.name,
      frequency: frequency,
      goal: goal,
      generatedAt: new Date().toISOString(),
      days: split.days.map(day => ({
        name: day.name,
        exercises: day.exercises.map(ex => {
          const exerciseData = EXERCISES[ex.id];
          if (!exerciseData) return null;

          const typeConfig = exerciseData.type === 'compound'
            ? goalConfig.compound : goalConfig.isolation;
          const weight = this.calculateWeight(exerciseData, profile, typeConfig.intensity);
          const rest = exerciseData.type === 'compound'
            ? goalConfig.restCompound : goalConfig.restIsolation;

          return {
            id: ex.id,
            name: exerciseData.name,
            target: exerciseData.target,
            type: exerciseData.type,
            sets: ex.sets,
            reps: exerciseData.isTimeBased ? ex.reps : typeConfig.reps,
            weight: weight,
            weightIncrement: exerciseData.weightIncrement,
            rest: rest,
            isTimeBased: exerciseData.isTimeBased || false,
          };
        }).filter(Boolean)
      }))
    };

    // v7: パーソナライズパイプライン適用
    this._applyPersonalization(menu, profile);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(menu));
    return menu;
  },

  // === v7: パーソナライズパイプライン ===
  _applyPersonalization(menu, profile) {
    menu.days.forEach(day => {
      // 1. 怪我フィルター
      day.exercises = this._applyInjuryFilter(day.exercises, profile);
      // 2. 器具好みフィルター
      day.exercises = this._applyEquipmentPreference(day.exercises, profile);
      // 3. 体バランス調整
      this._applyBodyBalance(day.exercises, profile);
      // 4. 重点部位調整
      this._applyFocusParts(day.exercises, profile);
      // 5. 時間制限
      day.exercises = this._applySessionTimeLimit(day.exercises, profile);
    });
  },

  // 1. 怪我のある部位に関連する種目を除外
  _applyInjuryFilter(exercises, profile) {
    const injuries = profile.injuries || [];
    if (injuries.length === 0) return exercises;

    return exercises.filter(ex => {
      const data = EXERCISES[ex.id];
      if (!data || !data.injuryRisk) return true;
      // 怪我部位とリスク部位が重なる場合は除外
      return !data.injuryRisk.some(risk => injuries.includes(risk));
    });
  },

  // 2. 器具好みに応じて種目を代替
  _applyEquipmentPreference(exercises, profile) {
    const pref = profile.equipmentPref || 'balanced';
    if (pref === 'balanced') return exercises;

    const usedIds = new Set(exercises.map(e => e.id));

    return exercises.map(ex => {
      const data = EXERCISES[ex.id];
      if (!data) return ex;

      const sub = EQUIPMENT_SUBSTITUTIONS[ex.id];
      if (!sub) return ex;

      let replaceId = null;
      if (pref === 'machine' && ['barbell', 'dumbbell'].includes(data.equipment) && sub.machine) {
        replaceId = sub.machine;
      } else if (pref === 'freeweight' && ['machine', 'cable'].includes(data.equipment) && sub.freeweight) {
        replaceId = sub.freeweight;
      }

      if (!replaceId || usedIds.has(replaceId)) return ex;

      const newData = EXERCISES[replaceId];
      if (!newData) return ex;

      usedIds.delete(ex.id);
      usedIds.add(replaceId);

      const goalConfig = GOAL_SETTINGS[profile.goal || 'hypertrophy'];
      const typeConfig = newData.type === 'compound' ? goalConfig.compound : goalConfig.isolation;
      const weight = this.calculateWeight(newData, profile, typeConfig.intensity);
      const rest = newData.type === 'compound' ? goalConfig.restCompound : goalConfig.restIsolation;

      return {
        ...ex,
        id: replaceId,
        name: newData.name,
        target: newData.target,
        type: newData.type,
        reps: newData.isTimeBased ? ex.reps : typeConfig.reps,
        weight: weight,
        weightIncrement: newData.weightIncrement,
        rest: rest,
        isTimeBased: newData.isTimeBased || false,
      };
    });
  },

  // 3. 上半身/下半身重視 → 該当カテゴリの種目にセット+1
  _applyBodyBalance(exercises, profile) {
    const balance = profile.bodyBalance || 'balanced';
    if (balance === 'balanced') return;

    const upperParts = ['胸', '肩', '腕', '背中'];
    const lowerParts = ['脚'];

    const targetParts = balance === 'upper' ? upperParts : lowerParts;

    exercises.forEach(ex => {
      const data = EXERCISES[ex.id];
      if (data && targetParts.includes(data.bodyPart)) {
        ex.sets = Math.min(6, ex.sets + 1);
      }
    });
  },

  // 4. 重点部位の種目にセット+1
  _applyFocusParts(exercises, profile) {
    const focusParts = profile.focusParts || [];
    if (focusParts.length === 0) return;

    exercises.forEach(ex => {
      const data = EXERCISES[ex.id];
      if (data && focusParts.includes(data.bodyPart)) {
        ex.sets = Math.min(6, ex.sets + 1);
      }
    });
  },

  // 5. 希望時間を超えたらisolation種目から削除
  _applySessionTimeLimit(exercises, profile) {
    const limit = profile.sessionTime || 60;

    const estimateMinutes = (exList) => {
      let sec = 5 * 60; // ウォームアップ
      exList.forEach(ex => {
        sec += ex.sets * 50;
        sec += (ex.sets - 1) * (ex.rest || 75);
        sec += 150;
      });
      return Math.round(sec / 60);
    };

    let result = [...exercises];

    // 制限を超えている場合、isolation種目を後ろから削除
    while (result.length > 1 && estimateMinutes(result) > limit) {
      // 後ろからisolation種目を探す
      let removed = false;
      for (let i = result.length - 1; i >= 0; i--) {
        if (result[i].type === 'isolation') {
          result.splice(i, 1);
          removed = true;
          break;
        }
      }
      // isolation種目がなければcompoundを後ろから削除
      if (!removed) {
        if (result.length > 1) {
          result.pop();
        } else {
          break;
        }
      }
    }

    return result;
  },

  // 重量計算（intensity省略時はprofile.goalから自動判定）
  calculateWeight(exercise, profile, intensity) {
    if (exercise.isTimeBased) return 0;

    if (!intensity) {
      const goal = profile.goal || 'hypertrophy';
      const goalConfig = GOAL_SETTINGS[goal];
      const typeConfig = exercise.type === 'compound'
        ? goalConfig.compound : goalConfig.isolation;
      intensity = typeConfig.intensity;
    }

    const ratio = exercise.bodyWeightRatio[profile.level] || exercise.bodyWeightRatio.beginner;
    const estimated1RM = profile.weight * ratio;
    const workingWeight = estimated1RM * intensity;

    const increment = exercise.weightIncrement || 2.5;
    return Math.max(increment, Math.round(workingWeight / increment) * increment);
  },

  // 保存されたメニューを取得
  getMenu() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // 特定のDayのメニューを取得
  getDay(dayIndex) {
    const menu = this.getMenu();
    if (!menu || !menu.days[dayIndex]) return null;
    return menu.days[dayIndex];
  },

  // メニューの重量を更新
  updateWeight(dayIndex, exerciseId, newWeight) {
    const menu = this.getMenu();
    if (!menu) return;

    const day = menu.days[dayIndex];
    if (!day) return;

    const exercise = day.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      exercise.weight = newWeight;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(menu));
    }
  }
};
