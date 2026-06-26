import { TerminalSquare, Unplug } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const mockSessions = [
  { id: "s1", user: "admin", container: "web-server-01", ip: "192.168.1.45", startedAt: "10 mins ago", duration: "10m 23s", type: "Web Terminal" },
  { id: "s2", user: "developer", container: "db-primary", ip: "10.0.0.23", startedAt: "2 hours ago", duration: "2h 5m 12s", type: "SSH" },
  { id: "s3", user: "admin", container: "ubuntu-test", ip: "192.168.1.45", startedAt: "1 day ago", duration: "24h 1m 5s", type: "Web Terminal" },
]

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground">Monitor and manage active shell and SSH sessions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Container</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">{s.user}</TableCell>
                  <TableCell>{s.container}</TableCell>
                  <TableCell>
                    <Badge variant={s.type === "SSH" ? "secondary" : "default"}>{s.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.ip}</TableCell>
                  <TableCell>{s.startedAt}</TableCell>
                  <TableCell className="font-mono">{s.duration}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Terminal" className="text-muted-foreground hover:text-primary">
                        <TerminalSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Disconnect" className="text-muted-foreground hover:text-destructive">
                        <Unplug className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {mockSessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No active sessions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
