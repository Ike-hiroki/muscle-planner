// 分割法テンプレートと設定
const PROGRAMS = {
  // 週の頻度ごとの分割法
  splits: {
    2: {
      name: '全身2分割',
      days: [
        {
          name: 'Day A: 全身（プレス重視）',
          exercises: [
            { id: 'squat', sets: 4, reps: '8-10' },
            { id: 'benchPress', sets: 3, reps: '8-10' },
            { id: 'barbellRow', sets: 3, reps: '8-10' },
            { id: 'overheadPress', sets: 3, reps: '10-12' },
            { id: 'legCurl', sets: 3, reps: '10-12' },
            { id: 'barbellCurl', sets: 2, reps: '10-12' },
            { id: 'plank', sets: 3, reps: '30-60秒' },
          ]
        },
        {
          name: 'Day B: 全身（プル重視）',
          exercises: [
            { id: 'deadlift', sets: 4, reps: '6-8' },
            { id: 'legPress', sets: 3, reps: '10-12' },
            { id: 'latPulldown', sets: 3, reps: '8-10' },
            { id: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
            { id: 'sideRaise', sets: 3, reps: '12-15' },
            { id: 'tricepsPushdown', sets: 2, reps: '10-12' },
            { id: 'calfRaise', sets: 3, reps: '12-15' },
          ]
        }
      ]
    },
    3: {
      name: 'Push / Pull / Legs',
      days: [
        {
          name: 'Day 1: Push（胸・肩・三頭）',
          exercises: [
            { id: 'benchPress', sets: 4, reps: '8-10' },
            { id: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
            { id: 'dumbbellShoulderPress', sets: 3, reps: '10-12' },
            { id: 'sideRaise', sets: 3, reps: '12-15' },
            { id: 'tricepsPushdown', sets: 3, reps: '10-12' },
            { id: 'cableCrossover', sets: 3, reps: '12-15' },
          ]
        },
        {
          name: 'Day 2: Pull（背中・二頭）',
          exercises: [
            { id: 'deadlift', sets: 4, reps: '6-8' },
            { id: 'latPulldown', sets: 3, reps: '8-10' },
            { id: 'seatedRow', sets: 3, reps: '10-12' },
            { id: 'facePull', sets: 3, reps: '12-15' },
            { id: 'barbellCurl', sets: 3, reps: '10-12' },
            { id: 'hammerCurl', sets: 2, reps: '10-12' },
          ]
        },
        {
          name: 'Day 3: Legs（脚・体幹）',
          exercises: [
            { id: 'squat', sets: 4, reps: '8-10' },
            { id: 'romanianDeadlift', sets: 3, reps: '10-12' },
            { id: 'legPress', sets: 3, reps: '10-12' },
            { id: 'legExtension', sets: 3, reps: '12-15' },
            { id: 'legCurl', sets: 3, reps: '10-12' },
            { id: 'calfRaise', sets: 3, reps: '12-15' },
            { id: 'cableCrunch', sets: 3, reps: '12-15' },
          ]
        }
      ]
    },
    4: {
      name: '上半身/下半身 4分割',
      days: [
        {
          name: 'Day 1: 上半身A（プレス重視）',
          exercises: [
            { id: 'benchPress', sets: 4, reps: '8-10' },
            { id: 'overheadPress', sets: 3, reps: '8-10' },
            { id: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
            { id: 'latPulldown', sets: 3, reps: '10-12' },
            { id: 'sideRaise', sets: 3, reps: '12-15' },
            { id: 'tricepsPushdown', sets: 3, reps: '10-12' },
          ]
        },
        {
          name: 'Day 2: 下半身A（スクワット重視）',
          exercises: [
            { id: 'squat', sets: 4, reps: '8-10' },
            { id: 'legPress', sets: 3, reps: '10-12' },
            { id: 'legCurl', sets: 3, reps: '10-12' },
            { id: 'legExtension', sets: 3, reps: '12-15' },
            { id: 'calfRaise', sets: 3, reps: '12-15' },
            { id: 'cableCrunch', sets: 3, reps: '12-15' },
          ]
        },
        {
          name: 'Day 3: 上半身B（プル重視）',
          exercises: [
            { id: 'barbellRow', sets: 4, reps: '8-10' },
            { id: 'seatedRow', sets: 3, reps: '10-12' },
            { id: 'dumbbellShoulderPress', sets: 3, reps: '10-12' },
            { id: 'dumbbellFly', sets: 3, reps: '12-15' },
            { id: 'facePull', sets: 3, reps: '12-15' },
            { id: 'barbellCurl', sets: 3, reps: '10-12' },
          ]
        },
        {
          name: 'Day 4: 下半身B（ヒンジ重視）',
          exercises: [
            { id: 'romanianDeadlift', sets: 4, reps: '8-10' },
            { id: 'hipThrust', sets: 3, reps: '10-12' },
            { id: 'legCurl', sets: 3, reps: '10-12' },
            { id: 'legExtension', sets: 3, reps: '12-15' },
            { id: 'calfRaise', sets: 3, reps: '12-15' },
            { id: 'plank', sets: 3, reps: '30-60秒' },
          ]
        }
      ]
    },
    5: {
      name: '5分割',
      days: [
        {
          name: 'Day 1: 胸',
          exercises: [
            { id: 'benchPress', sets: 4, reps: '8-10' },
            { id: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
            { id: 'dumbbellFly', sets: 3, reps: '12-15' },
            { id: 'cableCrossover', sets: 3, reps: '12-15' },
          ]
        },
        {
          name: 'Day 2: 背中',
          exercises: [
            { id: 'deadlift', sets: 4, reps: '6-8' },
            { id: 'latPulldown', sets: 3, reps: '8-10' },
            { id: 'barbellRow', sets: 3, reps: '8-10' },
            { id: 'seatedRow', sets: 3, reps: '10-12' },
            { id: 'facePull', sets: 3, reps: '12-15' },
          ]
        },
        {
          name: 'Day 3: 肩・腕',
          exercises: [
            { id: 'overheadPress', sets: 4, reps: '8-10' },
            { id: 'sideRaise', sets: 3, reps: '12-15' },
            { id: 'rearDeltFly', sets: 3, reps: '12-15' },
            { id: 'barbellCurl', sets: 3, reps: '10-12' },
            { id: 'tricepsPushdown', sets: 3, reps: '10-12' },
            { id: 'hammerCurl', sets: 2, reps: '10-12' },
          ]
        },
        {
          name: 'Day 4: 脚',
          exercises: [
            { id: 'squat', sets: 4, reps: '8-10' },
            { id: 'legPress', sets: 3, reps: '10-12' },
            { id: 'romanianDeadlift', sets: 3, reps: '10-12' },
            { id: 'legExtension', sets: 3, reps: '12-15' },
            { id: 'legCurl', sets: 3, reps: '10-12' },
            { id: 'calfRaise', sets: 3, reps: '12-15' },
          ]
        },
        {
          name: 'Day 5: 弱点部位＋体幹',
          exercises: [
            { id: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
            { id: 'dumbbellRow', sets: 3, reps: '10-12' },
            { id: 'dumbbellShoulderPress', sets: 3, reps: '10-12' },
            { id: 'hipThrust', sets: 3, reps: '10-12' },
            { id: 'cableCrunch', sets: 3, reps: '12-15' },
            { id: 'plank', sets: 3, reps: '30-60秒' },
          ]
        }
      ]
    },
    6: {
      name: 'PPL 2周',
      days: [
        {
          name: 'Day 1: Push A（胸重視）',
          exercises: [
            { id: 'benchPress', sets: 4, reps: '6-8' },
            { id: 'inclineDumbbellPress', sets: 3, reps: '8-10' },
            { id: 'overheadPress', sets: 3, reps: '8-10' },
            { id: 'sideRaise', sets: 3, reps: '12-15' },
            { id: 'tricepsPushdown', sets: 3, reps: '10-12' },
          ]
        },
        {
          name: 'Day 2: Pull A（背中重視）',
          exercises: [
            { id: 'deadlift', sets: 4, reps: '6-8' },
            { id: 'latPulldown', sets: 3, reps: '8-10' },
            { id: 'barbellRow', sets: 3, reps: '8-10' },
            { id: 'facePull', sets: 3, reps: '12-15' },
            { id: 'barbellCurl', sets: 3, reps: '10-12' },
          ]
        },
        {
          name: 'Day 3: Legs A（スクワット重視）',
          exercises: [
            { id: 'squat', sets: 4, reps: '6-8' },
            { id: 'legPress', sets: 3, reps: '10-12' },
            { id: 'legCurl', sets: 3, reps: '10-12' },
            { id: 'legExtension', sets: 3, reps: '12-15' },
            { id: 'calfRaise', sets: 3, reps: '12-15' },
          ]
        },
        {
          name: 'Day 4: Push B（肩重視）',
          exercises: [
            { id: 'dumbbellShoulderPress', sets: 4, reps: '8-10' },
            { id: 'inclineDumbbellPress', sets: 3, reps: '10-12' },
            { id: 'cableCrossover', sets: 3, reps: '12-15' },
            { id: 'sideRaise', sets: 3, reps: '12-15' },
            { id: 'overheadTricepsExtension', sets: 3, reps: '10-12' },
          ]
        },
        {
          name: 'Day 5: Pull B（ロウ重視）',
          exercises: [
            { id: 'seatedRow', sets: 4, reps: '8-10' },
            { id: 'dumbbellRow', sets: 3, reps: '10-12' },
            { id: 'latPulldown', sets: 3, reps: '10-12' },
            { id: 'rearDeltFly', sets: 3, reps: '12-15' },
            { id: 'hammerCurl', sets: 3, reps: '10-12' },
          ]
        },
        {
          name: 'Day 6: Legs B（ヒンジ重視）',
          exercises: [
            { id: 'romanianDeadlift', sets: 4, reps: '8-10' },
            { id: 'hipThrust', sets: 3, reps: '10-12' },
            { id: 'legExtension', sets: 3, reps: '12-15' },
            { id: 'legCurl', sets: 3, reps: '12-15' },
            { id: 'calfRaise', sets: 3, reps: '12-15' },
            { id: 'cableCrunch', sets: 3, reps: '12-15' },
          ]
        }
      ]
    }
  },

  // 細マッチョ向けデフォルト設定
  defaults: {
    restSeconds: {
      compound: 90,   // 複合種目: 90秒
      isolation: 60,  // 単関節種目: 60秒
    },
    intensityRange: {
      min: 0.65,  // 推定1RMの65%
      max: 0.80,  // 推定1RMの80%
    }
  }
};
