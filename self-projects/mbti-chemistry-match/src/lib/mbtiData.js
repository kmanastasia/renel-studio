function hashPair(t1, t2) {
  const pair = [t1, t2].sort().join('-');
  let h = 0;
  for (let i = 0; i < pair.length; i++) h = (h * 31 + pair.charCodeAt(i)) >>> 0;
  return h;
}


export const MBTI_TYPES = {
  INTJ: {
    label: "INTJ", desc: "建築家",
    strengths: ["長期的な戦略思考", "独立心が高く自律的", "知識への飽くなき探求", "高い目標達成能力"],
    weaknesses: ["感情表現が苦手", "完璧主義で融通が利かない", "批判的に見られやすい", "人との共感が難しいことも"],
  },
  INTP: {
    label: "INTP", desc: "論理学者",
    strengths: ["深い分析力と論理的思考", "独創的なアイデア", "客観的で公正", "複雑な問題の解決が得意"],
    weaknesses: ["感情の表現が不得意", "実行より分析に偏りがち", "優柔不断になることも", "社交的なやり取りが疲れる"],
  },
  ENTJ: {
    label: "ENTJ", desc: "指揮官",
    strengths: ["強いリーダーシップ", "戦略的な思考と決断力", "目標達成への強い意志", "組織を動かす力"],
    weaknesses: ["感情面での配慮が不足しがち", "支配的に見られることも", "他者の意見を軽視することがある", "プレッシャーをかけすぎる傾向"],
  },
  ENTP: {
    label: "ENTP", desc: "討論者",
    strengths: ["革新的なアイデアと創造性", "知的好奇心が旺盛", "議論を通じて問題を解決", "柔軟な思考と適応力"],
    weaknesses: ["飽きやすく集中力が続かない", "議論好きで対立を生むことも", "ルーティンが苦手", "アイデアの実行が弱い"],
  },
  INFJ: {
    label: "INFJ", desc: "提唱者",
    strengths: ["深い洞察力と直感", "他者への共感と理解", "強い信念とビジョン", "誠実さと誠意"],
    weaknesses: ["完璧主義で燃え尽きやすい", "プライベートを守りすぎる", "批判に敏感", "現実的な計画が苦手なことも"],
  },
  INFP: {
    label: "INFP", desc: "仲介者",
    strengths: ["豊かな想像力と創造性", "深い共感力", "強い価値観と誠実さ", "他者の可能性を信じる力"],
    weaknesses: ["批判を個人攻撃と感じやすい", "非現実的な理想を持つことも", "実用的なタスクが苦手", "感情に流されやすい"],
  },
  ENFJ: {
    label: "ENFJ", desc: "主人公",
    strengths: ["高いカリスマ性とリーダーシップ", "他者の成長を引き出す力", "共感力と人への関心", "チームをまとめる能力"],
    weaknesses: ["他者の意見に影響されやすい", "自分のニーズを後回しにする", "過度に理想主義になることも", "批判されると傷つきやすい"],
  },
  ENFP: {
    label: "ENFP", desc: "運動家",
    strengths: ["情熱的で感染力のある熱意", "創造性と自由な発想", "人との繋がりを大切にする", "新しい可能性を見出す力"],
    weaknesses: ["集中力が続かないことも", "感情的になりやすい", "過約束してしまうことがある", "細かい作業やルーティンが苦手"],
  },
  ISTJ: {
    label: "ISTJ", desc: "管理者",
    strengths: ["高い責任感と信頼性", "緻密で正確な作業能力", "安定感と一貫性", "ルールと秩序を守る力"],
    weaknesses: ["変化への適応が遅い", "融通が利かないと見られることも", "感情表現が苦手", "新しいやり方を受け入れにくい"],
  },
  ISFJ: {
    label: "ISFJ", desc: "擁護者",
    strengths: ["思いやりと献身的なケア", "細かい気遣いと観察力", "高い責任感と誠実さ", "安定した支援を提供する力"],
    weaknesses: ["自分の意見を主張しにくい", "変化を嫌う傾向", "感謝されないと傷つく", "他者のために自分を犠牲にしすぎる"],
  },
  ESTJ: {
    label: "ESTJ", desc: "幹部",
    strengths: ["強い組織力と管理能力", "信頼性と責任感", "効率的な問題解決", "明確なコミュニケーション"],
    weaknesses: ["頑固で妥協しにくい", "感情的な配慮が不足しがち", "批判的になりやすい", "柔軟性が求められる場面での苦手意識"],
  },
  ESFJ: {
    label: "ESFJ", desc: "領事",
    strengths: ["温かみと人への献身", "周囲の調和を保つ力", "実用的なサポート力", "社交的で友好的な存在感"],
    weaknesses: ["承認を求めすぎることも", "批判を受け入れにくい", "他人の意見に流されやすい", "対立を避けすぎる"],
  },
  ISTP: {
    label: "ISTP", desc: "巨匠",
    strengths: ["冷静な分析力と問題解決", "実践的なスキルの高さ", "危機対応の能力", "独立心と柔軟な適応力"],
    weaknesses: ["感情表現が極端に少ない", "コミットメントを避ける傾向", "長期計画が苦手", "孤立しやすい"],
  },
  ISFP: {
    label: "ISFP", desc: "冒険家",
    strengths: ["豊かな感受性と芸術的センス", "現在に集中する能力", "穏やかで争いを避ける姿勢", "自由で柔軟な発想"],
    weaknesses: ["長期的な計画が苦手", "感情を内に秘めすぎる", "批判への敏感さ", "リーダーシップをとるのが苦手"],
  },
  ESTP: {
    label: "ESTP", desc: "起業家",
    strengths: ["行動力と実行力の高さ", "リスクを楽しめる度胸", "社交的で場を盛り上げる力", "即座の問題解決能力"],
    weaknesses: ["長期的な思考が苦手", "衝動的な判断をすることも", "ルールや制限が苦手", "感情的な側面を無視しがち"],
  },
  ESFP: {
    label: "ESFP", desc: "エンターテイナー",
    strengths: ["場を明るくする天性の才能", "人を喜ばせる共感力", "自発的で活動的", "現在を楽しむ能力"],
    weaknesses: ["長期計画や抽象的な思考が苦手", "集中力が続かないことも", "批判を受け入れにくい", "感情に振り回されやすい"],
  },
};


