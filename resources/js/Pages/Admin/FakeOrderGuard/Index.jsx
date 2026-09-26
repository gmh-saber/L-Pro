import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef } from 'react';

// ── SVG Icons ──────────────────────────────────────────────────────────────
const Icons = {
  Shield:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Globe:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Monitor:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Phone:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  BanPhone:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Clock:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Hash:      (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>,
  Check:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  X:         (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronRight: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  Search:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Key:       (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  Loader:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  Warning:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Truck:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zm0 0h2a1 1 0 001-1v-3.586a1 1 0 00-.293-.707l-3-3A1 1 0 0014 8h-1v8z" /></svg>,
};

// ── Helpers ────────────────────────────────────────────────────────────────
const RISK_MAP = {
  safe:    { label: 'Safe',    bg: 'bg-green-100',  text: 'text-green-700',  ring: 'ring-green-400',  bar: 'bg-green-500',  icon: '✅' },
  low:     { label: 'Low',     bg: 'bg-blue-100',   text: 'text-blue-700',   ring: 'ring-blue-400',   bar: 'bg-blue-500',   icon: '🔵' },
  medium:  { label: 'Medium',  bg: 'bg-amber-100',  text: 'text-amber-700',  ring: 'ring-amber-400',  bar: 'bg-amber-500',  icon: '🟡' },
  high:    { label: 'High',    bg: 'bg-red-100',    text: 'text-red-700',    ring: 'ring-red-400',    bar: 'bg-red-500',    icon: '🔴' },
  danger:  { label: 'Danger',  bg: 'bg-rose-100',   text: 'text-rose-800',   ring: 'ring-rose-500',   bar: 'bg-rose-600',   icon: '⛔' },
  unknown: { label: 'Unknown', bg: 'bg-gray-100',   text: 'text-gray-600',   ring: 'ring-gray-300',   bar: 'bg-gray-400',   icon: '❓' },
};

function riskStyle(level) { return RISK_MAP[level] || RISK_MAP.unknown; }

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled = false }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${enabled ? 'bg-orange-500' : 'bg-gray-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Guard Card ─────────────────────────────────────────────────────────────
function GuardCard({ icon: Icon, iconBg, title, description, settingKey, enabled, masterEnabled, onToggle, badge, children }) {
  const active = enabled && masterEnabled;
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${active ? 'border-orange-200 shadow-md shadow-orange-50' : 'border-gray-100 shadow-sm'}`}>
      <div className="flex items-start justify-between p-5">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${active ? iconBg.active : iconBg.inactive}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
              {badge && active && <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">{badge}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <Toggle enabled={enabled} onChange={val => onToggle(settingKey, val)} disabled={!masterEnabled} />
      </div>
      {children && active && <div className="px-5 pb-5 border-t border-gray-50 pt-4">{children}</div>}
    </div>
  );
}

// ── Fraud Guard Result Widget ───────────────────────────────────────────────
function FraudGuardResult({ result }) {
  if (!result) return null;
  const level   = result.risk_level || 'unknown';
  const label   = result.risk_label || 'Unknown';
  const risk    = riskStyle(level);
  const metrics = result.metrics || [];
  const reports = result.reports || [];

  return (
    <div className="space-y-4 mt-4">
      {/* Risk badge + summary */}
      <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 ${risk.bg} border ${risk.ring} border-opacity-50`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-white shadow-sm`}>
            {risk.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${risk.text}`}>{label} Risk</span>
            </div>
            <p className={`text-xs mt-0.5 ${risk.text} opacity-80 uppercase tracking-widest font-semibold`}>
              {result.provider === 'bdcourier' ? 'BD Courier' : 'Steadfast'}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-2xl font-black ${metrics[0] ? metrics[0].color : risk.text}`}>{metrics[0] ? metrics[0].value : 'N/A'}</p>
          <p className="text-xs text-gray-500">{metrics[0] ? metrics[0].label : 'Score'}</p>
        </div>
      </div>

      {/* Stats */}
      {metrics.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {metrics.slice(1).map((s, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Steadfast Reasons */}
      {result.steadfast_reasons && result.steadfast_reasons.length > 0 && (
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-2.5">
          {result.steadfast_reasons.map((r, i) => {
            const isGreen = ['reports_none', 'history_long', 'history_some', 'ratio_high', 'ratio_good'].includes(r.key);
            const isYellow = ['history_little', 'ratio_fair', 'reports_few'].includes(r.key);
            const isRed = ['history_none', 'ratio_poor', 'reports_some', 'reports_many'].includes(r.key);
            const dotColor = isGreen ? 'bg-green-500' : isYellow ? 'bg-yellow-500' : isRed ? 'bg-red-500' : 'bg-gray-400';
            
            return (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                <span>{r.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Fraud reports */}
      {reports.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 space-y-2">
          <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
            <Icons.Warning className="w-4 h-4" /> {reports.length} Fraud Report{reports.length > 1 ? 's' : ''}
          </p>
          {reports.map((r, i) => (
            <div key={i} className="text-xs text-red-600 bg-white/60 rounded-lg p-2">
              <p className="font-medium">{r.details}</p>
              <p className="opacity-80">Provider: {r.courierName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Live Phone Checker ─────────────────────────────────────────────────────
function PhoneChecker() {
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const check = async () => {
    if (!phone.trim()) return;
    setLoading(true); setResult(null); setError('');

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
      const res  = await fetch('/admin/fake-order-guard/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error || 'Failed to check phone.'); }
      else { setResult(json); }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="01712345678"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-mono"
          />
        </div>
        <button
          onClick={check}
          disabled={loading || !phone.trim()}
          className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center gap-2 whitespace-nowrap transition-colors"
        >
          {loading ? <Icons.Loader className="w-4 h-4 animate-spin" /> : <Icons.Search className="w-4 h-4" />}
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <Icons.Warning className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {result && <FraudGuardResult result={result} />}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, href, color }) {
  return (
    <a href={href} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-orange-100 transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-300"><Icons.ChevronRight className="w-4 h-4" /></div>
    </a>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function FakeOrderGuardIndex({ settings, stats, recentBlockedOrders }) {
  const s = settings || {};
  const getBool = (k, d = '1') => (s[k] ?? d) === '1';
  const getInt  = (k, d = 0)   => parseInt(s[k] ?? String(d), 10);
  const getStr  = (k, d = '')  => s[k] ?? d;

  const [masterEnabled,          setMasterEnabled]          = useState(getBool('fog_enabled'));
  const [ipBlockEnabled,         setIpBlockEnabled]          = useState(getBool('fog_ip_block_enabled'));
  const [deviceBlockEnabled,     setDeviceBlockEnabled]      = useState(getBool('fog_device_block_enabled'));
  const [phoneBlockEnabled,      setPhoneBlockEnabled]       = useState(getBool('fog_phone_block_enabled'));
  const [fakeNumberEnabled,      setFakeNumberEnabled]       = useState(getBool('fog_fake_number_block_enabled'));
  const [autoBlockOnCancel,      setAutoBlockOnCancel]       = useState(getBool('fog_auto_block_ip_on_cancel', '0'));
  const [ipCooldown,             setIpCooldown]              = useState(getInt('fog_ip_cooldown_minutes'));
  const [phoneCooldown,          setPhoneCooldown]           = useState(getInt('fog_phone_cooldown_minutes'));
  const [maxOrdersPerPhone,      setMaxOrdersPerPhone]       = useState(getInt('fog_max_orders_per_phone'));

  const [fogProvider,            setFogProvider]             = useState(getStr('fog_provider', 'bdcourier'));

  // BD Courier settings
  const [bdEnabled,         setBdEnabled]         = useState(getBool('fog_bdcourier_enabled', '0'));
  const [bdApiKey,          setBdApiKey]           = useState(getStr('fog_bdcourier_api_key'));
  const [bdAutoCheck,       setBdAutoCheck]        = useState(getBool('fog_bdcourier_auto_check_checkout', '0'));
  const [bdMinRate,         setBdMinRate]          = useState(getInt('fog_bdcourier_min_success_rate'));
  const [bdBlockLevels,     setBdBlockLevels]      = useState(
    (getStr('fog_bdcourier_block_risk_levels', 'danger,high')).split(',').map(s => s.trim()).filter(Boolean)
  );

  // Steadfast settings
  const [steadfastEnabled,     setSteadfastEnabled]     = useState(getBool('fog_steadfast_enabled', '0'));
  const [steadfastAutoCheck,   setSteadfastAutoCheck]   = useState(getBool('fog_steadfast_auto_check_checkout', '0'));
  const [steadfastMinScore,    setSteadfastMinScore]    = useState(getInt('fog_steadfast_min_score', 0));
  const [steadfastBlockLevels, setSteadfastBlockLevels] = useState(
    (getStr('fog_steadfast_block_risk_levels', 'danger,high')).split(',').map(s => s.trim()).filter(Boolean)
  );

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const save = () => {
    setSaving(true);
    router.post('/admin/settings/fake_order_guard', {
      _method:                        'PUT',
      fog_enabled:                    masterEnabled      ? '1' : '0',
      fog_ip_block_enabled:           ipBlockEnabled     ? '1' : '0',
      fog_device_block_enabled:       deviceBlockEnabled ? '1' : '0',
      fog_phone_block_enabled:        phoneBlockEnabled  ? '1' : '0',
      fog_fake_number_block_enabled:  fakeNumberEnabled  ? '1' : '0',
      fog_auto_block_ip_on_cancel:    autoBlockOnCancel  ? '1' : '0',
      fog_ip_cooldown_minutes:        ipCooldown,
      fog_phone_cooldown_minutes:     phoneCooldown,
      fog_max_orders_per_phone:       maxOrdersPerPhone,
      fog_provider:                   fogProvider,
      fog_bdcourier_enabled:          bdEnabled    ? '1' : '0',
      fog_bdcourier_api_key:          bdApiKey,
      fog_bdcourier_auto_check_checkout: bdAutoCheck ? '1' : '0',
      fog_bdcourier_min_success_rate: bdMinRate,
      fog_bdcourier_block_risk_levels: bdBlockLevels.join(','),
      fog_steadfast_enabled:          steadfastEnabled ? '1' : '0',
      fog_steadfast_auto_check_checkout: steadfastAutoCheck ? '1' : '0',
      fog_steadfast_min_score:        steadfastMinScore,
      fog_steadfast_block_risk_levels: steadfastBlockLevels.join(','),
    }, {
      preserveScroll: true,
      onSuccess: () => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); },
      onError:   () => setSaving(false),
    });
  };

  const handleToggle = (key, val) => {
    ({ fog_ip_block_enabled: setIpBlockEnabled, fog_device_block_enabled: setDeviceBlockEnabled,
       fog_phone_block_enabled: setPhoneBlockEnabled, fog_fake_number_block_enabled: setFakeNumberEnabled,
       fog_auto_block_ip_on_cancel: setAutoBlockOnCancel })[key]?.(val);
  };

  const toggleLevel = (level) => {
    if (fogProvider === 'bdcourier') {
      setBdBlockLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
    } else {
      setSteadfastBlockLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
    }
  };

  const activeGuards = [ipBlockEnabled, deviceBlockEnabled, phoneBlockEnabled, fakeNumberEnabled, bdEnabled].filter(Boolean).length;

  const RISK_LEVELS = [
    { key: 'safe',   icon: '✅', label: 'Safe',   desc: 'Never block' },
    { key: 'low',    icon: '🔵', label: 'Low',    desc: 'Low risk' },
    { key: 'medium', icon: '🟡', label: 'Medium', desc: 'Moderate' },
    { key: 'high',   icon: '🔴', label: 'High',   desc: 'Recommend block' },
    { key: 'danger', icon: '⛔', label: 'Danger', desc: 'Always block' },
  ];

  return (
    <AdminLayout>
      <Head title="Fake Order Guard" />
      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><Icons.Shield className="w-5 h-5" /></span>
              Fake Order Guard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Protect your store from fake, duplicate, and suspicious orders.</p>
          </div>
          <button onClick={save} disabled={saving}
            className="h-10 px-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2">
            {saving ? <><Icons.Loader className="w-4 h-4 animate-spin" /> Saving…</>
            : saved  ? <><Icons.Check className="w-4 h-4" /> Saved!</>
            : 'Save Changes'}
          </button>
        </div>

        {/* Status Banner */}
        <div className={`rounded-2xl px-5 py-4 flex items-center gap-4 transition-colors ${masterEnabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${masterEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {masterEnabled ? <Icons.Shield className="w-5 h-5" /> : <Icons.X className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${masterEnabled ? 'text-green-800' : 'text-red-800'}`}>
              Fake Order Guard — {masterEnabled ? `ACTIVE (${activeGuards} guard${activeGuards !== 1 ? 's' : ''} on)` : 'DISABLED'}
            </p>
            <p className={`text-xs mt-0.5 ${masterEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {masterEnabled ? 'All enabled guards are running at checkout.' : 'Enable the master switch to start protection.'}
            </p>
          </div>
          <Toggle enabled={masterEnabled} onChange={setMasterEnabled} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Icons.Globe}   label="Blocked IPs"     value={stats.blocked_ips}     href="/admin/blocked-ips"     color="bg-red-50 text-red-500" />
          <StatCard icon={Icons.Monitor} label="Blocked Devices" value={stats.blocked_devices} href="/admin/blocked-devices" color="bg-purple-50 text-purple-500" />
          <StatCard icon={Icons.Phone}   label="Blocked Phones"  value={stats.blocked_phones}  href="/admin/blocked-phones"  color="bg-blue-50 text-blue-600" />
        </div>

        {/* Guard Modules */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Guard Modules</h2>
          <GuardCard icon={Icons.Globe} iconBg={{active:'bg-red-50 text-red-500',inactive:'bg-gray-50 text-gray-400'}}
            title="IP Address Block" settingKey="fog_ip_block_enabled" enabled={ipBlockEnabled} masterEnabled={masterEnabled} onToggle={handleToggle} badge="Recommended"
            description="Blocks checkout from any IP in your blocked list instantly.">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div>
                <p className="text-xs font-medium text-gray-700">Auto-block IP on order cancel</p>
                <p className="text-xs text-gray-400 mt-0.5">Auto-adds IP to blocklist when admin cancels an order.</p>
              </div>
              <Toggle enabled={autoBlockOnCancel} onChange={setAutoBlockOnCancel} />
            </div>
          </GuardCard>
          <GuardCard icon={Icons.Monitor} iconBg={{active:'bg-purple-50 text-purple-500',inactive:'bg-gray-50 text-gray-400'}}
            title="Device Fingerprint Block" settingKey="fog_device_block_enabled" enabled={deviceBlockEnabled} masterEnabled={masterEnabled} onToggle={handleToggle}
            description="Blocks orders from specific browser/device fingerprints even if IP changes." />
          <GuardCard icon={Icons.Phone} iconBg={{active:'bg-blue-50 text-blue-500',inactive:'bg-gray-50 text-gray-400'}}
            title="BD Phone Blacklist" settingKey="fog_phone_block_enabled" enabled={phoneBlockEnabled} masterEnabled={masterEnabled} onToggle={handleToggle}
            description="Permanently block specific Bangladeshi phone numbers from placing orders." />
          <GuardCard icon={Icons.BanPhone} iconBg={{active:'bg-amber-50 text-amber-500',inactive:'bg-gray-50 text-gray-400'}}
            title="Fake BD Number Detection" settingKey="fog_fake_number_block_enabled" enabled={fakeNumberEnabled} masterEnabled={masterEnabled} onToggle={handleToggle} badge="Smart"
            description="Rejects invalid prefixes (non 013–019), wrong length, or repeated digit patterns like 01777777777.">
            <div className="flex flex-wrap gap-1.5">
              {['013','014','015','016','017','018','019'].map(p=>(
                <span key={p} className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-lg font-mono flex items-center gap-0.5"><Icons.Check className="w-3 h-3" />{p}x-xxxxxxx</span>
              ))}
              {['011x','012x','foreign','repeated'].map(p=>(
                <span key={p} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg font-mono flex items-center gap-0.5"><Icons.X className="w-3 h-3" />{p}</span>
              ))}
            </div>
          </GuardCard>
        </div>

        {/* Timers */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Timers & Limits</h2>
          {[
            { icon: Icons.Clock, bg:'bg-orange-50 text-orange-500', title:'IP Order Cooldown (minutes)', desc:'Block same IP from ordering within X mins. 0 = off.', val: ipCooldown, set: setIpCooldown },
            { icon: Icons.Phone, bg:'bg-blue-50 text-blue-500',   title:'Phone Order Cooldown (minutes)', desc:'Block same phone from ordering within X mins. 0 = off.', val: phoneCooldown, set: setPhoneCooldown },
            { icon: Icons.Hash,  bg:'bg-indigo-50 text-indigo-500', title:'Max Orders Per Phone (lifetime)', desc:'Max total orders allowed per phone number ever. 0 = off.', val: maxOrdersPerPhone, set: setMaxOrdersPerPhone },
          ].map(t => (
            <div key={t.title} className={`bg-white rounded-2xl border shadow-sm p-5 ${!masterEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.bg}`}><t.icon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{t.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">{t.desc}</p>
                  <div className="flex items-center gap-3">
                    <input type="number" min={0} max={1440} value={t.val}
                      onChange={e => t.set(Number(e.target.value))}
                      className="w-24 h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-center" />
                    {t.val > 0
                      ? <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Icons.Check className="w-3.5 h-3.5" /> Active</span>
                      : <span className="text-xs text-gray-400">Disabled</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── API Provider Integrations ─────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">API Integrations (Delivery & Fraud History)</h2>

          {/* Provider Selection */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">Active Provider</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select which third-party provider to use for fraud lookups.</p>
            </div>
            <select
              value={fogProvider}
              onChange={e => setFogProvider(e.target.value)}
              className="w-full sm:w-auto h-10 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
            >
              <option value="bdcourier">BD Courier</option>
              <option value="steadfast">Steadfast Native API</option>
            </select>
          </div>

          {/* Settings depending on the selected provider */}
          {fogProvider === 'bdcourier' && (
            <div className={`bg-white rounded-2xl border shadow-sm transition-all ${bdEnabled && masterEnabled ? 'border-indigo-200 shadow-indigo-50 shadow-md' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bdEnabled && masterEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Icons.Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">BD Courier Fraud Check</h3>
                      {bdEnabled && masterEnabled && <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full">Live API</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Check customer's full delivery history across Pathao, Steadfast, Redx, Paperfly and more via BD Courier API.</p>
                  </div>
                </div>
                <Toggle enabled={bdEnabled} onChange={setBdEnabled} disabled={!masterEnabled} />
              </div>

              {bdEnabled && masterEnabled && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                  {/* API Key */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Icons.Key className="w-3.5 h-3.5" /> BD Courier API Key</label>
                    <input type="password" value={bdApiKey} onChange={e => setBdApiKey(e.target.value)}
                      className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      placeholder="bdc_..." />
                    <p className="text-xs text-gray-400 mt-1">Get your key from <a href="https://api.bdcourier.com" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">api.bdcourier.com</a></p>
                  </div>

                  {/* Auto check toggle */}
                  <div className="flex items-center justify-between bg-indigo-50 rounded-xl p-3">
                    <div>
                      <p className="text-xs font-medium text-indigo-800">Auto-check at checkout</p>
                      <p className="text-xs text-indigo-600 mt-0.5">Automatically call BD Courier API when customer places an order.</p>
                    </div>
                    <Toggle enabled={bdAutoCheck} onChange={setBdAutoCheck} />
                  </div>

                  {/* Min success rate */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Block if success rate below (%)</label>
                    <div className="flex items-center gap-3">
                      <input type="number" min={0} max={100} value={bdMinRate}
                        onChange={e => setBdMinRate(Number(e.target.value))}
                        className="w-24 h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-center" />
                      <span className="text-xs text-gray-500">%
                        {bdMinRate > 0 ? <span className="text-red-600 font-medium ml-1">Block if below {bdMinRate}%</span>
                                      : <span className="text-gray-400 ml-1">Disabled (0 = off)</span>}
                      </span>
                    </div>
                  </div>

                  {/* Risk level blocklist */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Block these risk levels</label>
                    <div className="flex flex-wrap gap-2">
                      {RISK_LEVELS.map(rl => {
                        const active = bdBlockLevels.includes(rl.key);
                        const rs = riskStyle(rl.key);
                        return (
                          <button key={rl.key} type="button" onClick={() => toggleLevel(rl.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active ? `${rs.bg} ${rs.text} border-current shadow-sm` : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                            <span>{rl.icon}</span> {rl.label}
                            {active && <Icons.Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Selected levels will be blocked at checkout when auto-check is enabled.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {fogProvider === 'steadfast' && (
            <div className={`bg-white rounded-2xl border shadow-sm transition-all ${steadfastEnabled && masterEnabled ? 'border-teal-200 shadow-teal-50 shadow-md' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${steadfastEnabled && masterEnabled ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Icons.Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">Steadfast Native Fraud API</h3>
                      {steadfastEnabled && masterEnabled && <span className="text-xs bg-teal-100 text-teal-700 font-medium px-2 py-0.5 rounded-full">Live API</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Use Steadfast's official fraud checking API.</p>
                  </div>
                </div>
                <Toggle enabled={steadfastEnabled} onChange={setSteadfastEnabled} disabled={!masterEnabled} />
              </div>

              {steadfastEnabled && masterEnabled && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                  <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100 flex items-start gap-3">
                    <Icons.Key className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-teal-900">API Credentials</p>
                      <p className="text-[11px] text-teal-700 mt-0.5">
                        Steadfast API credentials are automatically loaded from your <a href="/admin/settings" className="font-bold underline hover:text-teal-900">Courier APIs</a> settings.
                      </p>
                    </div>
                  </div>

                  {/* Auto check toggle */}
                  <div className="flex items-center justify-between bg-teal-50 rounded-xl p-3">
                    <div>
                      <p className="text-xs font-medium text-teal-800">Auto-check at checkout</p>
                      <p className="text-xs text-teal-600 mt-0.5">Automatically call Steadfast API when customer places an order.</p>
                    </div>
                    <Toggle enabled={steadfastAutoCheck} onChange={setSteadfastAutoCheck} />
                  </div>

                  {/* Min score threshold */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Block if score below (%)</label>
                    <div className="flex items-center gap-3">
                      <input type="number" min={0} max={100} value={steadfastMinScore}
                        onChange={e => setSteadfastMinScore(Number(e.target.value))}
                        className="w-24 h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-center" />
                      <span className="text-xs text-gray-500">%
                        {steadfastMinScore > 0 ? <span className="text-red-600 font-medium ml-1">Block if below {steadfastMinScore}%</span>
                                      : <span className="text-gray-400 ml-1">Disabled (0 = off)</span>}
                      </span>
                    </div>
                  </div>

                  {/* Risk level blocklist */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Block these risk levels</label>
                    <div className="flex flex-wrap gap-2">
                      {RISK_LEVELS.map(rl => {
                        const active = steadfastBlockLevels.includes(rl.key);
                        const rs = riskStyle(rl.key);
                        return (
                          <button key={rl.key} type="button" onClick={() => toggleLevel(rl.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active ? `${rs.bg} ${rs.text} border-current shadow-sm` : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                            <span>{rl.icon}</span> {rl.label}
                            {active && <Icons.Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Selected levels will be blocked at checkout when auto-check is enabled.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Manual Phone Checker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-2">
              <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Icons.Search className="w-4 h-4" /></span>
              Manual Phone Checker
            </h3>
            <p className="text-xs text-gray-500 mb-4">Check any BD phone number against the selected fraud provider database instantly.</p>
            <PhoneChecker />
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Manage Block Lists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label:'Blocked IPs',     href:'/admin/blocked-ips',     icon:Icons.Globe,   count:stats.blocked_ips,     color:'bg-red-50 text-red-500' },
              { label:'Blocked Devices', href:'/admin/blocked-devices', icon:Icons.Monitor, count:stats.blocked_devices, color:'bg-purple-50 text-purple-500' },
              { label:'Blocked Phones',  href:'/admin/blocked-phones',  icon:Icons.Phone,   count:stats.blocked_phones,  color:'bg-blue-50 text-blue-600' },
            ].map(l => (
              <a key={l.href} href={l.href} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-orange-200 transition-all group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${l.color}`}><l.icon className="w-4 h-4" /></div>
                <div className="flex-1"><p className="font-medium text-gray-900 text-sm group-hover:text-orange-600 transition-colors">{l.label}</p><p className="text-xs text-gray-400">{l.count} blocked</p></div>
                <div className="text-gray-300 group-hover:text-orange-400 transition-colors"><Icons.ChevronRight className="w-4 h-4" /></div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent suspicious orders */}
        {recentBlockedOrders?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Orders From Blocked Sources</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order','Customer','Phone','IP Address','Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBlockedOrders.map(o => (
                    <tr key={o.id} className="hover:bg-red-50/20">
                      <td className="px-5 py-3"><a href={`/admin/orders/${o.id}`} className="font-mono text-xs text-orange-600 hover:underline">{o.order_number}</a></td>
                      <td className="px-5 py-3 text-gray-700 text-xs">{o.customer_name}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs font-mono">{o.customer_phone}</td>
                      <td className="px-5 py-3 text-red-500 text-xs font-mono">{o.ip_address}</td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Save footer */}
        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={saving} className="h-11 px-8 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition-all">
            {saving ? 'Saving…' : saved ? '✓ All Saved' : 'Save All Changes'}
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}
