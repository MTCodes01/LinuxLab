import { Activity, Server, Cpu, HardDrive, Network, MemoryStick } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const stats = [
  { title: "Running Containers", value: "12", icon: Server, color: "text-emerald-500" },
  { title: "Stopped Containers", value: "3", icon: Server, color: "text-zinc-500" },
  { title: "CPU Usage", value: "24%", icon: Cpu, color: "text-blue-500" },
  { title: "RAM Usage", value: "16GB / 32GB", icon: MemoryStick, color: "text-purple-500" },
  { title: "Disk Usage", value: "240GB / 1TB", icon: HardDrive, color: "text-orange-500" },
  { title: "Network", value: "1.2 GB/s", icon: Network, color: "text-sky-500" },
]

const recentContainers = [
  { name: "web-server-01", image: "nginx:latest", status: "running", cpu: "2%", ram: "128MB", uptime: "5d" },
  { name: "db-primary", image: "postgres:15", status: "running", cpu: "12%", ram: "2.4GB", uptime: "12d" },
  { name: "redis-cache", image: "redis:alpine", status: "running", cpu: "1%", ram: "64MB", uptime: "12d" },
  { name: "ubuntu-test", image: "ubuntu:24.04", status: "stopped", cpu: "-", ram: "-", uptime: "-" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your infrastructure and containers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Recent Containers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>RAM</TableHead>
                  <TableHead>Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentContainers.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.image}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "running" ? "success" : "stopped"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.cpu}</TableCell>
                    <TableCell>{c.ram}</TableCell>
                    <TableCell>{c.uptime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
                  <Activity className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Host OS</p>
                  <p className="text-sm text-muted-foreground">Healthy - Uptime 34d</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15">
                  <Server className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Docker Daemon</p>
                  <p className="text-sm text-muted-foreground">Running - v24.0.5</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
