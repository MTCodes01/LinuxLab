import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  Settings, Cpu, Globe, Key, Shield, Save, Plus, Trash2, CheckCircle, ShieldAlert 
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [statusMsg, setStatusMsg] = useState(null);

  // ─── State values with localStorage Fallback ───
  // General Tab
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

  // Resources Tab
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('ll_settings_resources');
    return saved ? JSON.parse(saved) : {
      cpuOvercommit: 2,
      maxRamLimit: 4096,
      defaultLifetime: 24,
      diskLimit: 20,
    };
  });

  // Networking Tab
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

  // SSH Tab (List of keys)
  const [sshKeys, setSshKeys] = useState(() => {
    const saved = localStorage.getItem('ll_settings_ssh_keys');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'MacBook Pro Key', fingerprint: 'SHA256:4t7fXw...q8A', date: '2026-06-25' },
      { id: 2, name: 'Work Desktop SSH', fingerprint: 'SHA256:9mLkP8...x2Y', date: '2026-06-26' },
    ];
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Security Tab
  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('ll_settings_security');
    return saved ? JSON.parse(saved) : {
      unprivilegedByDefault: true,
      firewallPolicy: 'allow-all',
      autoCleanup: true,
      sessionTimeout: 60,
    };
  });

  // ─── Actions ───
  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    localStorage.setItem('ll_settings_general', JSON.stringify(general));
    showStatus('General settings saved successfully!');
  };

  const handleSaveResources = (e) => {
    e.preventDefault();
    localStorage.setItem('ll_settings_resources', JSON.stringify(resources));
    showStatus('Resource allocations updated!');
  };

  const handleSaveNetworking = (e) => {
    e.preventDefault();
    localStorage.setItem('ll_settings_networking', JSON.stringify(networking));
    showStatus('Network interface properties written!');
  };

  const handleAddSSHKey = (e) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) {
      showStatus('Please specify both Name and SSH Public Key content.', 'error');
      return;
    }
    const cleanKey = newKeyValue.trim();
    if (!cleanKey.startsWith('ssh-rsa') && !cleanKey.startsWith('ssh-ed25519') && !cleanKey.startsWith('ecdsa-sha2-nistp256')) {
      showStatus('Invalid public key format. Must start with ssh-rsa, ssh-ed25519, etc.', 'error');
      return;
    }

    const keyHash = 'SHA256:' + Math.random().toString(36).substring(2, 8).toUpperCase() + '...' + Math.random().toString(36).substring(2, 5);
    const updated = [
      ...sshKeys,
      {
        id: Date.now(),
        name: newKeyName,
        fingerprint: keyHash,
        date: new Date().toISOString().split('T')[0]
      }
    ];
    setSshKeys(updated);
    localStorage.setItem('ll_settings_ssh_keys', JSON.stringify(updated));
    setNewKeyName('');
    setNewKeyValue('');
    showStatus('SSH Key registered successfully!');
  };

  const handleDeleteSSHKey = (id) => {
    const updated = sshKeys.filter(k => k.id !== id);
    setSshKeys(updated);
    localStorage.setItem('ll_settings_ssh_keys', JSON.stringify(updated));
    showStatus('SSH key deleted.');
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    localStorage.setItem('ll_settings_security', JSON.stringify(security));
    showStatus('Security rules written.');
  };

  // Sync settings page title tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['general', 'resources', 'networking', 'ssh', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const tabItems = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'resources', label: 'Resources', icon: Cpu },
    { id: 'networking', label: 'Networking', icon: Globe },
    { id: 'ssh', label: 'SSH Keys', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <DashboardLayout title="System Settings">
      
      {/* Tab Navigation header */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        
        {/* Left Side Tab Links */}
        <div className="md:w-56 flex flex-row md:flex-col gap-1.5 overflow-x-auto bg-card border border-border p-2 rounded-xl h-fit">
          {tabItems.map(item => {
            const Icon = item.icon;
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.history.replaceState({}, '', `/settings?tab=${item.id}`);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-default cursor-pointer w-full text-left whitespace-nowrap ${
                  isSel 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="flex-1 bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
          
          {/* Status Message Banner */}
          {statusMsg && (
            <div className={`p-3 mb-6 rounded-lg text-xs flex items-center gap-2.5 animate-fade-in ${
              statusMsg.type === 'error' 
                ? 'bg-danger/10 border border-danger/15 text-danger' 
                : 'bg-success/10 border border-success/15 text-success'
            }`}>
              {statusMsg.type === 'error' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* ───────────────── GENERAL TAB ───────────────── */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">General Preferences</h3>
                <p className="text-[10px] text-text-muted mb-4">Core platform descriptors and defaults</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Project Title</label>
                  <input
                    type="text"
                    value={general.projectTitle}
                    onChange={(e) => setGeneral({ ...general, projectTitle: e.target.value })}
                    className="w-full max-w-md px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Project Description</label>
                  <textarea
                    value={general.description}
                    onChange={(e) => setGeneral({ ...general, description: e.target.value })}
                    className="w-full max-w-md px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md">
                  <div>
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Server Mode</label>
                    <select
                      value={general.serverMode}
                      onChange={(e) => setGeneral({ ...general, serverMode: e.target.value })}
                      className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                    >
                      <option value="development">Development</option>
                      <option value="production">Production</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">System Timezone</label>
                    <select
                      value={general.timezone}
                      onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                      className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">US Eastern</option>
                      <option value="PST">US Pacific</option>
                      <option value="IST">Asia/Kolkata</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Console Log level</label>
                    <select
                      value={general.logLevel}
                      onChange={(e) => setGeneral({ ...general, logLevel: e.target.value })}
                      className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warn">Warn</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save General Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* ───────────────── RESOURCES TAB ───────────────── */}
          {activeTab === 'resources' && (
            <form onSubmit={handleSaveResources} className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">Resource Allocation Policies</h3>
                <p className="text-[10px] text-text-muted mb-4">Set default resource limits and CPU/RAM limits per container</p>
              </div>

              <div className="space-y-4 max-w-md">
                {/* CPU Overcommit slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">CPU Overcommit Ratio</label>
                    <span className="text-xs font-bold text-primary font-tech">{resources.cpuOvercommit}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={resources.cpuOvercommit}
                    onChange={(e) => setResources({ ...resources, cpuOvercommit: parseInt(e.target.value) })}
                    className="w-full cursor-pointer h-1.5 bg-surface rounded-lg appearance-none accent-primary"
                  />
                  <span className="text-[9px] text-text-muted mt-1 block">Permit allocating up to {resources.cpuOvercommit}x virtual cores per system core</span>
                </div>

                {/* Max RAM allocated per instance */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Max Instance Memory Limit</label>
                    <span className="text-xs font-bold text-primary font-tech">{resources.maxRamLimit} MB</span>
                  </div>
                  <input
                    type="range"
                    min={512}
                    max={8192}
                    step={512}
                    value={resources.maxRamLimit}
                    onChange={(e) => setResources({ ...resources, maxRamLimit: parseInt(e.target.value) })}
                    className="w-full cursor-pointer h-1.5 bg-surface rounded-lg appearance-none accent-primary"
                  />
                </div>

                {/* Default Container Lifetime */}
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Default Container Expiration (hours)</label>
                  <input
                    type="number"
                    value={resources.defaultLifetime}
                    onChange={(e) => setResources({ ...resources, defaultLifetime: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-tech"
                    min={1}
                    required
                  />
                  <span className="text-[9px] text-text-muted mt-1 block">Containers automatically purge after N hours (set 0 to disable expiration)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Resource Policies</span>
                </button>
              </div>
            </form>
          )}

          {/* ───────────────── NETWORKING TAB ───────────────── */}
          {activeTab === 'networking' && (
            <form onSubmit={handleSaveNetworking} className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">Bridge & Networking Parameters</h3>
                <p className="text-[10px] text-text-muted mb-4">LXD/Docker container network and ports configurations</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Gateway Interface</label>
                  <input
                    type="text"
                    value={networking.gatewayInterface}
                    onChange={(e) => setNetworking({ ...networking, gatewayInterface: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Subnet CIDR</label>
                  <input
                    type="text"
                    value={networking.subnetCidr}
                    onChange={(e) => setNetworking({ ...networking, subnetCidr: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">DNS Nameservers (Comma separated)</label>
                  <input
                    type="text"
                    value={networking.dnsServers}
                    onChange={(e) => setNetworking({ ...networking, dnsServers: e.target.value })}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Port Allocation Start</label>
                  <input
                    type="number"
                    value={networking.portRangeStart}
                    onChange={(e) => setNetworking({ ...networking, portRangeStart: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-tech"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Port Allocation End</label>
                  <input
                    type="number"
                    value={networking.portRangeEnd}
                    onChange={(e) => setNetworking({ ...networking, portRangeEnd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-tech"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Network Setup</span>
                </button>
              </div>
            </form>
          )}

          {/* ───────────────── SSH KEYS TAB ───────────────── */}
          {activeTab === 'ssh' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">Authorized SSH Keys</h3>
                <p className="text-[10px] text-text-muted mb-4">Paste public keys to automatically inject them into new container environments</p>
              </div>

              {/* SSH Keys List */}
              <div className="space-y-2 max-w-2xl">
                {sshKeys.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-2">No SSH keys added yet.</p>
                ) : (
                  sshKeys.map(key => (
                    <div key={key.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">{key.name}</p>
                        <p className="text-[10px] text-text-muted font-mono mt-0.5">{key.fingerprint}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-text-muted">{key.date}</span>
                        <button
                          onClick={() => handleDeleteSSHKey(key.id)}
                          className="p-1 rounded text-text-muted hover:text-danger hover:bg-card border border-transparent hover:border-border transition-default cursor-pointer"
                          title="Remove key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Key Form */}
              <form onSubmit={handleAddSSHKey} className="space-y-4 max-w-lg pt-4 border-t border-border">
                <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Add Public Key</h4>
                
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                    placeholder="e.g., id_ed25519_desktop"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Public Key Content</label>
                  <textarea
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary h-20 resize-none font-mono text-[10px]"
                    placeholder="ssh-ed25519 AAAA..."
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register SSH Key</span>
                </button>
              </form>
            </div>
          )}

          {/* ───────────────── SECURITY TAB ───────────────── */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">Access & Security Settings</h3>
                <p className="text-[10px] text-text-muted mb-4">Configure sandbox security layers, firewalls, and admin controls</p>
              </div>

              <div className="space-y-4 max-w-md">
                {/* Toggle: Unprivileged containers */}
                <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">Unprivileged Sandbox Envs</h4>
                    <p className="text-[10px] text-text-muted mt-0.5">Restrict containers namespaces (highly recommended)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurity({ ...security, unprivilegedByDefault: !security.unprivilegedByDefault })}
                    className="w-9 h-5 rounded-full transition-default relative border border-border"
                    style={{ background: security.unprivilegedByDefault ? 'var(--color-primary)' : 'var(--color-surface)' }}
                  >
                    <div 
                      className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200"
                      style={{ left: security.unprivilegedByDefault ? '17px' : '2px' }}
                    />
                  </button>
                </div>

                {/* Toggle: Auto Cleanup */}
                <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">Auto Cleanup</h4>
                    <p className="text-[10px] text-text-muted mt-0.5">Garbage collect expired idle containers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecurity({ ...security, autoCleanup: !security.autoCleanup })}
                    className="w-9 h-5 rounded-full transition-default relative border border-border"
                    style={{ background: security.autoCleanup ? 'var(--color-primary)' : 'var(--color-surface)' }}
                  >
                    <div 
                      className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200"
                      style={{ left: security.autoCleanup ? '17px' : '2px' }}
                    />
                  </button>
                </div>

                {/* Firewall Policy */}
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Network Firewall Default Action</label>
                  <select
                    value={security.firewallPolicy}
                    onChange={(e) => setSecurity({ ...security, firewallPolicy: e.target.value })}
                    className="w-full px-2 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                  >
                    <option value="allow-all">Allow outbound connections (Default)</option>
                    <option value="block-wan">Block WAN access (Isolated Intranet)</option>
                    <option value="block-all">Full Isolation (No LAN/WAN access)</option>
                  </select>
                </div>

                {/* Session Timeout */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Web Shell Idle Timeout</label>
                    <span className="text-xs font-bold text-primary font-tech">{security.sessionTimeout} min</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={15}
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                    className="w-full cursor-pointer h-1.5 bg-surface rounded-lg appearance-none accent-primary"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Security Rules</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </DashboardLayout>
  );
}
