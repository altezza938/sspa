import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, Info, CheckCircle2 } from 'lucide-react';
import { ALLOCATION_DATA, DISTRICT_ORDER } from './allocationData.js';

const FINANCE_TYPES = ['全部', '官立', '資助', '直資', '按位津貼'];
const MOI_TYPES = ['全部', '英中', '中中'];
const GENDER_TYPES = ['全部', '男校', '女校', '男女'];
const BAND_TYPES = ['全部', 'Band 1', 'Band 2', 'Band 3'];

function Badge({ text, color }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    slate: 'bg-slate-100 text-slate-600',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colors[color] || colors.slate}`}>
      {text}
    </span>
  );
}

function getBandColor(band) {
  if (band === 'Band 1') return 'green';
  if (band === 'Band 2') return 'amber';
  if (band === 'Band 3') return 'red';
  return 'slate';
}

function getFinanceColor(f) {
  if (f === '官立') return 'blue';
  if (f === '直資') return 'purple';
  if (f === '資助') return 'slate';
  return 'slate';
}

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-600" />
    : <ChevronDown className="w-3 h-3 text-blue-600" />;
}

export default function AllocationTable() {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('全部');
  const [finance, setFinance] = useState('全部');
  const [moi, setMoi] = useState('全部');
  const [gender, setGender] = useState('全部');
  const [band, setBand] = useState('全部');
  const [updatedOnly, setUpdatedOnly] = useState(false);
  const [sortCol, setSortCol] = useState('district');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const districts = ['全部', ...DISTRICT_ORDER.filter(d =>
    ALLOCATION_DATA.some(s => s.district === d)
  )];

  const filtered = useMemo(() => {
    let data = ALLOCATION_DATA;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.code.includes(q) ||
        s.district.includes(q)
      );
    }
    if (district !== '全部') data = data.filter(s => s.district === district);
    if (finance !== '全部') data = data.filter(s => s.financeType === finance);
    if (moi !== '全部') data = data.filter(s => s.moi === moi);
    if (gender !== '全部') data = data.filter(s => s.gender === gender);
    if (band !== '全部') data = data.filter(s => s.mainBand === band);
    if (updatedOnly) data = data.filter(s => s.updated);

    // Sort
    data = [...data].sort((a, b) => {
      let av, bv;
      if (sortCol === 'district') {
        av = DISTRICT_ORDER.indexOf(a.district);
        bv = DISTRICT_ORDER.indexOf(b.district);
      } else if (sortCol === 'code') {
        av = parseInt(a.code); bv = parseInt(b.code);
      } else if (sortCol === 'openPlaces') {
        av = a.openPlaces; bv = b.openPlaces;
      } else if (sortCol === 'resvPlaces') {
        av = a.resvPlaces; bv = b.resvPlaces;
      } else if (sortCol === 'mainBand') {
        const order = { 'Band 1': 1, 'Band 2': 2, 'Band 3': 3, '': 4 };
        av = order[a.mainBand] ?? 4; bv = order[b.mainBand] ?? 4;
      } else {
        av = a[sortCol] ?? ''; bv = b[sortCol] ?? '';
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [search, district, finance, moi, gender, band, updatedOnly, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(1);
  }

  function handleFilter() { setPage(1); }

  const updatedCount = ALLOCATION_DATA.filter(s => s.updated).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">25-26 全港 18 區統一派位學額分析表</p>
          <p>本表格數據來源：<strong>全港・升中一家長互助群組</strong>整理，整合教育局官方學額及坊間 Banding 評級。共 <strong>{ALLOCATION_DATA.length}</strong> 所中學。</p>
          <p className="mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>已更新區份（25-26 官方數據）：<strong>中西區、油尖旺區、九龍城區、黃大仙區、沙田區</strong>（共 {updatedCount} 所）。其他區份參考 24-25 數據，待更新。</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋學校名稱 / 編號..."
              value={search}
              onChange={e => { setSearch(e.target.value); handleFilter(); }}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <select value={district} onChange={e => { setDistrict(e.target.value); handleFilter(); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={band} onChange={e => { setBand(e.target.value); handleFilter(); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {BAND_TYPES.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={finance} onChange={e => { setFinance(e.target.value); handleFilter(); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {FINANCE_TYPES.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={moi} onChange={e => { setMoi(e.target.value); handleFilter(); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {MOI_TYPES.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={gender} onChange={e => { setGender(e.target.value); handleFilter(); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {GENDER_TYPES.map(g => <option key={g}>{g}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={updatedOnly} onChange={e => { setUpdatedOnly(e.target.checked); handleFilter(); }}
              className="w-4 h-4 accent-emerald-600" />
            僅顯示已更新
          </label>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          共找到 <strong>{filtered.length}</strong> 所學校
          {filtered.length !== ALLOCATION_DATA.length && ` （全部 ${ALLOCATION_DATA.length} 所）`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { key: 'district', label: '地區' },
                  { key: 'code', label: '編號' },
                  { key: 'name', label: '學校名稱' },
                  { key: 'financeType', label: '類型' },
                  { key: 'gender', label: '性別' },
                  { key: 'moi', label: '語言' },
                  { key: 'mainBand', label: 'Band' },
                  { key: 'schoolandBand', label: 'Schooland' },
                  { key: 'bigExamBand', label: 'BigExam' },
                  { key: 'openPlaces', label: '非保留學額' },
                  { key: 'resvPlaces', label: '保留學額' },
                ].map(col => (
                  <th key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-3 py-3 text-left font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 whitespace-nowrap select-none">
                    <span className="flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">狀態</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s, i) => (
                <tr key={s.code} className={`border-b border-slate-100 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-700 font-medium">{s.district}</td>
                  <td className="px-3 py-2 font-mono text-slate-500">{s.code}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800 min-w-36">{s.name}</td>
                  <td className="px-3 py-2"><Badge text={s.financeType || '—'} color={getFinanceColor(s.financeType)} /></td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{s.gender || '—'}</td>
                  <td className="px-3 py-2">
                    <Badge text={s.moi || '—'} color={s.moi === '英中' ? 'blue' : 'slate'} />
                  </td>
                  <td className="px-3 py-2">
                    {s.mainBand ? <Badge text={s.mainBand} color={getBandColor(s.mainBand)} /> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{s.schoolandBand || '—'}</td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{s.bigExamBand || '—'}</td>
                  <td className="px-3 py-2 text-center font-bold text-slate-800">
                    {s.openPlaces > 0 ? s.openPlaces : <span className="text-slate-400">0</span>}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-600">
                    {s.resvPlaces > 0 ? s.resvPlaces : <span className="text-slate-400">0</span>}
                  </td>
                  <td className="px-3 py-2">
                    {s.updated
                      ? <Badge text="已更新" color="green" />
                      : <Badge text="待更新" color="slate" />}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>沒有符合條件的學校</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <span>第 {page} / {totalPages} 頁（每頁 {PAGE_SIZE} 所）</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">
                上一頁
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="mt-4 text-xs text-slate-500 text-center">
        數據來源：全港・升中一家長互助群組整理，整合教育局官方資料及 Schooland.hk、BigExam.hk Banding 評級。僅供家長參考，不代表官方最終派位結果。
      </p>
    </div>
  );
}
