import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { templatesAPI, containersAPI } from '../api/client';
import { 
  Plus, Trash2, Cpu, HardDrive, Layout, ChevronRight, X, 
  Terminal, ShieldAlert, CheckCircle, Info
} from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deployingTemplate, setDeployingTemplate] = useState(null);
  
  // Deploy Form State
  const [deployName, setDeployName] = useState('');
  const [deployUser, setDeployUser] = useState('linuxlab');
  const [deployPass, setDeployPass] = useState('linuxlab123');
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(null);
  const [deployError, setDeployError] = useState('');

  const fetchTemplates = () => {
    setLoading(true);
    templatesAPI.list()
      .then(({ data }) => { 
        setTemplates(data || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      await templatesAPI.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const handleOpenDeploy = (template) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const sanitizedDistro = template.distro.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    setDeployName(`${sanitizedDistro}-sandbox-${randomSuffix}`);
    setDeployUser('linuxlab');
    setDeployPass(`lab-pass-${randomSuffix}`);
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
      const payload = {
        name: deployName,
        username: deployUser,
        password: deployPass,
        distro: deployingTemplate.distro,
        cpu_limit: deployingTemplate.default_cpu,
        ram_limit: deployingTemplate.default_ram,
        storage_limit: deployingTemplate.default_storage,
        ssh_enabled: true,
        lifetime_hours: null
      };

      const { data } = await containersAPI.create(payload);
      setDeploySuccess({
        name: deployName,
        username: deployUser,
        password: deployPass,
        ip: data?.ip_address || 'assigning IP...'
      });
    } catch (err) {
      setDeployError(err.response?.data?.detail || 'Failed to deploy container.');
    } finally {
      setDeploying(false);
    }
  };

  const getDistroColor = (distro) => {
    const name = distro.toLowerCase();
    if (name.includes('ubuntu')) return 'border-orange-500/20 text-orange-400 bg-orange-500/5';
    if (name.includes('debian')) return 'border-red-500/20 text-red-400 bg-red-500/5';
    if (name.includes('alpine')) return 'border-blue-400/20 text-blue-400 bg-blue-400/5';
    if (name.includes('rocky') || name.includes('centos')) return 'border-green-500/20 text-green-400 bg-green-500/5';
    if (name.includes('arch')) return 'border-cyan-400/20 text-cyan-400 bg-cyan-400/5';
    return 'border-purple-500/20 text-purple-400 bg-purple-500/5';
  };

  const categories = [...new Set(templates.map(t => t.category || 'OS Distributions'))];

  return (
    <DashboardLayout title="Templates">
      
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-16 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted mb-4">
            <Layout className="w-5 h-5 opacity-40" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">No templates available</h3>
          <p className="text-xs text-text-muted max-w-xs mb-4">Templates help bootstrap standard development envs instantly.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates
                  .filter(t => (t.category || 'OS Distributions') === category)
                  .map((template, i) => {
                    const colorClass = getDistroColor(template.distro);
                    return (
                      <div
                        key={template.id}
                        className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-border-hover transition-default flex flex-col justify-between animate-slide-up group"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <span className="text-2xl font-tech">{template.icon || '🐧'}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDelete(template.id, template.name)} 
                                className="p-1 rounded text-text-muted hover:text-danger hover:bg-surface border border-transparent hover:border-border transition-default cursor-pointer"
                                title="Delete Template"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Details */}
                          <h3 className="text-sm font-semibold text-text-primary mb-1 tracking-tight">
                            {template.name}
                          </h3>
                          
                          <p className="text-xs text-text-muted mb-4 line-clamp-2 leading-relaxed">
                            {template.description || 'Quick provisioned Linux environment.'}
                          </p>
                        </div>

                        {/* Footer specs & deployment button */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono border-t border-border/50 pt-3.5">
                            <div className="flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-text-muted" />
                              <span>{template.default_cpu} vCPU</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3 text-text-muted" />
                              <span>{template.default_ram} MB RAM</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenDeploy(template)}
                            className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                          >
                            <span>Deploy Template</span>
                            <ChevronRight className="w-3.5 h-3.5" />
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

      {/* One-Click Deploy Dialog */}
      {deployingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deploying && setDeployingTemplate(null)} />
          
          <div className="relative bg-card border border-border w-full max-w-sm rounded-xl overflow-hidden shadow-lg animate-slide-up z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface/20">
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Deploy {deployingTemplate.name}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Quick container configuration</p>
              </div>
              <button 
                onClick={() => !deploying && setDeployingTemplate(null)} 
                className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-default cursor-pointer"
                disabled={deploying}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content / Form */}
            <form onSubmit={handleDeploySubmit} className="p-5 space-y-4">
              {deployError && (
                <div className="p-3 bg-danger/10 border border-danger/15 rounded-lg text-xs text-danger flex items-start gap-2 animate-fade-in">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{deployError}</span>
                </div>
              )}

              {deploySuccess ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-success/10 border border-success/15 rounded-lg text-xs text-success flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Container Provisioned Successfully!</p>
                      <p className="mt-1 font-mono text-[10px]">Name: {deploySuccess.name}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-surface border border-border rounded-lg space-y-2 text-xs">
                    <p className="text-text-secondary font-medium uppercase text-[9px] tracking-wider">Default Connection Credentials</p>
                    <div className="grid grid-cols-3 gap-y-1 text-text-secondary">
                      <span className="text-text-muted">Username:</span>
                      <span className="col-span-2 font-mono font-semibold text-text-primary">{deploySuccess.username}</span>
                      <span className="text-text-muted">Password:</span>
                      <span className="col-span-2 font-mono font-semibold text-text-primary">{deploySuccess.password}</span>
                      <span className="text-text-muted">SSH access:</span>
                      <span className="col-span-2 font-mono text-text-primary">ssh {deploySuccess.username}@{deploySuccess.ip}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setDeployingTemplate(null)}
                      className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-default cursor-pointer"
                    >
                      Finish
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Container Name</label>
                      <input 
                        type="text" 
                        value={deployName}
                        onChange={(e) => setDeployName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary font-mono"
                        placeholder="sandbox-name"
                        required
                        disabled={deploying}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">SSH Username</label>
                      <input 
                        type="text" 
                        value={deployUser}
                        onChange={(e) => setDeployUser(e.target.value.replace(/[^a-z_][a-z0-9_-]*/g, ''))}
                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary font-mono"
                        required
                        disabled={deploying}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">SSH Password</label>
                      <input 
                        type="password" 
                        value={deployPass}
                        onChange={(e) => setDeployPass(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text-primary"
                        placeholder="SecretPassword"
                        required
                        disabled={deploying}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-surface border border-border rounded-lg text-[10px] text-text-muted flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                    <span>This container will allocate <b>{deployingTemplate.default_cpu} vCPU</b> and <b>{deployingTemplate.default_ram} MB memory</b>. SSH will be auto-enabled.</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeployingTemplate(null)}
                      className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border rounded-lg transition-default text-xs cursor-pointer"
                      disabled={deploying}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg border border-primary/20 transition-default cursor-pointer"
                      disabled={deploying}
                    >
                      {deploying ? (
                        <div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Terminal className="w-3.5 h-3.5" />
                      )}
                      <span>{deploying ? 'Deploying...' : 'Start Instance'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
