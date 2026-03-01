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

  // chip-group内の選択値を配列で取得
  _getChipValues(containerId) {
    const chips = document.querySelectorAll(`#${containerId} .chip.selected`);
    return Array.from(chips).map(c => c.dataset.value);
  },

  // chip-groupの選択状態を復元
  _setChipValues(containerId, values) {
    if (!values || !Array.isArray(values)) return;
    document.querySelectorAll(`#${containerId} .chip`).forEach(chip => {
      chip.classList.toggle('selected', values.includes(chip.dataset.value));
    });
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
    document.getElementById('goal').value = profile.goal || 'hypertrophy';

    // v7新フィールド
    document.getElementById('sessionTime').value = profile.sessionTime || '60';
    document.getElementById('bodyBalance').value = profile.bodyBalance || 'balanced';
    document.getElementById('equipmentPref').value = profile.equipmentPref || 'balanced';
    this._setChipValues('focusParts', profile.focusParts);
    this._setChipValues('injuries', profile.injuries);
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
      goal: document.getElementById('goal').value,
      // v7新フィールド
      sessionTime: parseInt(document.getElementById('sessionTime').value) || 60,
      bodyBalance: document.getElementById('bodyBalance').value || 'balanced',
      equipmentPref: document.getElementById('equipmentPref').value || 'balanced',
      focusParts: this._getChipValues('focusParts'),
      injuries: this._getChipValues('injuries'),
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