export const RELATIONSHIP_TYPES = [
  { id: "couple", label: "カップル", emoji: "💕", en: "COUPLE" },
  { id: "family", label: "家族", emoji: "🏠", en: "FAMILY" },
  { id: "friends", label: "友達", emoji: "✌️", en: "FRIENDS" },
  { id: "work", label: "職場チーム", emoji: "💼", en: "WORK TEAM" },
  { id: "study", label: "勉強グループ", emoji: "📚", en: "STUDY GROUP" },
];

function getCompatScore(t1, t2, relationship = 'friends') {
  if (t1 === t2) return 75; // same type

  const a = t1.split('');
  const b = t2.split('');
  let score = 50;
  
  // E/I difference adds some interest
  if (a[0] !== b[0]) score += 5;
  // N/S similarity is important for communication
  if (a[1] === b[1]) score += 15; else score -= 5;
  // T/F complementary is good
  if (a[2] !== b[2]) score += 10; else score += 5;
  // J/P complementary can be good
  if (a[3] !== b[3]) score += 8; else score += 5;
  
  // Special great pairings
  const pair = [t1, t2].sort().join('-');
  const greatPairs = [
    'INFJ-ENTP', 'INFP-ENFJ', 'INTJ-ENFP', 'INTP-ENTJ',
    'ISFJ-ESTP', 'ISFP-ESTJ', 'ISTJ-ESFP', 'ISTP-ESFJ',
    'ENFJ-INFP', 'ENFP-INTJ', 'ENTJ-INTP', 'ENTP-INFJ',
  ];
  const goodPairs = [
    'INFJ-ENFJ', 'INFP-ENFP', 'INTJ-ENTJ', 'INTP-ENTP',
    'ISFJ-ESFJ', 'ISFP-ESFP', 'ISTJ-ESTJ', 'ISTP-ESTP',
  ];
  
  if (greatPairs.includes(pair)) score = 88 + (hashPair(t1, t2) % 10);
  else if (goodPairs.includes(pair)) score = 78 + (hashPair(t1, t2) % 10);

  // 関係性別の補正（±5〜10点）
  const relBonus = {
    couple: (() => {
      let bonus = 0;
      if (a[2] !== b[2]) bonus += 8;   // T/F 相補（感情的補完）を重視
      if (a[1] === b[1]) bonus += 5;   // N/S 一致（価値観の近さ）
      return bonus;
    })(),
    work: (() => {
      let bonus = 0;
      if (a[3] === b[3]) bonus += 8;   // J/P 一致（仕事スタイルの合わせやすさ）
      if (a[0] !== b[0]) bonus += 4;   // E/I バランス（発信と傾聴）
      return bonus;
    })(),
    friends: (() => {
      let bonus = 0;
      if (a[0] === b[0]) bonus += 6;   // E/I 一致（コミュニケーション速度）
      return bonus;
    })(),
    family: (() => {
      let bonus = 0;
      if (a[2] === b[2]) bonus += 5;   // T/F 一致（感情表現スタイル）
      return bonus;
    })(),
    study: (() => {
      let bonus = 0;
      if (a[1] === b[1]) bonus += 8;   // N/S 一致（学習スタイルの近さ）
      if (a[3] === b[3]) bonus += 5;   // J/P 一致（計画/柔軟の相性）
      return bonus;
    })(),
  };
  score += (relBonus[relationship] || 0);

  return Math.min(98, Math.max(35, score));
}

