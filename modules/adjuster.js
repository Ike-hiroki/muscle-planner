// 重量自動調整モジュール（プログレッシブ・オーバーロード）
const WeightAdjuster = {
  // 次回の推奨重量を算出
  // returns: { weight: number, change: 'up'|'same'|'down', reason: string }
  recommend(exerciseId, currentWeight, targetReps) {
    const records = Recorder.getRecentForExercise(exerciseId, 3);
    const exerciseData = EXERCISES[exerciseId];

    if (!exerciseData || exerciseData.isTimeBased) {
      return { weight: currentWeight, change: 'same', reason: 'タイムベースの種目' };
    }

    if (records.length === 0) {
      return { weight: currentWeight, change: 'same', reason: '記録なし（初回）' };
    }

    const increment = exerciseData.weightIncrement || 2.5;
    const targetMin = this.parseRepsMin(targetReps);

    // 直近の記録を分析
    const latest = records[0];
    const allSetsHitTarget = this.didHitTarget(latest, targetMin);

    if (allSetsHitTarget) {
      // 全セットで目標回数を達成 → 重量UP
      const newWeight = currentWeight + increment;
      return {
        weight: newWeight,
        change: 'up',
        reason: `前回全セット${targetMin}回以上達成`
      };
    }

    // 目標未達の場合
    if (records.length >= 2) {
      const previous = records[1];
      const previousHitTarget = this.didHitTarget(previous, targetMin);

      if (!previousHitTarget) {
        // 2回連続で目標未達 → 重量DOWN（デロード）
        const newWeight = Math.max(increment, currentWeight - increment);
        return {
          weight: newWeight,
          change: 'down',
          reason: '2回連続で目標未達（デロード）'
        };
      }
    }

    // 1回だけ目標未達 → 同じ重量を維持
    return {
      weight: currentWeight,
      change: 'same',
      reason: '前回目標未達（重量維持）'
    };
  },

  // 目標回数の最小値をパース（例: "8-10" → 8）
  parseRepsMin(repsStr) {
    if (typeof repsStr === 'number') return repsStr;
    const match = String(repsStr).match(/(\d+)/);
    return match ? parseInt(match[1]) : 8;
  },

  // 全セットで目標回数を達成したかチェック
  didHitTarget(record, targetMin) {
    if (!record.sets || record.sets.length === 0) return false;
    return record.sets.every(set => set.reps >= targetMin);
  },

  // メニュー全体の重量を記録ベースで調整
  adjustMenu(menu) {
    if (!menu) return menu;

    const adjustedMenu = JSON.parse(JSON.stringify(menu));

    adjustedMenu.days.forEach(day => {
      day.exercises.forEach(exercise => {
        if (exercise.isTimeBased) return;

        const recommendation = this.recommend(
          exercise.id,
          exercise.weight,
          exercise.reps
        );

        exercise.weight = recommendation.weight;
        exercise.weightChange = recommendation.change;
        exercise.weightReason = recommendation.reason;
      });
    });

    return adjustedMenu;
  }
};
