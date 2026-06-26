import { useState, useEffect } from "react"
import { Search, Play, Square, RotateCw, Terminal, Trash2, Server } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { containersAPI } from "@/api/client"
import { useNavigate } from "react-router-dom"

export default function ContainersPage() {
  const [search, setSearch] = useState("")
  const [containers, setContainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  const fetchContainers = async () => {
    try {
      const { data } = await containersAPI.list()
      setContainers(data.containers)
    } catch (error) {
      console.error("Failed to load containers", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()
  }, [])

  const handleAction = async (id: number, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      await containersAPI[action](id);
      fetchContainers();
    } catch (error) {
      console.error(`Failed to ${action} container`, error);
    }
  }

  const filteredContainers = containers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.distro.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Containers</h1>
          <p className="text-muted-foreground">Manage your deployed containers.</p>
        </div>
        <Button className="gap-2">
          <Server className="h-4 w-4" />
          Deploy Container
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search containers..."
                className="pl-9 bg-background border-none focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>RAM</TableHead>
                <TableHead>Disk</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredContainers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No containers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredContainers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                    <TableCell>{c.distro}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "running" ? "success" : c.status === "error" ? "destructive" : "stopped"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.cpu_limit} Cores</TableCell>
                    <TableCell>{c.ram_limit} MB</TableCell>
                    <TableCell>{c.storage_limit} GB</TableCell>
                    <TableCell className="font-mono text-xs">{c.ip_address || "None"}</TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'running' ? (
                          <>
                            <Button onClick={() => navigate(`/terminal/${c.id}`)} variant="ghost" size="icon" title="Terminal" className="text-muted-foreground hover:text-foreground">
                              <Terminal className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleAction(c.id, 'stop')} variant="ghost" size="icon" title="Stop" className="text-muted-foreground hover:text-destructive">
                              <Square className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleAction(c.id, 'restart')} variant="ghost" size="icon" title="Restart" className="text-muted-foreground hover:text-foreground">
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => handleAction(c.id, 'start')} variant="ghost" size="icon" title="Start" className="text-muted-foreground hover:text-success">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button onClick={() => handleAction(c.id, 'delete')} variant="ghost" size="icon" title="Delete" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