export function calculateGroupChemistry(participants, relationship = 'friends') {
  const pairs = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const score = getCompatScore(participants[i].type, participants[j].type, relationship);
      pairs.push({
        person1: participants[i],
        person2: participants[j],
        score,
      });
    }
  }
  const avgScore = pairs.length > 0 
    ? Math.round(pairs.reduce((s, p) => s + p.score, 0) / pairs.length)
    : 0;
  return { pairs, avgScore };
}

export function getPairComment(type1, type2, relationship, score) {
  const t1 = MBTI_TYPES[type1];
  const t2 = MBTI_TYPES[type2];
  
  const comments = {
    couple: {
      high: [
        `${t1.desc}と${t2.desc}は深い絆で結ばれる運命のペア。価値観が自然と重なり合います。`,
        `お互いの弱さを受け入れ、強さを引き出し合える最高のパートナーシップ。`,
        `${t1.desc}の知性と${t2.desc}の感性が絶妙なハーモニーを奏でます。`,
      ],
      mid: [
        `${t1.desc}と${t2.desc}は刺激し合える関係。違いを楽しめるかがカギ。`,
        `コミュニケーションのスタイルは違うけど、それが新しい発見につながります。`,
      ],
      low: [
        `${t1.desc}と${t2.desc}は価値観のすり合わせが大切。お互いの世界を尊重して。`,
        `チャレンジングだけど、乗り越えたら誰よりも強い絆になる組み合わせ。`,
      ],
    },
    family: {
      high: [`家族の中で${t1.desc}と${t2.desc}は自然と助け合える関係。安心感バツグン。`],
      mid: [`${t1.desc}と${t2.desc}は役割を分担するとうまくいく。得意分野を活かして。`],
      low: [`コミュニケーションの取り方に工夫が必要。でも家族だからこその成長がある。`],
    },
    friends: {
      high: [`${t1.desc}と${t2.desc}は一緒にいるだけで楽しい最高の友達コンビ！`],
      mid: [`趣味や興味が違っても、それぞれの世界を見せ合える面白い関係。`],
      low: [`摩擦もあるけど、お互いの視点を広げてくれるスパイス的な存在。`],
    },
    work: {
      high: [`${t1.desc}と${t2.desc}は最強の仕事パートナー。得意分野が見事に補完し合う。`],
      mid: [`役割分担を明確にすれば、プロジェクトを効率よく進められるチーム。`],
      low: [`仕事のアプローチが違うからこそ、多角的な視点でイノベーションが生まれる。`],
    },
    study: {
      high: [`${t1.desc}と${t2.desc}は学び方が噛み合う。一緒に勉強すると理解が深まる。`],
      mid: [`教え合うことでお互いの弱点をカバーできる学習パートナー。`],
      low: [`学習スタイルは違うけど、違う角度からの理解が試験に強い。`],
    },
  };
  
  const rel = comments[relationship] || comments.friends;
  let pool;
  if (score >= 80) pool = rel.high;
  else if (score >= 55) pool = rel.mid;
  else pool = rel.low;
  
  return pool[hashPair(type1, type2) % pool.length];
}

