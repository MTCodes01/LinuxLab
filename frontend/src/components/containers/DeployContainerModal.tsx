import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { containersAPI, templatesAPI } from "@/api/client"

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: string;  // distro key e.g. "debian-12"
  onSuccess?: () => void;
}

interface Template {
  id: number;
  name: string;
  distro: string;
  description?: string;
  default_cpu: number;
  default_ram: number;
  default_storage: number;
}

export function DeployContainerModal({ open, onOpenChange, initialTemplate, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [templates, setTemplates] = useState<Template[]>([])

  const [formData, setFormData] = useState({
    name: "",
    username: "admin",
    password: "",
    distro: "",
    cpu_limit: 1,
    ram_limit: 512,
    storage_limit: 10,
    ssh_enabled: true,
  })

  useEffect(() => {
    if (!open) return
    setError("")
    setFormData(prev => ({ ...prev, name: "", password: "" }))

    templatesAPI.list().then(res => {
      const list: Template[] = res.data
      setTemplates(list)

      // Pick the initial template or the first one
      const match = initialTemplate
        ? list.find(t => t.distro === initialTemplate) ?? list[0]
        : list[0]

      if (match) {
        setFormData(prev => ({
          ...prev,
          distro: match.distro,
          cpu_limit: match.default_cpu,
          ram_limit: match.default_ram,
          storage_limit: match.default_storage,
        }))
      }
    }).catch(() => setError("Failed to load templates."))
  }, [open, initialTemplate])

  // When user changes the distro, auto-fill defaults from that template
  const handleDistroChange = (distro: string) => {
    const match = templates.find(t => t.distro === distro)
    if (match) {
      setFormData(prev => ({
        ...prev,
        distro,
        cpu_limit: match.default_cpu,
        ram_limit: match.default_ram,
        storage_limit: match.default_storage,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await containersAPI.create(formData)
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to deploy container.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Deploy New Container</DialogTitle>
          <DialogDescription>
            Configure your new container instance. It will be provisioned immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/30">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Container Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="web-server-01"
                required
                pattern="^[a-zA-Z0-9_-]+$"
                title="Only letters, numbers, underscores and hyphens"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="distro">Template</Label>
              <select
                id="distro"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.distro}
                onChange={e => handleDistroChange(e.target.value)}
                required
              >
                {templates.map(t => (
                  <option key={t.id} value={t.distro}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cpu">CPU Cores</Label>
              <Input
                id="cpu"
                type="number"
                min={0.25} max={8} step={0.25}
                value={formData.cpu_limit}
                onChange={e => setFormData({ ...formData, cpu_limit: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ram">RAM (MB)</Label>
              <Input
                id="ram"
                type="number"
                min={128} max={16384} step={128}
                value={formData.ram_limit}
                onChange={e => setFormData({ ...formData, ram_limit: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storage">Storage (GB)</Label>
              <Input
                id="storage"
                type="number"
                min={1} max={100}
                value={formData.storage_limit}
                onChange={e => setFormData({ ...formData, storage_limit: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || templates.length === 0}>
              {loading
                ? <><span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Deploying…</>
                : "Deploy"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
