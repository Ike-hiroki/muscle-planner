// 種目イラスト（SVGシルエット）& マッピング
const ILLUST = {
  svgs: {
    bench: '<svg viewBox="0 0 80 80" fill="none"><rect x="10" y="50" width="56" height="3" rx="1.5" fill="currentColor" opacity=".15"/><circle cx="20" cy="42" r="5" fill="currentColor" opacity=".4"/><path d="M25 43H52" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M32 42V26M44 42V26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><path d="M24 24H52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><rect x="20" y="20" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/><rect x="51" y="20" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/></svg>',
    press: '<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="22" r="5" fill="currentColor" opacity=".4"/><path d="M40 27V48" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M37 48L30 68M43 48L50 68" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".2"/><path d="M37 32L28 12M43 32L52 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><path d="M20 10H60" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><rect x="16" y="6" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/><rect x="59" y="6" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/></svg>',
    fly: '<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="20" r="5" fill="currentColor" opacity=".4"/><path d="M40 25V48" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M37 48L30 68M43 48L50 68" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".2"/><path d="M37 32L12 38M43 32L68 38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><rect x="6" y="36" width="8" height="4" rx="2" fill="currentColor" opacity=".3"/><rect x="66" y="36" width="8" height="4" rx="2" fill="currentColor" opacity=".3"/></svg>',
    pushdown: '<svg viewBox="0 0 80 80" fill="none"><rect x="62" y="4" width="3" height="56" rx="1.5" fill="currentColor" opacity=".1"/><path d="M63 10L42 28" stroke="currentColor" stroke-width="1.5" opacity=".15"/><circle cx="38" cy="18" r="5" fill="currentColor" opacity=".4"/><path d="M38 23V46" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M35 46L28 68M41 46L48 68" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".2"/><path d="M36 28V44M40 28V44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/></svg>',
    deadlift: '<svg viewBox="0 0 80 80" fill="none"><circle cx="50" cy="18" r="5" fill="currentColor" opacity=".4"/><path d="M48 22L34 44" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M34 44L28 66M38 44L44 66" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".2"/><path d="M44 28L30 50M40 32L26 50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><path d="M20 48H38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><rect x="16" y="44" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/><rect x="37" y="44" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/></svg>',
    row: '<svg viewBox="0 0 80 80" fill="none"><circle cx="26" cy="22" r="5" fill="currentColor" opacity=".4"/><path d="M30 26L50 42" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M50 42L44 66M54 42L58 66" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".2"/><path d="M34 30L28 42M38 34L32 42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><rect x="24" y="40" width="10" height="4" rx="2" fill="currentColor" opacity=".3"/></svg>',
    curl: '<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="16" r="5" fill="currentColor" opacity=".4"/><path d="M40 21V46" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M37 46L30 68M43 46L50 68" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".2"/><path d="M44 28L48 44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".2"/><path d="M36 28L32 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><rect x="28" y="14" width="6" height="5" rx="2" fill="currentColor" opacity=".3"/></svg>',
    squat: '<svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="18" r="5" fill="currentColor" opacity=".4"/><path d="M40 23V40" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M37 40L24 54L26 68" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" opacity=".2"/><path d="M43 40L56 54L54 68" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" opacity=".2"/><path d="M18 24H62" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".35"/><rect x="14" y="20" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/><rect x="61" y="20" width="5" height="8" rx="2" fill="currentColor" opacity=".25"/></svg>',
    plank: '<svg viewBox="0 0 80 80" fill="none"><circle cx="16" cy="34" r="5" fill="currentColor" opacity=".4"/><path d="M21 36H62" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".3"/><path d="M18 38L14 52M20 38L18 52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".3"/><path d="M62 38L66 52M64 38L68 48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".2"/></svg>'
  },
  map: {
    benchPress: 'bench', inclineDumbbellPress: 'bench',
    dumbbellFly: 'fly', cableCrossover: 'fly', sideRaise: 'fly', rearDeltFly: 'fly',
    overheadPress: 'press', dumbbellShoulderPress: 'press',
    tricepsPushdown: 'pushdown', overheadTricepsExtension: 'pushdown',
    deadlift: 'deadlift', romanianDeadlift: 'deadlift',
    latPulldown: 'row', barbellRow: 'row', seatedRow: 'row', dumbbellRow: 'row', facePull: 'row',
    barbellCurl: 'curl', hammerCurl: 'curl',
    squat: 'squat', legPress: 'squat', legExtension: 'squat', legCurl: 'squat',
    hipThrust: 'squat', calfRaise: 'squat',
    plank: 'plank', cableCrunch: 'plank'
  },
  // 種目追加セレクター用カテゴリ
  categories: {
    '胸': ['benchPress', 'inclineDumbbellPress', 'dumbbellFly', 'cableCrossover'],
    '肩': ['overheadPress', 'dumbbellShoulderPress', 'sideRaise', 'rearDeltFly'],
    '腕': ['tricepsPushdown', 'overheadTricepsExtension', 'barbellCurl', 'hammerCurl'],
    '背中': ['deadlift', 'latPulldown', 'barbellRow', 'seatedRow', 'dumbbellRow', 'facePull'],
    '脚': ['squat', 'legPress', 'legExtension', 'romanianDeadlift', 'legCurl', 'hipThrust', 'calfRaise'],
    '体幹': ['plank', 'cableCrunch']
  },
  get(id) {
    return this.svgs[this.map[id]] || this.svgs.press;
  }
};