export function getGroupInsights(participants, relationship) {
  const types = participants.map(p => p.type);
  const eCount = types.filter(t => t[0] === 'E').length;
  const iCount = types.filter(t => t[0] === 'I').length;
  const nCount = types.filter(t => t[1] === 'N').length;
  const sCount = types.filter(t => t[1] === 'S').length;
  const tCount = types.filter(t => t[2] === 'T').length;
  const fCount = types.filter(t => t[2] === 'F').length;
  const jCount = types.filter(t => t[3] === 'J').length;
  const pCount = types.filter(t => t[3] === 'P').length;
  
  const strengths = [];
  const cautions = [];
  
  if (eCount > 0 && iCount > 0) {
    strengths.push("外向と内向のバランスが取れていて、行動力と深い思考の両方がある");
  } else if (eCount === types.length) {
    strengths.push("全員が社交的でエネルギッシュ。盛り上がること間違いなし");
    cautions.push("静かに考える時間を意識的に作ることが大切");
  } else {
    strengths.push("深い内面の世界を共有できる、落ち着いた雰囲気のグループ");
    cautions.push("外部とのコミュニケーションを意識するとさらに良くなる");
  }
  
  if (nCount > 0 && sCount > 0) {
    strengths.push("ビジョンと実行力のバランスが良い。アイデアを形にできるチーム");
  } else if (nCount === types.length) {
    strengths.push("創造性とビジョンに溢れるグループ。新しいアイデアが次々と生まれる");
    cautions.push("細かい実務や現実的な計画を忘れずに");
  }
  
  if (tCount > 0 && fCount > 0) {
    strengths.push("論理と感情の両面から物事を判断できる、バランスの取れたチーム");
  } else if (fCount === types.length) {
    cautions.push("感情に流されず、時には客観的な視点も取り入れて");
  }
  
  if (jCount > 0 && pCount > 0) {
    cautions.push("計画派と柔軟派がいるので、スケジュールの共有をこまめに");
  }
  
  // Ensure at least 3 each
  const defaultStrengths = [
    "メンバーそれぞれの個性が光る、多様性のあるグループ",
    "お互いの違いを認め合える懐の深さがある",
    "一緒にいることで成長できる、刺激的な関係性",
  ];
  const defaultCautions = [
    "コミュニケーションのスタイルが違うことを理解して",
    "お互いのペースを尊重することが大切",
    "定期的に率直な意見交換の場を設けると良い",
  ];
  
  while (strengths.length < 3) strengths.push(defaultStrengths[strengths.length]);
  while (cautions.length < 3) cautions.push(defaultCautions[cautions.length]);
  
  return { strengths: strengths.slice(0, 3), cautions: cautions.slice(0, 3) };
}