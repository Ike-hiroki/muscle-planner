// メニュー生成モジュール
const MenuGenerator = {
  STORAGE_KEY: 'mp_menu',

  // メニューを生成して保存
  generate(profile) {
    const frequency = profile.frequency;
    const split = PROGRAMS.splits[frequency];
    if (!split) return null;

    const menu = {
      splitName: split.name,
      frequency: frequency,
      generatedAt: new Date().toISOString(),
      days: split.days.map(day => ({
        name: day.name,
        exercises: day.exercises.map(ex => {
          const exerciseData = EXERCISES[ex.id];
          if (!exerciseData) return null;

          const weight = this.calculateWeight(exerciseData, profile);
          return {
            id: ex.id,
            name: exerciseData.name,
            target: exerciseData.target,
            type: exerciseData.type,
            sets: ex.sets,
            reps: ex.reps,
            weight: weight,
            weightIncrement: exerciseData.weightIncrement,
            rest: exerciseData.type === 'compound'
              ? PROGRAMS.defaults.restSeconds.compound
              : PROGRAMS.defaults.restSeconds.isolation,
            tip: exerciseData.tip,
            isTimeBased: exerciseData.isTimeBased || false,
          };
        }).filter(Boolean)
      }))
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(menu));
    return menu;
  },

  // 重量計算
  calculateWeight(exercise, profile) {
    if (exercise.isTimeBased) return 0;

    const ratio = exercise.bodyWeightRatio[profile.level] || exercise.bodyWeightRatio.beginner;
    const estimated1RM = profile.weight * ratio;

    // 作業重量 = 1RMの65-80%（中央値の72.5%を使用）
    const workingWeight = estimated1RM * 0.725;

    // 刻み幅に丸める
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

  // メニューの重量を更新（重量自動調整で使用）
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
