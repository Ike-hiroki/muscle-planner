// プロフィール管理モジュール
const ProfileManager = {
  STORAGE_KEY: 'mp_profile',

  getProfile() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveProfile(profile) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  },

  loadFormValues() {
    const profile = this.getProfile();
    if (!profile) return;

    document.getElementById('height').value = profile.height || '';
    document.getElementById('weight').value = profile.weight || '';
    document.getElementById('age').value = profile.age || '';
    document.getElementById('gender').value = profile.gender || 'male';
    document.getElementById('bodyFat').value = profile.bodyFat || '';
    document.getElementById('muscleMass').value = profile.muscleMass || '';
    document.getElementById('frequency').value = profile.frequency || '3';
    document.getElementById('level').value = profile.level || 'beginner';
  },

  getFormValues() {
    return {
      height: parseFloat(document.getElementById('height').value) || null,
      weight: parseFloat(document.getElementById('weight').value) || null,
      age: parseInt(document.getElementById('age').value) || null,
      gender: document.getElementById('gender').value,
      bodyFat: parseFloat(document.getElementById('bodyFat').value) || null,
      muscleMass: parseFloat(document.getElementById('muscleMass').value) || null,
      frequency: parseInt(document.getElementById('frequency').value),
      level: document.getElementById('level').value,
    };
  },

  validate(profile) {
    const errors = [];
    if (!profile.height) errors.push('身長を入力してください');
    if (!profile.weight) errors.push('体重を入力してください');
    if (!profile.age) errors.push('年齢を入力してください');
    return errors;
  }
};
