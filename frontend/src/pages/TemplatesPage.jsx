import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { templatesAPI, containersAPI } from '../api/client';
import {
  Plus, Trash2, Cpu, HardDrive, X, Terminal, ShieldAlert,
  CheckCircle, Info, Zap, ChevronRight
} from 'lucide-react';

function DistroEmoji({ distro }) {
  const name = distro.toLowerCase();
  if (name.includes('ubuntu')) return '🟠';
  if (name.includes('debian')) return '🔴';
  if (name.includes('alpine')) return '🔵';
  if (name.includes('arch'))   return '🔵';
  if (name.includes('rocky') || name.includes('centos')) return '🟢';
  if (name.includes('kali'))   return '🟣';
  return '🐧';
}

function getDistroGradient(distro) {
  const name = distro.toLowerCase();
  if (name.includes('ubuntu')) return 'from-orange-500/20 to-orange-600/5 border-orange-500/20';
  if (name.includes('debian')) return 'from-red-500/20 to-red-600/5 border-red-500/20';
  if (name.includes('alpine')) return 'from-blue-500/20 to-blue-600/5 border-blue-500/20';
  if (name.includes('arch'))   return 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20';
  if (name.includes('rocky') || name.includes('centos')) return 'from-green-500/20 to-green-600/5 border-green-500/20';
  if (name.includes('kali'))   return 'from-purple-500/20 to-purple-600/5 border-purple-500/20';
  return 'from-violet-500/20 to-violet-600/5 border-violet-500/20';
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployingTemplate, setDeployingTemplate] = useState(null);

  const [deployName, setDeployName]   = useState('');
  const [deployUser, setDeployUser]   = useState('linuxlab');
  const [deployPass, setDeployPass]   = useState('');
  const [deploying, setDeploying]     = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(null);
  const [deployError, setDeployError] = useState('');

  useEffect(() => {
    templatesAPI.list()
      .then(({ data }) => { setTemplates(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      await templatesAPI.delete(id);
      setTemplates(t => t.filter(x => x.id !== id));
    } catch {}
  };

  const handleOpenDeploy = (template) => {
    const suffix = Math.floor(100 + Math.random() * 900);
    const sanitized = template.distro.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    setDeployName(`${sanitized}-sandbox-${suffix}`);
    setDeployUser('linuxlab');
    setDeployPass(`lab-pass-${suffix}`);
    setDeployingTemplate(template);
    setDeployError('');
    setDeploySuccess(null);
  };

  const handleDeploySubmit = async (e) => {
    e.preventDefault();
    if (!deployName || !deployUser || !deployPass) {
      setDeployError('Please fill out all fields.');
      return;
    }
    setDeploying(true);
    setDeployError('');
    try {
      const { data } = await containersAPI.create({
        name: deployName,
        username: deployUser,
        password: deployPass,
        distro: deployingTemplate.distro,
        cpu_limit: deployingTemplate.default_cpu,
        ram_limit: deployingTemplate.default_ram,
        storage_limit: deployingTemplate.default_storage,
        ssh_enabled: true,
        lifetime_hours: null,
      });
      setDeploySuccess({
        name: deployName,
        username: deployUser,
        password: deployPass,
        ip: data?.ip_address || 'assigning...',
      });
    } catch (err) {
      setDeployError(err.response?.data?.detail || 'Failed to deploy container.');
    } finally {
      setDeploying(false);
    }
  };

  const categories = [...new Set(templates.map(t => t.category || 'OS Distributions'))];

  return (
    <DashboardLayout>
      {loading ? (
        <div className="card flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-text-muted opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">No templates available</h3>
          <p className="text-sm text-text-muted max-w-xs">
            Templates help you instantly bootstrap standard environments.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates
                  .filter(t => (t.category || 'OS Distributions') === category)
                  .map((template, i) => {
                    const gradient = getDistroGradient(template.distro);
                    return (
                      <div
                        key={template.id}
                        className="card card-hover flex flex-col overflow-hidden animate-slide-up group"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        {/* Gradient header */}
                        <div className={`bg-gradient-to-br ${gradient} border-b border-border/50 p-4 relative`}>
                          <div className="flex items-start justify-between">
                            <span className="text-3xl">{template.icon || <DistroEmoji distro={template.distro} />}</span>
                            <button
                              onClick={() => handleDelete(template.id, template.name)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-default opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-bold text-text-primary text-base mb-1">{template.name}</h3>
                          <p className="text-sm text-text-muted leading-relaxed flex-1 mb-4">
                            {template.description || 'Pre-configured Linux environment.'}
                          </p>

                          {/* Specs */}
                          <div className="flex items-center justify-between text-xs text-text-muted font-mono border-t border-border/50 pt-3 mb-4">
                            <div className="flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5" />
                              {template.default_cpu} vCPU
                            </div>
                            <div className="flex items-center gap-1.5">
                              <HardDrive className="w-3.5 h-3.5" />
                              {template.default_ram} MB
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenDeploy(template)}
                            className="btn btn-primary w-full"
                          >
                            Deploy Template
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deploy Modal */}
      {deployingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deploying && setDeployingTemplate(null)}
          />

          <div className="relative bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-lg animate-scale-in z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/30">
              <div>
                <h3 className="font-bold text-text-primary">
                  Deploy {deployingTemplate.name}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">Configure your new container</p>
              </div>
              <button
                onClick={() => !deploying && setDeployingTemplate(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-default"
                disabled={deploying}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Error */}
              {deployError && (
                <div className="flex items-start gap-2.5 p-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger animate-fade-in">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {deployError}
                </div>
              )}

              {deploySuccess ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-start gap-2.5 p-3 bg-success/10 border border-success/20 rounded-xl text-sm text-success">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Container Provisioned!</p>
                      <p className="text-xs mt-1 font-mono">{deploySuccess.name}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-surface border border-border rounded-xl space-y-2 text-sm">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                      Connection Info
                    </p>
                    {[
                      ['Username', deploySuccess.username],
                      ['Password', deploySuccess.password],
                      ['SSH', `ssh ${deploySuccess.username}@${deploySuccess.ip}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-baseline gap-3">
                        <span className="text-text-muted text-xs w-20 flex-shrink-0">{k}</span>
                        <code className="font-mono text-xs text-text-primary flex-1 break-all">{v}</code>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setDeployingTemplate(null)}
                    className="btn btn-primary w-full"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDeploySubmit} className="space-y-4">
                  {[
                    { label: 'Container Name', id: 'name', value: deployName, onChange: e => setDeployName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')), placeholder: 'sandbox-name', mono: true },
                    { label: 'SSH Username',   id: 'user', value: deployUser, onChange: e => setDeployUser(e.target.value), placeholder: 'linuxlab', mono: true },
                    { label: 'SSH Password',   id: 'pass', value: deployPass, onChange: e => setDeployPass(e.target.value), placeholder: '••••••••', type: 'password' },
                  ].map(({ label, id, value, onChange, placeholder, mono, type }) => (
                    <div key={id}>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                        {label}
                      </label>
                      <input
                        type={type || 'text'}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required
                        disabled={deploying}
                        className={`input-base ${mono ? 'font-mono' : ''}`}
                      />
                    </div>
                  ))}

                  <div className="flex items-start gap-2.5 p-3 bg-surface border border-border rounded-xl text-xs text-text-muted">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                    Allocates <strong className="text-text-secondary">{deployingTemplate.default_cpu} vCPU</strong> and{' '}
                    <strong className="text-text-secondary">{deployingTemplate.default_ram} MB RAM</strong>. SSH auto-enabled.
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setDeployingTemplate(null)}
                      className="btn btn-secondary flex-1"
                      disabled={deploying}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={deploying}>
                      {deploying ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Terminal className="w-4 h-4" />
                      )}
                      {deploying ? 'Deploying...' : 'Start Instance'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
