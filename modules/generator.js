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

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(menu));
    return menu;
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
