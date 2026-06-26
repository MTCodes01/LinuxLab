import { useState, useEffect } from 'react';
import { containersAPI, templatesAPI } from '../../api/client';
import { X, ChevronRight, ChevronLeft, Terminal, Cpu, MemoryStick, HardDrive, Shield } from 'lucide-react';

const STEPS = ['Details', 'Template', 'Resources', 'Options'];

export default function CreateContainerModal({ onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    distro: 'ubuntu-24.04',
    cpu_limit: 1,
    ram_limit: 1024,
    storage_limit: 10,
    ssh_enabled: false,
    lifetime_hours: null,
  });

  useEffect(() => {
    templatesAPI.list().then(({ data }) => setTemplates(data || [])).catch(() => {});
  }, []);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      await containersAPI.create(form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create container');
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.name && form.username && form.password;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-card border border-border w-full max-w-lg rounded-xl overflow-hidden shadow-lg animate-slide-up z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface/20">
          <div>
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Create Container</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-default cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="h-1 bg-surface border-b border-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-5 min-h-[260px]">
          {error && (
            <div className="p-3 mb-4 bg-danger/10 border border-danger/15 rounded-lg text-xs text-danger">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <FormInput 
                label="Container Name" 
                value={form.name} 
                onChange={v => updateForm('name', v.replace(/[^a-zA-Z0-9_-]/g, ''))} 
                placeholder="my-ubuntu-box" 
              />
              <FormInput 
                label="Linux Username" 
                value={form.username} 
                onChange={v => updateForm('username', v.replace(/[^a-z_][a-z0-9_-]*/g, ''))} 
                placeholder="developer" 
              />
              <FormInput 
                label="Password" 
                value={form.password} 
                onChange={v => updateForm('password', v)} 
                placeholder="••••••••" 
                type="password" 
              />
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in overflow-y-auto max-h-[300px] pr-1">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    updateForm('distro', t.distro);
                    updateForm('cpu_limit', t.default_cpu);
                    updateForm('ram_limit', t.default_ram);
                    updateForm('storage_limit', t.default_storage);
                  }}
                  className={`p-3.5 rounded-lg text-left border transition-default cursor-pointer ${
                    form.distro === t.distro 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-surface border-border hover:border-border-hover'
                  }`}
                >
                  <span className="text-xl font-tech">{t.icon || '🐧'}</span>
                  <p className="text-xs font-semibold text-text-primary mt-2">{t.name}</p>
                  <p className="text-[10px] text-text-muted mt-1 line-clamp-2 leading-relaxed">{t.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <SliderInput icon={Cpu} label="CPU Cores" value={form.cpu_limit} min={0.25} max={8} step={0.25} unit=" cores" onChange={v => updateForm('cpu_limit', v)} />
              <SliderInput icon={MemoryStick} label="RAM Allocation" value={form.ram_limit} min={128} max={8192} step={128} unit=" MB" onChange={v => updateForm('ram_limit', v)} />
              <SliderInput icon={HardDrive} label="Disk Storage" value={form.storage_limit} min={1} max={50} step={1} unit=" GB" onChange={v => updateForm('storage_limit', v)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {/* SSH Switch */}
              <div className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Enable SSH Daemon Access</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Allows remote connections through port 22</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm('ssh_enabled', !form.ssh_enabled)}
                  className="w-9 h-5 rounded-full transition-default relative border border-border cursor-pointer"
                  style={{ background: form.ssh_enabled ? 'var(--color-primary)' : 'var(--color-surface)' }}
                >
                  <div 
                    className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200"
                    style={{ left: form.ssh_enabled ? '17px' : '2px' }} 
                  />
                </button>
              </div>

              {/* Lifetime Limit */}
              <div className="p-3.5 bg-surface border border-border rounded-lg">
                <p className="text-xs font-semibold text-text-primary mb-1">Container Expiration</p>
                <p className="text-[10px] text-text-muted mb-2.5">Auto-destruct container after N hours (leave empty for permanent)</p>
                <input
                  type="number"
                  value={form.lifetime_hours || ''}
                  onChange={(e) => updateForm('lifetime_hours', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Permanent"
                  min={1}
                  max={8760}
                  className="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-primary font-tech"
                />
              </div>

              {/* Deployment Summary */}
              <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Sandbox Configuration Summary</p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px] text-text-secondary font-mono">
                  <span className="text-text-muted">Target Hostname:</span><span className="text-text-primary font-semibold">{form.name}</span>
                  <span className="text-text-muted">Default Username:</span><span className="text-text-primary font-semibold">{form.username}</span>
                  <span className="text-text-muted">Linux Image:</span><span className="text-text-primary font-semibold">{form.distro}</span>
                  <span className="text-text-muted">CPU Allocated:</span><span className="text-text-primary font-semibold">{form.cpu_limit} Cores</span>
                  <span className="text-text-muted">RAM Allocated:</span><span className="text-text-primary font-semibold">{form.ram_limit} MB</span>
                  <span className="text-text-muted">Storage Mapped:</span><span className="text-text-primary font-semibold">{form.storage_limit} GB</span>
                  <span className="text-text-muted">SSH Status:</span><span className="text-text-primary font-semibold">{form.ssh_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-surface/20">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-default cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{step > 0 ? 'Back' : 'Cancel'}</span>
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !canNext()}
              className="flex items-center gap-1.5 px-5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Provision Environment</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary transition-default placeholder:text-text-muted"
        required
      />
    </div>
  );
}

function SliderInput({ icon: Icon, label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs font-medium text-text-secondary">{label}</span>
        </div>
        <span className="text-xs font-bold text-primary font-tech">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-surface border border-border rounded-lg appearance-none accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-[9px] text-text-muted mt-1 font-tech">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
