import { useState } from "react"
import { Search, Play, Square, RotateCw, Terminal, Settings2, Trash2, MoreVertical, Server } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const mockContainers = [
  { id: "c1", name: "web-server-01", template: "Debian 12", status: "running", cpu: "2.1%", ram: "128MB / 1GB", disk: "4GB / 20GB", ip: "10.0.0.5", created: "2024-03-10" },
  { id: "c2", name: "db-primary", template: "Ubuntu 24.04", status: "running", cpu: "12.5%", ram: "2.4GB / 4GB", disk: "45GB / 100GB", ip: "10.0.0.6", created: "2024-03-08" },
  { id: "c3", name: "redis-cache", template: "Alpine Linux", status: "running", cpu: "0.5%", ram: "64MB / 512MB", disk: "1GB / 5GB", ip: "10.0.0.7", created: "2024-03-12" },
  { id: "c4", name: "dev-environment", template: "Ubuntu 24.04", status: "stopped", cpu: "-", ram: "-", disk: "12GB / 50GB", ip: "Offline", created: "2024-03-14" },
  { id: "c5", name: "failed-job", template: "Fedora", status: "error", cpu: "-", ram: "-", disk: "-", ip: "Offline", created: "2024-03-15" },
]

export default function ContainersPage() {
  const [search, setSearch] = useState("")
  
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
              {mockContainers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell>{c.template}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "running" ? "success" : c.status === "error" ? "destructive" : "stopped"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.cpu}</TableCell>
                  <TableCell>{c.ram}</TableCell>
                  <TableCell>{c.disk}</TableCell>
                  <TableCell className="font-mono text-xs">{c.ip}</TableCell>
                  <TableCell>{c.created}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.status === 'running' ? (
                        <>
                          <Button variant="ghost" size="icon" title="Terminal" className="text-muted-foreground hover:text-foreground">
                            <Terminal className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Stop" className="text-muted-foreground hover:text-destructive">
                            <Square className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Restart" className="text-muted-foreground hover:text-foreground">
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon" title="Start" className="text-muted-foreground hover:text-success">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
