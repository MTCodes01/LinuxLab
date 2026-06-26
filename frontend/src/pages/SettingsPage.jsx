import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Settings, Cpu, Globe, Key, Shield, Save, Plus, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-secondary mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle-track ${checked ? 'active' : ''}`}
      role="switch"
      aria-checked={checked}
    >
      <div className="toggle-thumb" />
    </button>
  );
}

function SliderField({ label, min, max, step, value, onChange, unit }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-text-secondary">{label}</label>
        <span className="text-sm font-bold text-primary font-mono">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
}

const tabItems = [
  { id: 'general',    label: 'General',    icon: Settings },
  { id: 'resources',  label: 'Resources',  icon: Cpu },
  { id: 'networking', label: 'Networking', icon: Globe },
  { id: 'ssh',        label: 'SSH Keys',   icon: Key },
  { id: 'security',   label: 'Security',   icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [statusMsg, setStatusMsg] = useState(null);

  const [general, setGeneral] = useState(() => {
    const saved = localStorage.getItem('ll_settings_general');
    return saved ? JSON.parse(saved) : {
      projectTitle: 'LinuxLab Self-Hosted Platform',
      description: 'On-demand isolated sandbox development environments.',
      serverMode: 'production',
      timezone: 'UTC',
      logLevel: 'info',
    };
  });

  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('ll_settings_resources');
    return saved ? JSON.parse(saved) : {
      cpuOvercommit: 2,
      maxRamLimit: 4096,
      defaultLifetime: 24,
      diskLimit: 20,
    };
  });

  const [networking, setNetworking] = useState(() => {
    const saved = localStorage.getItem('ll_settings_networking');
    return saved ? JSON.parse(saved) : {
      gatewayInterface: 'lxdbr0',
      subnetCidr: '10.0.3.1/24',
      dnsServers: '1.1.1.1, 8.8.8.8',
      portRangeStart: 30000,
      portRangeEnd: 32767,
    };
  });

  const [sshKeys, setSshKeys] = useState(() => {
    const saved = localStorage.getItem('ll_settings_ssh_keys');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'MacBook Pro Key',   fingerprint: 'SHA256:4t7fXw...q8A', date: '2026-06-25' },
      { id: 2, name: 'Work Desktop SSH',  fingerprint: 'SHA256:9mLkP8...x2Y', date: '2026-06-26' },
    ];
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('ll_settings_security');
    return saved ? JSON.parse(saved) : {
      unprivilegedByDefault: true,
      firewallPolicy: 'allow-all',
      autoCleanup: true,
      sessionTimeout: 60,
    };
  });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('tab');
    if (p && tabItems.some(t => t.id === p)) setActiveTab(p);
  }, []);

  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSaveGeneral    = (e) => { e.preventDefault(); localStorage.setItem('ll_settings_general', JSON.stringify(general)); showStatus('General settings saved!'); };
  const handleSaveResources  = (e) => { e.preventDefault(); localStorage.setItem('ll_settings_resources', JSON.stringify(resources)); showStatus('Resource policies updated!'); };
  const handleSaveNetworking = (e) => { e.preventDefault(); localStorage.setItem('ll_settings_networking', JSON.stringify(networking)); showStatus('Network settings saved!'); };
  const handleSaveSecurity   = (e) => { e.preventDefault(); localStorage.setItem('ll_settings_security', JSON.stringify(security)); showStatus('Security rules saved!'); };

  const handleAddSSHKey = (e) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) { showStatus('Specify both name and key content.', 'error'); return; }
    const clean = newKeyValue.trim();
    if (!clean.startsWith('ssh-rsa') && !clean.startsWith('ssh-ed25519') && !clean.startsWith('ecdsa-sha2-nistp256')) {
      showStatus('Invalid key format.', 'error');
      return;
    }
    const updated = [...sshKeys, {
      id: Date.now(),
      name: newKeyName,
      fingerprint: 'SHA256:' + Math.random().toString(36).substring(2, 8).toUpperCase() + '...' + Math.random().toString(36).substring(2, 5),
      date: new Date().toISOString().split('T')[0],
    }];
    setSshKeys(updated);
    localStorage.setItem('ll_settings_ssh_keys', JSON.stringify(updated));
    setNewKeyName('');
    setNewKeyValue('');
    showStatus('SSH key registered!');
  };

  const handleDeleteSSHKey = (id) => {
    const updated = sshKeys.filter(k => k.id !== id);
    setSshKeys(updated);
    localStorage.setItem('ll_settings_ssh_keys', JSON.stringify(updated));
    showStatus('SSH key removed.');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6">

        {/* Tab sidebar */}
        <div className="md:w-52 flex-shrink-0">
          <div className="card p-2 space-y-0.5">
            {tabItems.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); window.history.replaceState({}, '', `/settings?tab=${id}`); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold
                    transition-default cursor-pointer text-left
                    ${active
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0 card p-6">
          {/* Status banner */}
          {statusMsg && (
            <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm mb-6 animate-fade-in
              ${statusMsg.type === 'error'
                ? 'bg-danger/10 border border-danger/20 text-danger'
                : 'bg-success/10 border border-success/20 text-success'
              }`}
            >
              {statusMsg.type === 'error'
                ? <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                : <CheckCircle className="w-4 h-4 flex-shrink-0" />
              }
              {statusMsg.text}
            </div>
          )}

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-5">
              <SectionHeader title="General Preferences" subtitle="Core platform descriptors and runtime defaults" />

              <FormField label="Project Title">
                <input
                  type="text"
                  value={general.projectTitle}
                  onChange={e => setGeneral({ ...general, projectTitle: e.target.value })}
                  className="input-base max-w-lg"
                  required
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  value={general.description}
                  onChange={e => setGeneral({ ...general, description: e.target.value })}
                  className="input-base max-w-lg h-24 resize-none"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
                <FormField label="Server Mode">
                  <select
                    value={general.serverMode}
                    onChange={e => setGeneral({ ...general, serverMode: e.target.value })}
                    className="input-base select"
                  >
                    <option value="development">Development</option>
                    <option value="production">Production</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </FormField>
                <FormField label="Timezone">
                  <select
                    value={general.timezone}
                    onChange={e => setGeneral({ ...general, timezone: e.target.value })}
                    className="input-base select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">US Eastern</option>
                    <option value="PST">US Pacific</option>
                    <option value="IST">Asia/Kolkata</option>
                  </select>
                </FormField>
                <FormField label="Log Level">
                  <select
                    value={general.logLevel}
                    onChange={e => setGeneral({ ...general, logLevel: e.target.value })}
                    className="input-base select"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                  </select>
                </FormField>
              </div>

              <div className="pt-4 border-t border-border">
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4" /> Save General Settings
                </button>
              </div>
            </form>
          )}

          {/* ── RESOURCES ── */}
          {activeTab === 'resources' && (
            <form onSubmit={handleSaveResources} className="space-y-6">
              <SectionHeader title="Resource Allocation Policies" subtitle="Set default limits for CPU, RAM and container lifetime" />

              <div className="space-y-6 max-w-md">
                <SliderField
                  label="CPU Overcommit Ratio"
                  min={1} max={4} step={1}
                  value={resources.cpuOvercommit}
                  onChange={e => setResources({ ...resources, cpuOvercommit: +e.target.value })}
                  unit="x"
                />

                <SliderField
                  label="Max Instance Memory"
                  min={512} max={8192} step={512}
                  value={resources.maxRamLimit}
                  onChange={e => setResources({ ...resources, maxRamLimit: +e.target.value })}
                  unit="MB"
                />

                <FormField label="Default Expiration (hours)" hint="Set 0 to disable auto-expiry">
                  <input
                    type="number"
                    value={resources.defaultLifetime}
                    onChange={e => setResources({ ...resources, defaultLifetime: parseInt(e.target.value) || 0 })}
                    className="input-base max-w-xs font-mono"
                    min={0}
                    required
                  />
                </FormField>
              </div>

              <div className="pt-4 border-t border-border">
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4" /> Update Policies
                </button>
              </div>
            </form>
          )}

          {/* ── NETWORKING ── */}
          {activeTab === 'networking' && (
            <form onSubmit={handleSaveNetworking} className="space-y-5">
              <SectionHeader title="Network Configuration" subtitle="Bridge, subnet and port allocation settings" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <FormField label="Gateway Interface">
                  <input
                    type="text"
                    value={networking.gatewayInterface}
                    onChange={e => setNetworking({ ...networking, gatewayInterface: e.target.value })}
                    className="input-base font-mono"
                    required
                  />
                </FormField>
                <FormField label="Subnet CIDR">
                  <input
                    type="text"
                    value={networking.subnetCidr}
                    onChange={e => setNetworking({ ...networking, subnetCidr: e.target.value })}
                    className="input-base font-mono"
                    required
                  />
                </FormField>
                <FormField label="DNS Servers" hint="Comma separated">
                  <input
                    type="text"
                    value={networking.dnsServers}
                    onChange={e => setNetworking({ ...networking, dnsServers: e.target.value })}
                    className="input-base font-mono col-span-2"
                    required
                  />
                </FormField>
                <FormField label="Port Range Start">
                  <input
                    type="number"
                    value={networking.portRangeStart}
                    onChange={e => setNetworking({ ...networking, portRangeStart: +e.target.value })}
                    className="input-base font-mono"
                    required
                  />
                </FormField>
                <FormField label="Port Range End">
                  <input
                    type="number"
                    value={networking.portRangeEnd}
                    onChange={e => setNetworking({ ...networking, portRangeEnd: +e.target.value })}
                    className="input-base font-mono"
                    required
                  />
                </FormField>
              </div>

              <div className="pt-4 border-t border-border">
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4" /> Save Network Config
                </button>
              </div>
            </form>
          )}

          {/* ── SSH KEYS ── */}
          {activeTab === 'ssh' && (
            <div className="space-y-6">
              <SectionHeader title="Authorized SSH Keys" subtitle="Public keys injected into new container environments" />

              {/* Keys list */}
              <div className="space-y-2 max-w-2xl">
                {sshKeys.length === 0 ? (
                  <p className="text-sm text-text-muted italic">No SSH keys registered yet.</p>
                ) : (
                  sshKeys.map(key => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary text-sm">{key.name}</p>
                        <p className="text-xs text-text-muted font-mono mt-0.5">{key.fingerprint}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="text-xs text-text-muted hidden sm:inline">{key.date}</span>
                        <button
                          onClick={() => handleDeleteSSHKey(key.id)}
                          className="btn btn-ghost p-1.5 btn-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add key form */}
              <form onSubmit={handleAddSSHKey} className="space-y-4 pt-4 border-t border-border max-w-lg">
                <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Add Public Key</p>
                <FormField label="Key Label">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    className="input-base"
                    placeholder="e.g., MacBook Pro"
                  />
                </FormField>
                <FormField label="Public Key Content">
                  <textarea
                    value={newKeyValue}
                    onChange={e => setNewKeyValue(e.target.value)}
                    className="input-base h-24 resize-none font-mono text-sm"
                    placeholder="ssh-ed25519 AAAA..."
                  />
                </FormField>
                <button type="submit" className="btn btn-primary">
                  <Plus className="w-4 h-4" /> Register Key
                </button>
              </form>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-5">
              <SectionHeader title="Security Settings" subtitle="Sandbox isolation, firewall policy and session controls" />

              <div className="space-y-4 max-w-lg">
                {/* Toggle row */}
                {[
                  {
                    key: 'unprivilegedByDefault',
                    title: 'Unprivileged Containers',
                    desc: 'Restrict namespaces (highly recommended)',
                    value: security.unprivilegedByDefault,
                  },
                  {
                    key: 'autoCleanup',
                    title: 'Auto Cleanup',
                    desc: 'Garbage collect expired idle containers',
                    value: security.autoCleanup,
                  },
                ].map(({ key, title, desc, value }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                    </div>
                    <Toggle
                      checked={value}
                      onChange={v => setSecurity({ ...security, [key]: v })}
                    />
                  </div>
                ))}

                <FormField label="Firewall Default Action">
                  <select
                    value={security.firewallPolicy}
                    onChange={e => setSecurity({ ...security, firewallPolicy: e.target.value })}
                    className="input-base select max-w-sm"
                  >
                    <option value="allow-all">Allow outbound (default)</option>
                    <option value="block-wan">Block WAN (intranet only)</option>
                    <option value="block-all">Full isolation</option>
                  </select>
                </FormField>

                <SliderField
                  label="Idle Timeout"
                  min={15} max={120} step={15}
                  value={security.sessionTimeout}
                  onChange={e => setSecurity({ ...security, sessionTimeout: +e.target.value })}
                  unit="min"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4" /> Save Security Rules
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
