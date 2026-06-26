import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { containersAPI, templatesAPI } from "@/api/client"
import { useNavigate } from "react-router-dom"

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: string;
  onSuccess?: () => void;
}

export function DeployContainerModal({ open, onOpenChange, initialTemplate, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [templates, setTemplates] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    username: "root",
    password: "",
    distro: initialTemplate || "",
    cpu_limit: 1,
    ram_limit: 512,
    storage_limit: 10,
    ssh_enabled: true
  })

  useEffect(() => {
    if (open) {
      templatesAPI.list().then(res => {
        setTemplates(res.data)
        if (initialTemplate) {
          setFormData(prev => ({ ...prev, distro: initialTemplate }))
        } else if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, distro: res.data[0].key }))
        }
      }).catch(err => console.error("Failed to fetch templates", err))
    }
  }, [open, initialTemplate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await containersAPI.create(formData)
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to deploy container")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy New Container</DialogTitle>
          <DialogDescription>
            Configure your new container instance. It will be provisioned immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/30">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Container Name</Label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="web-server-01" 
                required 
                pattern="^[a-zA-Z0-9_-]+$"
              />
            </div>
            <div className="space-y-2">
              <Label>Template (Distro)</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.distro}
                onChange={e => setFormData({ ...formData, distro: e.target.value })}
                required
              >
                {templates.map(t => (
                  <option key={t.key} value={t.key}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="root" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
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
            <div className="space-y-2">
              <Label>CPU Cores</Label>
              <Input 
                type="number" 
                min={0.25} max={8} step={0.25}
                value={formData.cpu_limit}
                onChange={e => setFormData({ ...formData, cpu_limit: parseFloat(e.target.value) })}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>RAM (MB)</Label>
              <Input 
                type="number" 
                min={128} max={16384} step={128}
                value={formData.ram_limit}
                onChange={e => setFormData({ ...formData, ram_limit: parseInt(e.target.value) })}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Storage (GB)</Label>
              <Input 
                type="number" 
                min={1} max={100}
                value={formData.storage_limit}
                onChange={e => setFormData({ ...formData, storage_limit: parseInt(e.target.value) })}
                required 
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border mt-4">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Deploying..." : "Deploy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
