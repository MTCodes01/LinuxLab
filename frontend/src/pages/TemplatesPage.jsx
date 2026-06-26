import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { templatesAPI } from '../api/client';
import { Plus, Pencil, Trash2, Copy, BookTemplate } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    templatesAPI.list()
      .then(({ data }) => { setTemplates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await templatesAPI.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const categories = [...new Set(templates.map(t => t.category || 'Uncategorized'))];

  return (
    <DashboardLayout title="Templates">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates
                  .filter(t => (t.category || 'Uncategorized') === category)
                  .map((template, i) => (
                    <div
                      key={template.id}
                      className="glass glass-hover p-5 animate-slide-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{template.icon || '📦'}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(template.id)} className="p-1.5 rounded-lg hover:bg-surface-700 transition-default">
                            <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-danger" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary mb-1">{template.name}</h3>
                      <p className="text-xs text-text-muted mb-3 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>{template.default_cpu} CPU</span>
                        <span>•</span>
                        <span>{template.default_ram} MB</span>
                        <span>•</span>
                        <span>{template.default_storage} GB</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
