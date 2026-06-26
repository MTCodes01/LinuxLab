import { useState, useEffect } from 'react';
import { containersAPI, templatesAPI } from '../../api/client';
import { X, ChevronRight, ChevronLeft, Terminal, Cpu, MemoryStick, HardDrive } from 'lucide-react';

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
    templatesAPI.list().then(({ data }) => setTemplates(data)).catch(() => {});
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div
        className="relative glass glow-primary w-full max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Create Container</h2>
            <p className="text-sm text-text-muted mt-0.5">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-700 transition-default">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1" style={{ background: 'var(--color-surface-700)' }}>
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--color-primary)' }}
          />
        </div>

        {/* Body */}
        <div className="p-5 min-h-[280px]">
          {error && (
            <div className="p-3 mb-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-danger-light)' }}>
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <FormInput label="Container Name" value={form.name} onChange={v => updateForm('name', v)} placeholder="my-ubuntu" pattern="^[a-zA-Z0-9_-]+$" />
              <FormInput label="Linux Username" value={form.username} onChange={v => updateForm('username', v)} placeholder="rahul" pattern="^[a-z_][a-z0-9_-]*$" />
              <FormInput label="Password" value={form.password} onChange={v => updateForm('password', v)} placeholder="••••••••" type="password" />
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    updateForm('distro', t.distro);
                    updateForm('cpu_limit', t.default_cpu);
                    updateForm('ram_limit', t.default_ram);
                    updateForm('storage_limit', t.default_storage);
                  }}
                  className={`p-4 rounded-xl text-left transition-default ${
                    form.distro === t.distro ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{
                    background: form.distro === t.distro ? 'rgba(6,182,212,0.1)' : 'var(--color-surface-700)',
                    border: `1px solid ${form.distro === t.distro ? 'rgba(6,182,212,0.3)' : 'var(--color-glass-border)'}`,
                  }}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="text-sm font-medium text-text-primary mt-2">{t.name}</p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <SliderInput icon={Cpu} label="CPU Cores" value={form.cpu_limit} min={0.25} max={8} step={0.25} unit=" cores" onChange={v => updateForm('cpu_limit', v)} />
              <SliderInput icon={MemoryStick} label="RAM" value={form.ram_limit} min={128} max={8192} step={128} unit=" MB" onChange={v => updateForm('ram_limit', v)} />
              <SliderInput icon={HardDrive} label="Storage" value={form.storage_limit} min={1} max={50} step={1} unit=" GB" onChange={v => updateForm('storage_limit', v)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-glass-border)' }}>
                <div>
                  <p className="text-sm font-medium text-text-primary">Enable SSH Access</p>
                  <p className="text-xs text-text-muted mt-0.5">Allow SSH connections to this container</p>
                </div>
                <button
                  onClick={() => updateForm('ssh_enabled', !form.ssh_enabled)}
                  className="w-11 h-6 rounded-full transition-default relative"
                  style={{ background: form.ssh_enabled ? 'var(--color-primary)' : 'var(--color-surface-500)' }}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                       style={{ left: form.ssh_enabled ? '22px' : '2px' }} />
                </button>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-glass-border)' }}>
                <p className="text-sm font-medium text-text-primary mb-2">Container Lifetime</p>
                <p className="text-xs text-text-muted mb-3">Auto-delete after N hours (leave empty for permanent)</p>
                <input
                  type="number"
                  value={form.lifetime_hours || ''}
                  onChange={(e) => updateForm('lifetime_hours', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="No limit"
                  min={1}
                  max={8760}
                  className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ background: 'var(--color-surface-600)', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.1)' }}>
                <p className="text-sm font-semibold text-primary mb-2">Summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                  <span>Name:</span><span className="text-text-primary">{form.name}</span>
                  <span>User:</span><span className="text-text-primary">{form.username}</span>
                  <span>Distro:</span><span className="text-text-primary">{form.distro}</span>
                  <span>CPU:</span><span className="text-text-primary">{form.cpu_limit} cores</span>
                  <span>RAM:</span><span className="text-text-primary">{form.ram_limit} MB</span>
                  <span>Storage:</span><span className="text-text-primary">{form.storage_limit} GB</span>
                  <span>SSH:</span><span className="text-text-primary">{form.ssh_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t" style={{ borderColor: 'var(--color-glass-border)' }}>
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-default"
          >
            <ChevronLeft className="w-4 h-4" />
            {step > 0 ? 'Back' : 'Cancel'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:brightness-110 transition-default disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading || !canNext()}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:brightness-110 transition-default disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  Create Container
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = 'text', pattern }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        pattern={pattern}
        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-default"
        style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-primary)' }}
        required
      />
    </div>
  );
}

function SliderInput({ icon: Icon, label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-secondary">{label}</span>
        </div>
        <span className="text-sm font-semibold text-primary">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-surface-600) ${((value - min) / (max - min)) * 100}%)` }}
      />
      <div className="flex justify-between text-xs text-text-muted mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
