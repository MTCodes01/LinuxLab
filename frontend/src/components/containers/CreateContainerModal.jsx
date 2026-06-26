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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-card border border-border w-full max-w-lg rounded shadow-lg z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-elevated">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Create Container</h2>
            <p className="text-xs text-text-muted mt-0.5">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-text-muted hover:text-text-primary transition-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="h-1 bg-surface border-b border-border w-full">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-4 min-h-[260px] bg-background">
          {error && (
            <div className="p-2 mb-3 bg-danger text-white text-xs rounded border border-red-700">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-3">
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
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px]">
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
                  className={`p-3 text-left border rounded transition-fast cursor-pointer ${
                    form.distro === t.distro 
                      ? 'bg-primary/20 border-primary text-text-primary' 
                      : 'bg-surface border-border hover:bg-elevated'
                  }`}
                >
                  <span className="text-lg">{t.icon || '🐧'}</span>
                  <p className="text-xs font-bold text-text-primary mt-1">{t.name}</p>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <SliderInput icon={Cpu} label="CPU Cores" value={form.cpu_limit} min={0.25} max={8} step={0.25} unit=" cores" onChange={v => updateForm('cpu_limit', v)} />
              <SliderInput icon={MemoryStick} label="RAM Allocation" value={form.ram_limit} min={128} max={8192} step={128} unit=" MB" onChange={v => updateForm('ram_limit', v)} />
              <SliderInput icon={HardDrive} label="Disk Storage" value={form.storage_limit} min={1} max={50} step={1} unit=" GB" onChange={v => updateForm('storage_limit', v)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {/* SSH Switch */}
              <div className="flex items-center justify-between p-3 bg-surface border border-border rounded">
                <div>
                  <p className="text-xs font-bold text-text-primary">Enable SSH Daemon Access</p>
                  <p className="text-[11px] text-text-muted">Allows remote connections through port 22</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm('ssh_enabled', !form.ssh_enabled)}
                  className={`toggle-track ${form.ssh_enabled ? 'active' : ''}`}
                >
                  <div className="toggle-thumb" />
                </button>
              </div>

              {/* Lifetime Limit */}
              <div className="p-3 bg-surface border border-border rounded">
                <p className="text-xs font-bold text-text-primary mb-1">Container Expiration (Hours)</p>
                <p className="text-[11px] text-text-muted mb-2">Auto-destruct container after N hours (empty = permanent)</p>
                <input
                  type="number"
                  value={form.lifetime_hours || ''}
                  onChange={(e) => updateForm('lifetime_hours', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Permanent"
                  min={1}
                  max={8760}
                  className="input-base text-xs font-mono w-32"
                />
              </div>

              {/* Deployment Summary */}
              <div className="p-3 bg-elevated border border-border rounded">
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Configuration Summary</p>
                <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] font-mono">
                  <span className="text-text-muted">Hostname:</span><span className="text-text-primary font-bold">{form.name}</span>
                  <span className="text-text-muted">Username:</span><span className="text-text-primary font-bold">{form.username}</span>
                  <span className="text-text-muted">Image:</span><span className="text-text-primary font-bold">{form.distro}</span>
                  <span className="text-text-muted">CPU:</span><span className="text-text-primary font-bold">{form.cpu_limit} Cores</span>
                  <span className="text-text-muted">RAM:</span><span className="text-text-primary font-bold">{form.ram_limit} MB</span>
                  <span className="text-text-muted">Storage:</span><span className="text-text-primary font-bold">{form.storage_limit} GB</span>
                  <span className="text-text-muted">SSH:</span><span className="text-text-primary font-bold">{form.ssh_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-elevated">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="btn btn-secondary text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{step > 0 ? 'Back' : 'Cancel'}</span>
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="btn btn-primary text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !canNext()}
              className="btn btn-primary text-xs"
            >
              {loading ? (
                <span>Deploying...</span>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  <span>Deploy</span>
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
      <label className="block text-[11px] font-bold text-text-primary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base text-xs"
        required
      />
    </div>
  );
}

function SliderInput({ icon: Icon, label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs font-bold text-text-primary">{label}</span>
        </div>
        <span className="text-xs font-mono font-bold text-primary">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-text-muted mt-1 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
