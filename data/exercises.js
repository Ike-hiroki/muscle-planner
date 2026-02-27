// 種目データベース
// category: push(押す), pull(引く), legs(脚), core(体幹)
// type: compound(複合種目), isolation(単関節種目)
// bodyWeightRatio: { beginner, intermediate, advanced } = 推定1RMの体重比
// weightIncrement: 重量調整の刻み幅(kg)
const EXERCISES = {
  // === 胸 (Push) ===
  benchPress: {
    name: 'ベンチプレス',
    category: 'push',
    target: '胸・三頭・肩前部',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.5, intermediate: 0.8, advanced: 1.2 },
    weightIncrement: 2.5,
    tip: 'バーを胸の中央に下ろし、足で床を踏ん張る。肩甲骨を寄せてアーチを作る。'
  },
  inclineDumbbellPress: {
    name: 'インクラインダンベルプレス',
    category: 'push',
    target: '胸上部・肩前部',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.15, intermediate: 0.25, advanced: 0.35 },
    weightIncrement: 2,
    tip: 'ベンチ角度30〜45度。ダンベルを胸上部に向かって下ろす。片手の重量。'
  },
  dumbbellFly: {
    name: 'ダンベルフライ',
    category: 'push',
    target: '胸',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.1, intermediate: 0.15, advanced: 0.2 },
    weightIncrement: 2,
    tip: '肘を軽く曲げたまま弧を描くように開く。胸のストレッチを意識。片手の重量。'
  },
  cableCrossover: {
    name: 'ケーブルクロスオーバー',
    category: 'push',
    target: '胸',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.08, intermediate: 0.12, advanced: 0.18 },
    weightIncrement: 2.5,
    tip: '体の前で両手を交差させるように絞る。胸の収縮を意識。片側の重量。'
  },

  // === 肩 (Push) ===
  overheadPress: {
    name: 'オーバーヘッドプレス',
    category: 'push',
    target: '肩・三頭',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.3, intermediate: 0.5, advanced: 0.7 },
    weightIncrement: 2.5,
    tip: 'バーを鎖骨上から頭上に押し上げる。体幹を締めて反らないように。'
  },
  dumbbellShoulderPress: {
    name: 'ダンベルショルダープレス',
    category: 'push',
    target: '肩・三頭',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.12, intermediate: 0.2, advanced: 0.3 },
    weightIncrement: 2,
    tip: '耳の横からまっすぐ上に押し上げる。片手の重量。'
  },
  sideRaise: {
    name: 'サイドレイズ',
    category: 'push',
    target: '肩（中部）',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.05, intermediate: 0.08, advanced: 0.12 },
    weightIncrement: 1,
    tip: '肘を軽く曲げ、肩の高さまで上げる。小指側を上にするイメージ。片手の重量。'
  },
  rearDeltFly: {
    name: 'リアデルトフライ',
    category: 'pull',
    target: '肩（後部）',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.05, intermediate: 0.08, advanced: 0.1 },
    weightIncrement: 1,
    tip: '上体を前傾し、腕を左右に開く。肩甲骨を寄せすぎない。片手の重量。'
  },

  // === 三頭筋 (Push) ===
  tricepsPushdown: {
    name: 'トライセプスプッシュダウン',
    category: 'push',
    target: '三頭筋',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.15, intermediate: 0.25, advanced: 0.35 },
    weightIncrement: 2.5,
    tip: '肘を体の横に固定し、前腕だけ動かす。完全に伸ばし切る。'
  },
  overheadTricepsExtension: {
    name: 'オーバーヘッドトライセプスエクステンション',
    category: 'push',
    target: '三頭筋（長頭）',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.08, intermediate: 0.12, advanced: 0.18 },
    weightIncrement: 2,
    tip: '頭上でダンベルを持ち肘を曲げ伸ばし。肘が開かないように。片手の重量。'
  },

  // === 背中 (Pull) ===
  deadlift: {
    name: 'デッドリフト',
    category: 'pull',
    target: '背中・ハム・臀部',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.7, intermediate: 1.2, advanced: 1.8 },
    weightIncrement: 5,
    tip: '背中をまっすぐに保ち、股関節を折り畳むように持ち上げる。腰を丸めない。'
  },
  latPulldown: {
    name: 'ラットプルダウン',
    category: 'pull',
    target: '広背筋・二頭',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.4, intermediate: 0.6, advanced: 0.85 },
    weightIncrement: 5,
    tip: '胸を張り、バーを鎖骨に向かって引く。肩甲骨を下げるイメージ。'
  },
  barbellRow: {
    name: 'バーベルロウ',
    category: 'pull',
    target: '広背筋・僧帽筋',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.4, intermediate: 0.65, advanced: 0.9 },
    weightIncrement: 2.5,
    tip: '上体を45度前傾、バーをへそに向かって引く。背中で引くイメージ。'
  },
  seatedRow: {
    name: 'シーテッドロウ',
    category: 'pull',
    target: '広背筋・僧帽筋',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.35, intermediate: 0.55, advanced: 0.75 },
    weightIncrement: 5,
    tip: '胸を張ったままハンドルをへそに引く。肩甲骨を寄せる。'
  },
  dumbbellRow: {
    name: 'ワンハンドダンベルロウ',
    category: 'pull',
    target: '広背筋',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.15, intermediate: 0.25, advanced: 0.35 },
    weightIncrement: 2,
    tip: 'ベンチに片手をつき、ダンベルを腰に向かって引く。片手の重量。'
  },
  facePull: {
    name: 'フェイスプル',
    category: 'pull',
    target: '肩後部・僧帽筋中部',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.08, intermediate: 0.12, advanced: 0.18 },
    weightIncrement: 2.5,
    tip: 'ロープを顔に向かって引き、外旋させる。肩の健康に重要。'
  },

  // === 二頭筋 (Pull) ===
  barbellCurl: {
    name: 'バーベルカール',
    category: 'pull',
    target: '二頭筋',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.2, intermediate: 0.3, advanced: 0.45 },
    weightIncrement: 2.5,
    tip: '肘を体の横に固定し、前腕だけでバーを巻き上げる。反動を使わない。'
  },
  hammerCurl: {
    name: 'ハンマーカール',
    category: 'pull',
    target: '二頭筋・腕橈骨筋',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.08, intermediate: 0.12, advanced: 0.18 },
    weightIncrement: 2,
    tip: '手のひらを内側に向けたまま巻き上げる。片手の重量。'
  },

  // === 脚（大腿四頭筋） ===
  squat: {
    name: 'スクワット',
    category: 'legs',
    target: '大腿四頭・臀部',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.6, intermediate: 1.0, advanced: 1.5 },
    weightIncrement: 2.5,
    tip: '膝とつま先を同じ方向に向け、太ももが床と平行になるまでしゃがむ。'
  },
  legPress: {
    name: 'レッグプレス',
    category: 'legs',
    target: '大腿四頭・臀部',
    type: 'compound',
    bodyWeightRatio: { beginner: 1.0, intermediate: 1.6, advanced: 2.2 },
    weightIncrement: 5,
    tip: '足幅は肩幅程度。膝が90度になるまで下ろす。腰が浮かないように。'
  },
  legExtension: {
    name: 'レッグエクステンション',
    category: 'legs',
    target: '大腿四頭筋',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.2, intermediate: 0.35, advanced: 0.5 },
    weightIncrement: 5,
    tip: '膝を完全に伸ばし切り、1秒止める。ゆっくり戻す。'
  },

  // === 脚（ハムストリング） ===
  romanianDeadlift: {
    name: 'ルーマニアンデッドリフト',
    category: 'legs',
    target: 'ハムストリング・臀部',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.5, intermediate: 0.8, advanced: 1.2 },
    weightIncrement: 2.5,
    tip: '膝を軽く曲げたまま、お尻を後ろに突き出すように上体を倒す。ハムのストレッチを感じる。'
  },
  legCurl: {
    name: 'レッグカール',
    category: 'legs',
    target: 'ハムストリング',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.15, intermediate: 0.25, advanced: 0.4 },
    weightIncrement: 5,
    tip: '膝を曲げてパッドをお尻に近づける。お尻が浮かないように。'
  },

  // === 脚（臀部・カーフ） ===
  hipThrust: {
    name: 'ヒップスラスト',
    category: 'legs',
    target: '臀部',
    type: 'compound',
    bodyWeightRatio: { beginner: 0.5, intermediate: 0.9, advanced: 1.4 },
    weightIncrement: 5,
    tip: 'ベンチに肩甲骨を乗せ、バーを股関節に置いて押し上げる。お尻を締める。'
  },
  calfRaise: {
    name: 'カーフレイズ',
    category: 'legs',
    target: 'ふくらはぎ',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.4, intermediate: 0.7, advanced: 1.0 },
    weightIncrement: 5,
    tip: 'つま先立ちでふくらはぎを収縮。上げきった位置で1秒止める。'
  },

  // === 体幹 ===
  plank: {
    name: 'プランク',
    category: 'core',
    target: '体幹全体',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0, intermediate: 0, advanced: 0 },
    weightIncrement: 0,
    isTimeBased: true,
    tip: '肘とつま先で体を支え、一直線を保つ。お尻が上がったり下がったりしないように。'
  },
  cableCrunch: {
    name: 'ケーブルクランチ',
    category: 'core',
    target: '腹直筋',
    type: 'isolation',
    bodyWeightRatio: { beginner: 0.15, intermediate: 0.25, advanced: 0.4 },
    weightIncrement: 2.5,
    tip: 'ケーブルを頭の後ろで持ち、おへそを覗き込むように丸める。'
  }
};
