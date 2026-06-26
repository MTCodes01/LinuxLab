import { useEffect, useState } from "react"
import { Activity, Server, Cpu, HardDrive, MemoryStick } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { monitoringAPI, containersAPI } from "@/api/client"

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [recentContainers, setRecentContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, containersRes] = await Promise.all([
          monitoringAPI.overview(),
          containersAPI.list()
        ]);
        setOverview(overviewRes.data);
        setRecentContainers(containersRes.data.containers.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const stats = overview ? [
    { title: "Running Containers", value: overview.running_containers, icon: Server, color: "text-emerald-500" },
    { title: "Stopped Containers", value: overview.stopped_containers, icon: Server, color: "text-zinc-500" },
    { title: "CPU Allocated", value: `${overview.total_cpu_allocated} Cores`, icon: Cpu, color: "text-blue-500" },
    { title: "RAM Allocated", value: `${overview.total_ram_allocated_mb} MB`, icon: MemoryStick, color: "text-purple-500" },
    { title: "Disk Allocated", value: `${overview.total_storage_allocated_gb} GB`, icon: HardDrive, color: "text-orange-500" },
    { title: "Total Containers", value: overview.total_containers, icon: Server, color: "text-sky-500" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your infrastructure and containers.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
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
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>RAM</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentContainers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.distro}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "running" ? "success" : "stopped"}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.cpu_limit} Cores</TableCell>
                        <TableCell>{c.ram_limit} MB</TableCell>
                        <TableCell className="font-mono text-xs">{c.ip_address || "None"}</TableCell>
                      </TableRow>
                    ))}
                    {recentContainers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No containers found.
                        </TableCell>
                      </TableRow>
                    )}
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
                      <p className="text-sm font-medium leading-none">Platform API</p>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15">
                      <Server className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">Docker Daemon</p>
                      <p className="text-sm text-muted-foreground">Operational</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
