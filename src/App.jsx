import React, { useState, useEffect, useRef } from 'react';
import {
  Play, RotateCcw, AlertCircle, CheckCircle2, School, User,
  ListOrdered, FastForward, Calculator, Info, Sparkles, BookOpen,
  Shield, GraduationCap, Link, Edit2, Users, Table2
} from 'lucide-react';
import AllocationTable from './AllocationTable.jsx';
import {
  ALL_DISTRICTS, BANDINGS, BAND_VALUES, MAIN_BAND, POA_NETS,
  HK_PRI_SCHOOLS, HK_SEC_SCHOOLS, PRIMARY_SCHOOLS,
  ELITE_PRIMARY_KEYWORDS, CROSS_NET_MAPPING,
  isGenderMatch, getDistrictFromNet, extractMainBand
} from './data.js';

// ==========================================
// App Root
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('SSPA');
  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-16">
      <header className="bg-white shadow-sm mb-6 pt-8 pb-4">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-tight flex items-center justify-center gap-3">
            <School className="w-8 h-8 text-blue-600" />
            香港中小學電腦派位模擬器
          </h1>
          <p className="text-slate-500 text-sm md:text-base text-center mb-6">
            整合教育局 2024/2026 最新官方選校名冊及真實學校數據庫。
          </p>
          <div className="flex justify-center gap-2 md:gap-4 border-b border-slate-200 flex-wrap">
            {[
              { id: 'SSPA', label: '升中派位 (SSPA)', activeClass: 'border-blue-600 text-blue-700' },
              { id: 'POA', label: '小一入學 (POA)', activeClass: 'border-emerald-600 text-emerald-700' },
              { id: 'TABLE', label: '學額分析表', activeClass: 'border-violet-600 text-violet-700' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 font-bold text-base border-b-4 transition-colors
                  ${activeTab === tab.id
                    ? tab.activeClass
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="px-4">
        {activeTab === 'SSPA' && <SSPASimulator />}
        {activeTab === 'POA' && <POASimulator />}
        {activeTab === 'TABLE' && <AllocationTable />}
      </main>
      <footer className="mt-16 max-w-6xl mx-auto border-t border-slate-300 pt-8 px-4 text-slate-500 text-xs md:text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h4 className="font-black text-slate-700 text-base mb-3 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-indigo-500"/> 關於本系統數據庫
            </h4>
            <p className="mb-2">本系統已匯入真實數據庫，提供全港 18 區大量中學的教育局官方編號、統一派位非保留學額等數據。</p>
            <p>中學 Banding 評級採用坊間參考數據，並整合 <strong className="text-slate-700">Schooland.hk</strong> 及 <strong className="text-slate-700">BigExam.hk</strong> 雙重指標。</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h4 className="font-black text-slate-700 text-base mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500"/> EDB 機制說明 &amp; 聲明
            </h4>
            <p className="mb-2">本模擬器依據教育局官方機制編寫：SSPA 以大 Band（1/2/3）決定分配優先次序；POA 計分制最高 35 分（20+5+10）。</p>
            <div className="flex flex-col gap-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <a href="https://youtu.be/T4qlzj2il8o" target="_blank" rel="noreferrer"
                className="text-blue-600 font-bold hover:underline flex items-center">
                <Link className="w-4 h-4 mr-2"/> 觀看【統一派位學額分析表】解讀影片
              </a>
              <a href="https://www.facebook.com/groups/611513233039948" target="_blank" rel="noreferrer"
                className="text-blue-600 font-bold hover:underline flex items-center">
                <Link className="w-4 h-4 mr-2"/> 加入全港・升中一家長互助 Facebook 群組
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// Shared: Terminal animation view
// ==========================================
function TerminalView({ logs, isSimulating, onSkip, accentColor = 'blue', logsEndRef }) {
  const headerCls = accentColor === 'emerald'
    ? 'text-emerald-300 border-emerald-700'
    : 'text-slate-300 border-slate-700';

  return (
    <div className={`bg-slate-900 rounded-xl shadow-2xl p-6 max-w-5xl mx-auto font-mono text-sm flex flex-col h-[650px] border-2 ${accentColor === 'emerald' ? 'border-emerald-700' : 'border-slate-700'}`}>
      <div className={`flex justify-between items-center mb-4 border-b pb-3 ${headerCls}`}>
        <div className="flex items-center font-bold text-lg">
          <AlertCircle className="w-6 h-6 mr-2 text-yellow-400 animate-pulse" />
          {accentColor === 'emerald' ? 'POA 小一入學統籌辦法電腦模擬中...' : 'SSPA 升中電腦派位系統模擬中...'}
        </div>
        {isSimulating && (
          <button onClick={onSkip}
            className="flex items-center text-sm bg-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 border border-slate-600">
            <FastForward className="w-4 h-4 mr-1" /> 略過動畫
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4 pb-8 text-base">
        {logs.map((log, i) => (
          <div key={i} className={`
            ${log.type === 'header' ? `${accentColor === 'emerald' ? 'text-emerald-300 border-emerald-500 bg-emerald-900/30' : 'text-blue-300 border-blue-500 bg-blue-900/30'} font-black mt-6 mb-2 border-l-4 pl-3 py-2` : ''}
            ${log.type === 'info' ? 'text-slate-300' : ''}
            ${log.type === 'check' ? 'text-yellow-300' : ''}
            ${log.type === 'success' ? 'text-emerald-400 font-bold bg-emerald-900/40 p-3 rounded border border-emerald-800/60' : ''}
            ${log.type === 'fail' ? 'text-rose-400' : ''}
          `}>
            {log.type === 'check' && '> '}{log.text}
          </div>
        ))}
        {isSimulating && <div className="text-slate-500 animate-pulse mt-4 text-2xl">_</div>}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

// ==========================================
// SSPA Simulator
// ==========================================
function SSPASimulator() {
  const [step, setStep] = useState('FORM');
  const [formData, setFormData] = useState({
    district: '九龍城區',
    primarySchoolMode: 'list',
    primarySchool: '',
    customPrimarySchool: '',
    totalStudents: '140',
    studentRank: '50',
    banding: '2A',
    gender: '男女',
    partA: Array.from({ length: 3 }, () => ({ district: '', code: '' })),
    partB: Array.from({ length: 30 }, () => ({ district: '九龍城區', code: '' }))
  });
  const [primaryTier, setPrimaryTier] = useState(2);
  const [allLogs, setAllLogs] = useState([]);
  const [shownLogs, setShownLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);
  const logsEndRef = useRef(null);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [shownLogs]);

  useEffect(() => {
    if (isSimulating && shownLogs.length < allLogs.length) {
      const t = setTimeout(() => setShownLogs(p => [...p, allLogs[p.length]]), 480);
      return () => clearTimeout(t);
    } else if (isSimulating && shownLogs.length === allLogs.length && allLogs.length > 0) {
      setTimeout(() => { setIsSimulating(false); setStep('RESULT'); }, 800);
    }
  }, [isSimulating, shownLogs, allLogs]);

  const skipAnim = () => { setShownLogs(allLogs); setIsSimulating(false); setStep('RESULT'); };

  // Banding estimation
  const estimateBand = (rank, total, tier) => {
    const r = parseInt(rank), t = parseInt(total);
    if (!r || !t || r > t || r <= 0) return null;
    const pct = (r / t) * 100;
    if (tier === 1) {
      if (pct <= 20) return '1A'; if (pct <= 40) return '1B'; if (pct <= 60) return '1C';
      if (pct <= 70) return '2A'; if (pct <= 80) return '2B'; if (pct <= 85) return '2C';
      if (pct <= 90) return '3A'; if (pct <= 95) return '3B'; return '3C';
    } else {
      // Standard EDB allocation: 9 equal bands across full cohort
      if (pct <= 11) return '1A'; if (pct <= 22) return '1B'; if (pct <= 33) return '1C';
      if (pct <= 44) return '2A'; if (pct <= 55) return '2B'; if (pct <= 66) return '2C';
      if (pct <= 77) return '3A'; if (pct <= 88) return '3B'; return '3C';
    }
  };

  const getTier = (name, district, mode, custom) => {
    if (mode === 'manual') return ELITE_PRIMARY_KEYWORDS.some(k => (custom || '').includes(k)) ? 1 : 2;
    if (!name) return 2;
    const dList = PRIMARY_SCHOOLS[district] || [];
    const dss = PRIMARY_SCHOOLS['直資私立(不限地區)'] || [];
    return (dss.includes(name) || ELITE_PRIMARY_KEYWORDS.some(k => name.includes(k)) || (dList.indexOf(name) !== -1 && dList.indexOf(name) < 10)) ? 1 : 2;
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const nd = { ...prev, [field]: value };
      if (field === 'district') {
        nd.primarySchool = ''; nd.customPrimarySchool = ''; nd.primarySchoolMode = 'list';
        nd.partB = Array.from({ length: 30 }, () => ({ district: value, code: '' }));
      }
      if (field === 'primarySchool' && value === 'MANUAL_ENTRY') {
        nd.primarySchoolMode = 'manual'; nd.primarySchool = '';
        return nd;
      }
      const tier = getTier(
        field === 'primarySchool' ? value : nd.primarySchool,
        nd.district,
        field === 'customPrimarySchool' ? 'manual' : nd.primarySchoolMode,
        field === 'customPrimarySchool' ? value : nd.customPrimarySchool
      );
      setPrimaryTier(tier);
      const newBand = estimateBand(nd.studentRank, nd.totalStudents, tier);
      if (newBand) nd.banding = newBand;
      return nd;
    });
  };

  const getPartBSchools = (district) => {
    const allowed = CROSS_NET_MAPPING[district];
    const pool = allowed
      ? HK_SEC_SCHOOLS.filter(s => allowed.includes(s.code) || s.district === district)
      : HK_SEC_SCHOOLS.filter(s => s.district === district);
    return pool.filter(s => isGenderMatch(s.type, formData.gender));
  };

  const handlePartAChange = (i, field, value) => {
    const na = [...formData.partA];
    na[i] = { ...na[i], [field]: value };
    if (field === 'district') na[i].code = '';
    setFormData(p => ({ ...p, partA: na }));
  };

  const handlePartBChange = (i, code) => {
    const nb = [...formData.partB];
    nb[i] = { ...nb[i], code };
    setFormData(p => ({ ...p, partB: nb }));
  };

  const recommend = () => {
    const sv = BAND_VALUES[formData.banding];
    const sm = MAIN_BAND[formData.banding];
    const allA = HK_SEC_SCHOOLS.filter(s => isGenderMatch(s.type, formData.gender));
    const allB = getPartBSchools(formData.district);
    if (!allB.length) { alert('資料庫缺少該區數據，請切換至九龍城/沙田等熱門地區。'); return; }
    const shuffle = a => [...a].sort(() => Math.random() - 0.5);

    // Part A: reach (higher main band), target (same), safe
    const reachA = shuffle(allA.filter(s => s.mainBand < sm));
    const targetA = shuffle(allA.filter(s => s.mainBand === sm));
    const selA = [reachA[0] || targetA[0], targetA[0] || reachA[0], targetA[1] || allA[0]].filter(Boolean);

    // Part B: mix of reach, target, safe
    const reachB = shuffle(allB.filter(s => s.mainBand < sm));
    const targetB = shuffle(allB.filter(s => s.mainBand === sm));
    const safeB = shuffle(allB.filter(s => s.mainBand > sm));
    const selB = [];
    for (const pool of [reachB, targetB, safeB, shuffle(allB)]) {
      for (const s of pool) { if (selB.length >= 30) break; if (!selB.find(x => x.code === s.code)) selB.push(s); }
    }

    setFormData(p => ({
      ...p,
      partA: Array.from({ length: 3 }, (_, i) => ({ district: selA[i]?.district || '', code: selA[i]?.code || '' })),
      partB: Array.from({ length: 30 }, (_, i) => ({ district: p.district, code: selB[i]?.code || '' }))
    }));
  };

  const simulate = () => {
    const finalPri = formData.primarySchoolMode === 'manual' ? formData.customPrimarySchool : formData.primarySchool;
    if (!finalPri) { alert('請選擇或手動輸入就讀的小學名稱！'); return; }

    const sv = BAND_VALUES[formData.banding];
    // EDB: allocation priority is based on MAIN band (1/2/3), not sub-band
    const sm = MAIN_BAND[formData.banding];
    // Random number 1-100; within same main band, HIGHER = allocated first
    const rnd = Math.floor(Math.random() * 100) + 1;

    let logs = [];
    let allocated = null, reason = '', stage = '';

    logs.push({ type: 'info', text: '【教育局 SSPA 電腦派位系統啟動】' });
    logs.push({ type: 'info', text: `> 小學：[${finalPri}]　全港及校網派位大 Band：Band ${sm}　子 Band：${formData.banding}` });
    logs.push({ type: 'info', text: `> 同組別隨機編號：${rnd}/100（號碼越大越優先獲派）` });
    logs.push({ type: 'info', text: `> 教育局機制：學校按 Band 1→2→3 順序填滿學額；同 Band 內以隨機編號決定優先次序。` });

    // EDB: A lower-band student CAN receive a higher-band school if places remain after higher-band students.
    // We model this with chance based on openPlaces and band gap.
    const tryAlloc = (choiceObj, isPartA, idx) => {
      if (!choiceObj?.code) return { ok: false, text: '志願留空，跳過。' };
      const sch = HK_SEC_SCHOOLS.find(s => s.code === choiceObj.code);
      if (!sch) return { ok: false, text: '找不到此學校。' };
      if (!isGenderMatch(sch.type, formData.gender)) return { ok: false, text: `👉 失敗：${sch.name} 只招收${sch.type}生，資格不符。` };

      const sm2 = sch.mainBand;
      let chance = 0;

      if (sm < sm2) {
        // Student is higher main band than school's rating: strong chance
        chance = 90 + Math.min(rnd * 0.1, 9);
      } else if (sm === sm2) {
        // Same main band: random number determines outcome
        // Higher rnd = more competitive
        chance = isPartA
          ? (rnd > 80 ? 70 : rnd > 50 ? 35 : 10)
          : (rnd > 70 ? 85 : rnd > 40 ? 50 : 20);
        // Adjust for available places
        if (sch.openPlaces > 60) chance += 10;
        if (sch.openPlaces < 15) chance -= 15;
      } else {
        // Student is lower band than school: possible only if places remain (unlikely but valid per EDB)
        chance = isPartA
          ? (rnd > 95 ? 10 : 0)
          : (rnd > 90 ? (sch.openPlaces > 50 ? 15 : 5) : 0);
      }
      chance = Math.max(0, Math.min(100, chance));

      const ok = Math.random() * 100 < chance;
      if (ok) {
        return { ok: true, school: sch, text: `👉 成功獲派！[${sch.financeType}] [${sch.moi}] [非保留學額: ${sch.openPlaces}]　隨機編號 ${rnd} 在 Band ${sm} 中順利中籤。` };
      }
      const why = sm > sm2
        ? `👉 失敗：該校公開學額 ${sch.openPlaces} 個，在 Band ${sm2} 已用盡，你的 Band ${sm} 未能獲派。`
        : `👉 失敗：同 Band ${sm} 競爭激烈，你的隨機編號 ${rnd} 未能於此志願中籤。`;
      return { ok: false, text: why };
    };

    logs.push({ type: 'header', text: '=== 甲部（不受學校網限制，10% 學額，3 個志願）===' });
    for (let i = 0; i < 3 && !allocated; i++) {
      if (formData.partA[i]?.code) {
        const sch = HK_SEC_SCHOOLS.find(s => s.code === formData.partA[i].code);
        logs.push({ type: 'check', text: `甲部志願 ${i+1}：[${sch?.code}] ${sch?.name}` });
        const r = tryAlloc(formData.partA[i], true, i);
        logs.push({ type: r.ok ? 'success' : 'fail', text: r.text });
        if (r.ok) { allocated = r.school; stage = '甲部 (不受校網限制)'; reason = `配合良好的隨機編號（${rnd}/100），成功在競爭最激烈的甲部獲派第 ${i+1} 志願。`; }
      }
    }

    if (!allocated) {
      logs.push({ type: 'header', text: '=== 乙部（按學校網，90% 學額，30 個志願）===' });
      for (let i = 0; i < 30 && !allocated; i++) {
        if (formData.partB[i]?.code) {
          const sch = HK_SEC_SCHOOLS.find(s => s.code === formData.partB[i].code);
          logs.push({ type: 'check', text: `乙部志願 ${i+1}：[${sch?.code}] ${sch?.name}` });
          const r = tryAlloc(formData.partB[i], false, i);
          logs.push({ type: r.ok ? 'success' : 'fail', text: r.text });
          if (r.ok) { allocated = r.school; stage = '乙部 (按校網限制)'; reason = `乙部處理你的 Band ${sm} 時，第 ${i+1} 志願仍有剩餘學額，隨機編號 ${rnd} 成功中籤。`; }
        }
      }
    }

    if (!allocated) {
      logs.push({ type: 'header', text: '=== 33 個志願全部落空，系統中央隨機分配 ===' });
      const pool = HK_SEC_SCHOOLS.filter(s => s.district === formData.district && isGenderMatch(s.type, formData.gender));
      allocated = pool[Math.floor(Math.random() * pool.length)];
      logs.push({ type: 'info', text: '警告：所有志願已派發，系統於校網內尋找剩餘學位...' });
      logs.push({ type: 'success', text: `👉 中央分配：[${allocated?.code}] ${allocated?.name}` });
      stage = '系統中央隨機分配'; reason = '所有 33 個志願學校已在你組別前派發完畢，系統隨機分配至網內仍有空缺的學校（叩底）。';
    }

    setAllLogs(logs);
    setResult({ school: allocated, reason, stage, rnd, finalPri });
    setShownLogs([]);
    setStep('SIMULATION');
    setIsSimulating(true);
  };

  if (step === 'SIMULATION') return <TerminalView logs={shownLogs} isSimulating={isSimulating} onSkip={skipAnim} accentColor="blue" logsEndRef={logsEndRef} />;

  if (step === 'RESULT') return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto border border-slate-200">
      <div className="bg-slate-900 p-10 text-center text-white relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
        <School className="w-16 h-16 mx-auto mb-4 text-white/80" />
        <h2 className="text-4xl font-black mb-2 tracking-widest">派位結果通知書</h2>
        <p className="text-slate-400">中學學位分配辦法 SSPA（模擬）</p>
      </div>
      <div className="p-6 md:p-10">
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200">
          <div className="grid grid-cols-2 gap-y-5 text-sm md:text-base mb-8 pb-8 border-b border-slate-200">
            <div><span className="text-slate-500 block font-bold mb-1">就讀小學：</span><span className="font-bold text-slate-800">{result.finalPri}</span></div>
            <div><span className="text-slate-500 block font-bold mb-1">全港派位組別：</span><span className="font-black text-blue-700 text-xl">Band {formData.banding}</span><span className="text-slate-400 text-sm ml-2">({formData.studentRank}/{formData.totalStudents})</span></div>
            <div><span className="text-slate-500 block font-bold mb-1">獲派階段：</span><span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">{result.stage}</span></div>
            <div><span className="text-slate-500 block font-bold mb-1">隨機編號：</span><span className="font-black text-slate-800 text-lg">{result.rnd}<span className="text-slate-400 text-sm font-normal"> / 100</span></span></div>
          </div>
          <div className="text-center py-6 bg-white rounded-xl border-2 border-emerald-500 shadow-sm">
            <span className="text-slate-500 block mb-3 font-bold tracking-widest">✅ 最終獲派中學</span>
            <div className="text-3xl md:text-4xl font-black text-emerald-700 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-9 h-9 mr-3 flex-shrink-0" />{result.school?.name || '系統無法分配'}
            </div>
            {result.school && (
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="bg-slate-800 text-white px-3 py-1 rounded">編號: {result.school.code}</span>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded border">{result.school.district}</span>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded border border-indigo-200">{result.school.financeType}</span>
                <span className={`px-3 py-1 rounded border ${result.school.moi==='英中'?'bg-amber-50 text-amber-700 border-amber-200':'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{result.school.moi}</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded border border-blue-200">非保留學額: {result.school.openPlaces}</span>
              </div>
            )}
            {result.school && (
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-5 text-sm text-slate-600 bg-slate-50 p-3 mx-4 rounded-lg">
                <div className="flex items-center"><BookOpen className="w-4 h-4 mr-1 text-blue-500"/>Schooland 估算: <strong className="ml-1">Band {result.school.schoolandBand}</strong></div>
                <div className="hidden md:block text-slate-300">|</div>
                <div className="flex items-center"><Shield className="w-4 h-4 mr-1 text-purple-500"/>BigExam 估算: <strong className="ml-1">Band {result.school.bigExamBand}</strong></div>
              </div>
            )}
          </div>
        </div>
        <div className="mb-8">
          <h3 className="font-bold text-xl text-slate-800 mb-3 flex items-center"><ListOrdered className="mr-2 text-blue-600 w-6 h-6"/>派位分析</h3>
          <div className="bg-blue-50 text-blue-900 p-5 rounded-xl border border-blue-200 leading-relaxed font-medium">{result.reason}</div>
        </div>
        <button onClick={() => { setStep('FORM'); setShownLogs([]); setAllLogs([]); }}
          className="w-full bg-white hover:bg-slate-50 text-slate-800 font-black py-5 rounded-xl flex items-center justify-center text-xl border-2 border-slate-300">
          <RotateCcw className="mr-2 w-6 h-6"/> 返回修改志願表
        </button>
      </div>
    </div>
  );

  // FORM
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 max-w-6xl mx-auto border border-blue-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center"><BookOpen className="mr-2 text-blue-600"/>中學學位分配辦法 (SSPA) 志願表</h2>
          <p className="text-slate-500 text-sm mt-1">依據教育局機制：甲部 3 個不限區志願（10%）＋ 乙部 30 個校網志願（90%）</p>
        </div>
        <button onClick={recommend} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="w-5 h-5"/> AI 推薦填滿志願
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center border-b pb-2">
          <Calculator className="mr-2 w-5 h-5 text-slate-500"/>基本資料與派位組別推算
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">居住所屬校網（地區）</label>
            <select value={formData.district} onChange={e => handleChange('district', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg bg-white font-medium">
              {ALL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>就讀小學</span>
              {formData.primarySchoolMode === 'manual' && (
                <button onClick={() => setFormData(p => ({ ...p, primarySchoolMode: 'list', customPrimarySchool: '' }))}
                  className="text-xs text-blue-500 hover:underline flex items-center"><RotateCcw className="w-3 h-3 mr-1"/>返回選單</button>
              )}
            </label>
            {formData.primarySchoolMode === 'list' ? (
              <select value={formData.primarySchool} onChange={e => handleChange('primarySchool', e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg bg-white">
                <option value="">-- 請選擇小學 --</option>
                {PRIMARY_SCHOOLS[formData.district] && (
                  <optgroup label={`本區 (${formData.district})`}>
                    {PRIMARY_SCHOOLS[formData.district].map(p => <option key={p}>{p}</option>)}
                  </optgroup>
                )}
                {PRIMARY_SCHOOLS['直資私立(不限地區)'] && (
                  <optgroup label="直資/私立小學 (全港)">
                    {PRIMARY_SCHOOLS['直資私立(不限地區)'].map(p => <option key={p}>{p}</option>)}
                  </optgroup>
                )}
                <option value="MANUAL_ENTRY" className="font-bold text-blue-600">➕ 手動輸入其他小學...</option>
              </select>
            ) : (
              <div className="relative">
                <Edit2 className="w-4 h-4 absolute left-3 top-3.5 text-slate-400"/>
                <input type="text" value={formData.customPrimarySchool}
                  onChange={e => handleChange('customPrimarySchool', e.target.value)}
                  placeholder="請輸入小學全名" autoFocus
                  className="w-full p-3 pl-9 border border-blue-400 rounded-lg bg-white shadow-inner"/>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">小學全級總人數</label>
            <input type="number" value={formData.totalStudents} onChange={e => handleChange('totalStudents', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">呈分試全級名次</label>
            <input type="number" value={formData.studentRank} onChange={e => handleChange('studentRank', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">學生性別</label>
            <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg bg-white">
              <option value="男女">未指定（顯示所有學校）</option>
              <option value="男">男</option><option value="女">女</option>
            </select>
          </div>
        </div>
        {/* Banding display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800 block mb-1">系統推算派位組別：</span>
            <span className="text-sm text-slate-600 flex items-center">
              <Info className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0"/>
              {primaryTier === 1 ? '傳統名校/直資（Band 1比例較高）' : '一般津貼/官立（全港標準比例）'}
            </span>
            <p className="text-xs text-slate-400 mt-1">教育局以大 Band（1/2/3）決定分配優先次序，子 Band（1A/1B/1C）為學校評級參考。</p>
          </div>
          <div className="flex items-center bg-white p-1.5 rounded-lg border border-blue-300 shadow-sm">
            <span className="text-3xl font-black text-blue-700 mx-5">Band {formData.banding}</span>
            <div className="border-l border-slate-200 pl-3 pr-1">
              <select value={formData.banding} onChange={e => setFormData(p => ({ ...p, banding: e.target.value }))}
                className="text-sm p-2 bg-transparent border-none outline-none text-slate-500 cursor-pointer hover:bg-slate-100 rounded">
                <option value={formData.banding} disabled>手動修改</option>
                {BANDINGS.map(b => <option key={b} value={b}>改為 Band {b}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Part A */}
      <div className="mb-10">
        <div className="bg-blue-600 p-4 rounded-t-xl">
          <h3 className="text-lg font-bold text-white">甲部：不受學校網限制（可選全港任何地區）</h3>
          <p className="text-sm text-blue-100 mt-1">佔全港學額約 10%。最多填 3 間，請填最心儀學校。</p>
        </div>
        <div className="border border-blue-200 rounded-b-xl p-4 md:p-6 bg-white grid gap-5">
          {formData.partA.map((ch, i) => {
            const sel = HK_SEC_SCHOOLS.find(s => s.code === ch.code);
            return (
              <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <span className="w-24 font-bold text-slate-700 bg-slate-100 p-2 rounded-md text-center text-sm border border-slate-200 shrink-0">甲部志願 {i+1}</span>
                  <select value={ch.district} onChange={e => handlePartAChange(i, 'district', e.target.value)}
                    className="p-3 border border-slate-300 rounded-md bg-white md:w-48 font-medium">
                    <option value="">- 篩選地區 -</option>
                    {ALL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <select value={ch.code} onChange={e => handlePartAChange(i, 'code', e.target.value)}
                    disabled={!ch.district}
                    className="flex-1 p-3 border border-slate-300 rounded-md bg-white disabled:bg-slate-100 font-medium truncate">
                    <option value="">{ch.district ? '- 請選擇中學 -' : '- 請先選地區 -'}</option>
                    {HK_SEC_SCHOOLS.filter(s => s.district === ch.district && isGenderMatch(s.type, formData.gender)).map(s => (
                      <option key={s.code} value={s.code}>[{s.code}] {s.name}</option>
                    ))}
                  </select>
                </div>
                {sel && (
                  <div className="mt-2 ml-0 md:ml-28 flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">Banding: <strong>{sel.schoolandBand}</strong></span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{sel.financeType}</span>
                    <span className={`px-2 py-1 rounded ${sel.moi==='英中'?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700'}`}>{sel.moi}</span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">非保留學額: <strong>{sel.openPlaces}</strong></span>
                    {sel.resvPlaces > 0 && <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">聯繫學額: {sel.resvPlaces}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part B */}
      <div className="mb-10">
        <div className="bg-emerald-600 p-4 rounded-t-xl">
          <h3 className="text-lg font-bold text-white">乙部：按學校網（{formData.district} 及官方他區）</h3>
          <p className="text-sm text-emerald-100 mt-1">佔全港學額約 90%。最多填 30 間。選單已鎖定官方《中學一覽表》合法選擇。</p>
        </div>
        <div className="border border-emerald-200 rounded-b-xl p-4 md:p-6 bg-white grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
          {formData.partB.map((ch, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-10 font-bold text-slate-400 text-sm text-right shrink-0">{i+1}</span>
              <select value={ch.code} onChange={e => handlePartBChange(i, e.target.value)}
                className="flex-1 p-2.5 text-sm border border-slate-300 rounded-md bg-white font-medium truncate">
                <option value="">- 未填寫 -</option>
                {getPartBSchools(formData.district).map(s => (
                  <option key={s.code} value={s.code}>[{s.code}] {s.name} ({s.financeType} {s.moi} | 學額:{s.openPlaces} | Band:{s.schoolandBand})</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <button onClick={simulate}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-xl shadow-xl flex items-center justify-center text-xl transition transform hover:-translate-y-1 border-b-4 border-slate-700">
        <Play className="mr-2 w-6 h-6"/> 開始執行統一派位（大抽獎）電腦演算
      </button>
    </div>
  );
}

// ==========================================
// POA Simulator
// ==========================================
function POASimulator() {
  const [step, setStep] = useState('FORM');
  const [data, setData] = useState({
    net: '41網 (九龍城/九龍塘)',
    gender: '男女',
    discretionarySchool: '',
    hasSibling: false,
    // EDB: Cat 1-5 pick ONE (max 20), Cat 6-7 pick ONE (max 5), age = 10
    cat25: 'none',   // none=0, firstborn=5, alumni=10, manager=20
    cat67: 'none',   // none=0, religion=5
    rightAge: true,  // +10
    partA: Array.from({ length: 3 }, () => ({ district: '', name: '' })),
    partB: Array.from({ length: 30 }, () => '')
  });
  const [allLogs, setAllLogs] = useState([]);
  const [shownLogs, setShownLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);
  const logsEndRef = useRef(null);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [shownLogs]);

  useEffect(() => {
    if (isSimulating && shownLogs.length < allLogs.length) {
      const t = setTimeout(() => setShownLogs(p => [...p, allLogs[p.length]]), 480);
      return () => clearTimeout(t);
    } else if (isSimulating && shownLogs.length === allLogs.length && allLogs.length > 0) {
      setTimeout(() => { setIsSimulating(false); setStep('RESULT'); }, 800);
    }
  }, [isSimulating, shownLogs, allLogs]);

  const skipAnim = () => { setShownLogs(allLogs); setIsSimulating(false); setStep('RESULT'); };

  const getScore = () => {
    let s = 0;
    if (data.cat25 === 'firstborn') s += 5;
    else if (data.cat25 === 'alumni') s += 10;
    else if (data.cat25 === 'manager') s += 20;
    if (data.cat67 === 'religion') s += 5;
    if (data.rightAge) s += 10;
    return s; // max = 35
  };

  const getNetSchools = (netStr, gender) => {
    if (!netStr) return [];
    const code = netStr.split('網')[0];
    return HK_PRI_SCHOOLS.filter(s => s.net === code && isGenderMatch(s.type, gender));
  };

  const handleChange = (f, v) => setData(p => ({ ...p, [f]: v }));

  const handlePartAChange = (i, field, val) => {
    const na = [...data.partA];
    na[i] = { ...na[i], [field]: val };
    if (field === 'district') na[i].name = '';
    setData(p => ({ ...p, partA: na }));
  };

  const handlePartBChange = (i, val) => {
    const nb = [...data.partB]; nb[i] = val;
    setData(p => ({ ...p, partB: nb }));
  };

  const autoFill = () => {
    const netCode = data.net.split('網')[0];
    const allValid = HK_PRI_SCHOOLS.filter(s => isGenderMatch(s.type, data.gender));
    const netValid = allValid.filter(s => s.net === netCode);
    if (!netValid.length) { alert('資料庫暫未包含此校網的小學，請選擇熱門校網（如 41、91、88）測試。'); return; }
    const sh = a => [...a].sort(() => Math.random() - 0.5);
    const rA = sh(allValid).slice(0, 3);
    const rB = sh(netValid);
    setData(p => ({
      ...p,
      partA: rA.map(s => ({ district: getDistrictFromNet(s.net) || '', name: s.name })),
      partB: Array.from({ length: 30 }, (_, i) => rB[i]?.name || '')
    }));
  };

  const simulate = () => {
    if (!data.net) { alert('請選擇所屬校網！'); return; }
    const rnd = Math.floor(Math.random() * 1000) + 1;
    let logs = [], allocated = null, reason = '', stage = '';

    logs.push({ type: 'info', text: '【教育局 POA 小一入學統籌辦法模擬系統啟動】' });
    logs.push({ type: 'info', text: `> 所屬校網：${data.net}` });

    // --- Phase 1: Discretionary (自行分配) ---
    if (data.discretionarySchool) {
      logs.push({ type: 'header', text: '=== 第一階段：自行分配學位（佔約 50% 學位）===' });
      const sch = HK_PRI_SCHOOLS.find(s => s.name === data.discretionarySchool);
      if (sch) {
        logs.push({ type: 'check', text: `向 [${sch.name}] 申請自行分配學位...` });
        if (data.hasSibling) {
          // EDB: siblings/parent staff = guaranteed mandatory admission (必收生)
          allocated = sch; stage = '自行分配學位 (必收生/世襲生)';
          reason = '你符合「必收生」資格（兄姊就讀同校或父母任職），無須計分直接獲派。';
          logs.push({ type: 'success', text: '👉 成功！必收生資格，直接錄取，無須參加計分。' });
        } else {
          // EDB: score-based discretionary, max 35 pts
          const score = getScore();
          logs.push({ type: 'info', text: `> 你的自行分配總分：${score}/35 分` });
          logs.push({ type: 'info', text: `> 教育局計分制：第1-5類選一（最高20分）＋第6-7類選一（最高5分）＋年齡（10分）= 最高35分` });
          // Chance model based on school popularity and score
          let chance = 0;
          if (sch.popularity >= 90) { chance = score >= 30 ? 75 : score >= 20 ? 20 : 2; }
          else if (sch.popularity >= 80) { chance = score >= 25 ? 90 : score >= 20 ? 50 : score >= 15 ? 10 : 2; }
          else { chance = score >= 20 ? 92 : score >= 15 ? 65 : 20; }
          const ok = Math.random() * 100 < chance;
          if (ok) {
            allocated = sch; stage = '自行分配學位 (計分制)';
            reason = `你的計分制總分 ${score}/35 分在激烈競爭中脫穎而出，成功取得自行分配學位。`;
            logs.push({ type: 'success', text: `👉 成功！總分 ${score} 分，競爭力足夠，幸運取得學位。` });
          } else {
            logs.push({ type: 'fail', text: `👉 失敗：${score} 分未能在計分或同分抽籤中勝出，進入統一派位。` });
          }
        }
      }
    }

    // --- Phase 2: Central Allocation (統一派位) ---
    // EDB: Remaining ~50% = Part A (~10% territory-wide) + Part B (~40% school-net)
    if (!allocated) {
      logs.push({ type: 'info', text: `> 進入統一派位。大抽獎隨機編號：${rnd}/1000（號碼越大越優先）。` });
      logs.push({ type: 'info', text: `> 統一派位共約佔學校 50% 學額：甲部（約10%，不限地區，3個志願）＋乙部（約40%，按校網，30個志願）。` });

      const tryPOA = (name, isA) => {
        if (!name) return { ok: false };
        const sch = HK_PRI_SCHOOLS.find(s => s.name === name);
        if (!sch) return { ok: false };
        const threshold = isA
          ? Math.max(50, 1000 - sch.popularity * 9)
          : Math.max(100, 1000 - sch.popularity * 7);
        return { ok: rnd >= threshold, school: sch };
      };

      logs.push({ type: 'header', text: '=== 甲部：不受校網限制（約佔 10% 學額，3 個志願）===' });
      for (let i = 0; i < 3 && !allocated; i++) {
        const name = data.partA[i]?.name;
        if (name) {
          logs.push({ type: 'check', text: `甲部志願 ${i+1}：${name}` });
          const r = tryPOA(name, true);
          if (r.ok) {
            allocated = r.school; stage = '甲部 (不受校網限制)';
            reason = `你的隨機編號 ${rnd}/1000 足以在甲部取得第 ${i+1} 志願學位（不受校網限制的 10% 學額）。`;
            logs.push({ type: 'success', text: `👉 成功！編號 ${rnd} 在此校甲部學額中中籤。` });
          } else {
            logs.push({ type: 'fail', text: `👉 失敗：甲部學額競爭激烈，編號 ${rnd} 未能中籤。` });
          }
        }
      }

      if (!allocated) {
        logs.push({ type: 'header', text: '=== 乙部：按校網（約佔 40% 學額，30 個志願）===' });
        for (let i = 0; i < 30 && !allocated; i++) {
          const name = data.partB[i];
          if (name) {
            logs.push({ type: 'check', text: `乙部志願 ${i+1}：${name}` });
            const r = tryPOA(name, false);
            if (r.ok) {
              allocated = r.school; stage = '乙部 (按校網)';
              reason = `你的隨機編號 ${rnd}/1000，在乙部第 ${i+1} 志願仍有餘額時成功中籤（校網約 40% 學額）。`;
              logs.push({ type: 'success', text: `👉 成功！` });
            } else {
              logs.push({ type: 'fail', text: `👉 失敗：學額已滿。` });
            }
          }
        }
      }

      if (!allocated) {
        logs.push({ type: 'header', text: '=== 所有志願落空，系統中央隨機分配 ===' });
        const pool = getNetSchools(data.net, data.gender);
        allocated = pool[Math.floor(Math.random() * pool.length)] || { name: '校網內某小學', net: data.net };
        logs.push({ type: 'success', text: `👉 中央分配：[${allocated.name}]` });
        stage = '系統中央隨機分配';
        reason = '所有志願學位已被隨機編號更前的申請人取得，系統將你隨機分配至校網內仍有空缺的學校（叩底）。';
      }
    }

    setAllLogs(logs);
    setResult({ school: allocated, reason, stage, rnd });
    setShownLogs([]);
    setStep('SIMULATION');
    setIsSimulating(true);
  };

  if (step === 'SIMULATION') return <TerminalView logs={shownLogs} isSimulating={isSimulating} onSkip={skipAnim} accentColor="emerald" logsEndRef={logsEndRef} />;

  if (step === 'RESULT') return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto border border-emerald-200">
      <div className="bg-emerald-800 p-10 text-center text-white relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <Users className="w-16 h-16 mx-auto mb-4 text-white/80"/>
        <h2 className="text-4xl font-black mb-2 tracking-widest">小一派位結果通知書</h2>
        <p className="text-emerald-100">小一入學統籌辦法 POA（模擬）</p>
      </div>
      <div className="p-6 md:p-10">
        <div className="bg-emerald-50 rounded-2xl p-6 mb-8 border border-emerald-100">
          <div className="grid grid-cols-2 gap-y-5 text-sm md:text-base mb-8 pb-8 border-b border-emerald-200">
            <div><span className="text-slate-500 block font-bold mb-1">所屬校網：</span><span className="font-bold text-slate-800">{data.net}</span></div>
            <div><span className="text-slate-500 block font-bold mb-1">獲派階段：</span><span className="font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md">{result.stage}</span></div>
            <div className="col-span-2"><span className="text-slate-500 block font-bold mb-1">大抽獎隨機編號：</span><span className="font-black text-slate-800 text-xl">{result.rnd}<span className="text-slate-400 text-sm font-normal"> / 1000</span></span></div>
          </div>
          <div className="text-center py-6 bg-white rounded-xl border-2 border-teal-500 shadow-sm">
            <span className="text-slate-500 block mb-3 font-bold tracking-widest">✅ 最終獲派小學</span>
            <div className="text-3xl md:text-4xl font-black text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 mr-3 flex-shrink-0"/>{result.school?.name || '系統錯誤'}
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="font-bold text-xl text-slate-800 mb-3 flex items-center"><ListOrdered className="mr-2 text-emerald-600 w-6 h-6"/>派位分析</h3>
          <div className="bg-teal-50 text-teal-900 p-5 rounded-xl border border-teal-200 leading-relaxed font-medium">{result.reason}</div>
        </div>
        <button onClick={() => { setStep('FORM'); setShownLogs([]); setAllLogs([]); }}
          className="w-full bg-white hover:bg-emerald-50 text-slate-800 font-black py-5 rounded-xl flex items-center justify-center text-xl border-2 border-emerald-300">
          <RotateCcw className="mr-2 w-6 h-6"/> 返回修改小一志願表
        </button>
      </div>
    </div>
  );

  // FORM
  const score = getScore();
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 max-w-6xl mx-auto border border-emerald-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center"><Users className="mr-2 text-emerald-600"/>小一入學 (POA) 統一派位志願表</h2>
          <p className="text-slate-500 text-sm mt-1">計分制最高 35 分（20+5+10）＋統一派位（甲部約10%＋乙部約40%）</p>
        </div>
        <button onClick={autoFill} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-3 rounded-lg font-bold hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2">
          <Sparkles className="w-5 h-5"/> 隨機填滿測試
        </button>
      </div>

      {/* Net & Gender */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">所屬小學校網</label>
            <select value={data.net} onChange={e => handleChange('net', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg bg-white font-medium">
              {POA_NETS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">申請兒童性別</label>
            <select value={data.gender} onChange={e => handleChange('gender', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg bg-white">
              <option value="男女">未指定</option><option value="男">男</option><option value="女">女</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discretionary */}
      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 mb-8">
        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center border-b border-amber-200 pb-2">
          <Calculator className="mr-2 text-amber-600 w-5 h-5"/> 第一階段：自行分配學位（佔約 50% 學位）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">心儀小學（不受校網限制）</label>
            <select value={data.discretionarySchool} onChange={e => handleChange('discretionarySchool', e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-lg bg-white">
              <option value="">- 不申請自行分配 -</option>
              {HK_PRI_SCHOOLS.filter(s => isGenderMatch(s.type, data.gender)).map(s => (
                <option key={s.name} value={s.name}>{s.name} ({s.net}網)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">兄姊就讀同校 / 父母全職在該校任職</label>
            <label className="flex items-center gap-2 cursor-pointer mt-3">
              <input type="checkbox" checked={data.hasSibling} onChange={e => handleChange('hasSibling', e.target.checked)} className="w-5 h-5 accent-amber-600"/>
              <span className="font-bold text-amber-700">是（必收生，保證錄取）</span>
            </label>
          </div>
        </div>

        {!data.hasSibling && data.discretionarySchool && (
          <div className="mt-5 p-4 bg-white rounded-lg border border-amber-100">
            <h4 className="font-bold text-slate-700 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-amber-500"/>計分辦法（最高 35 分 = 20+5+10）
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">第1-5類：選其一（最高20分）</label>
                <select value={data.cat25} onChange={e => handleChange('cat25', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm bg-slate-50">
                  <option value="none">無 (0分)</option>
                  <option value="firstborn">首名出生子女 (5分)</option>
                  <option value="alumni">父母/兄姊為該校畢業生 (10分)</option>
                  <option value="manager">父母為該校校董/辦學團體成員 (20分)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">第6-7類：選其一（最高5分）</label>
                <select value={data.cat67} onChange={e => handleChange('cat67', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm bg-slate-50">
                  <option value="none">無 (0分)</option>
                  <option value="religion">與該校相同宗教/辦學團體 (5分)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">年齡（10分）</label>
                <select value={data.rightAge} onChange={e => handleChange('rightAge', e.target.value === 'true')}
                  className="w-full p-2 border border-slate-300 rounded text-sm bg-slate-50">
                  <option value="true">適齡（5歲8個月至7歲）(10分)</option>
                  <option value="false">非適齡 (0分)</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <span className="font-bold text-slate-600">當前自行分配總分：</span>
              <span className="text-2xl font-black text-amber-600">{score} / 35 分</span>
            </div>
          </div>
        )}
      </div>

      {/* Part A */}
      <div className="mb-10">
        <div className="bg-teal-600 p-4 rounded-t-xl">
          <h3 className="text-lg font-bold text-white">統一派位甲部：不受校網限制（約10% 學額）</h3>
          <p className="text-sm text-teal-100 mt-1">最多 3 間，可選全港任何地區。</p>
        </div>
        <div className="border border-teal-200 rounded-b-xl p-4 md:p-6 bg-white grid gap-5">
          {data.partA.map((ch, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="w-24 font-bold text-slate-700 bg-slate-100 p-2 rounded-md text-center text-sm border border-slate-200 shrink-0">甲部志願 {i+1}</span>
              <select value={ch.district} onChange={e => handlePartAChange(i, 'district', e.target.value)}
                className="p-3 border border-slate-300 rounded-md bg-white md:w-48">
                <option value="">- 篩選地區 -</option>
                <option value="直資私立(不限地區)">直資/私立 (全港)</option>
                {ALL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={ch.name} onChange={e => handlePartAChange(i, 'name', e.target.value)}
                disabled={!ch.district} className="flex-1 p-3 border border-slate-300 rounded-md disabled:bg-slate-100 bg-white">
                <option value="">{ch.district ? '- 請選擇小學 -' : '- 請先選地區 -'}</option>
                {(PRIMARY_SCHOOLS[ch.district] || []).filter(n => {
                  const s = HK_PRI_SCHOOLS.find(x => x.name === n);
                  return s ? isGenderMatch(s.type, data.gender) : true;
                }).map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Part B */}
      <div className="mb-10">
        <div className="bg-emerald-600 p-4 rounded-t-xl">
          <h3 className="text-lg font-bold text-white">統一派位乙部：按校網 ({data.net})（約40% 學額）</h3>
          <p className="text-sm text-emerald-100 mt-1">最多 30 間。</p>
        </div>
        <div className="border border-emerald-200 rounded-b-xl p-4 md:p-6 bg-white grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
          {data.partB.map((val, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-10 font-bold text-slate-400 text-sm text-right shrink-0">{i+1}</span>
              <select value={val} onChange={e => handlePartBChange(i, e.target.value)}
                className="flex-1 p-2.5 text-sm border border-slate-300 rounded-md bg-white">
                <option value="">- 未填寫 -</option>
                {getNetSchools(data.net, data.gender).map(s => <option key={s.name}>{s.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <button onClick={simulate}
        className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-xl shadow-xl flex items-center justify-center text-xl transition transform hover:-translate-y-1 border-b-4 border-slate-700">
        <Play className="mr-2 w-6 h-6"/> 開始執行小一入學 (POA) 電腦演算
      </button>
    </div>
  );
}
