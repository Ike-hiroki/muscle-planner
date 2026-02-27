// トレーニング記録モジュール
const Recorder = {
  STORAGE_KEY: 'mp_records',

  // 全記録を取得
  getAllRecords() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 記録を保存
  saveRecord(record) {
    const records = this.getAllRecords();
    // 同じ日付の記録があれば上書き
    const existingIndex = records.findIndex(r => r.date === record.date);
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    // 日付の新しい順にソート
    records.sort((a, b) => b.date.localeCompare(a.date));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  },

  // 特定の日付の記録を取得
  getRecordByDate(date) {
    const records = this.getAllRecords();
    return records.find(r => r.date === date) || null;
  },

  // 特定の種目の最新記録を取得
  getLatestForExercise(exerciseId) {
    const records = this.getAllRecords();
    for (const record of records) {
      const exercise = record.exercises.find(e => e.id === exerciseId);
      if (exercise) return { date: record.date, ...exercise };
    }
    return null;
  },

  // 特定の種目の直近N回分の記録を取得
  getRecentForExercise(exerciseId, count = 3) {
    const records = this.getAllRecords();
    const results = [];
    for (const record of records) {
      const exercise = record.exercises.find(e => e.id === exerciseId);
      if (exercise) {
        results.push({ date: record.date, ...exercise });
        if (results.length >= count) break;
      }
    }
    return results;
  },

  // 今日の日付を YYYY-MM-DD 形式で取得
  getTodayString() {
    const now = new Date();
    return now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
  },

  // 日付を表示用フォーマットに変換
  formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}/${date.getDate()}（${days[date.getDay()]}）`;
  }
};
