import { useState, useEffect } from "react"
import { TerminalSquare, Unplug } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { sessionsAPI } from "@/api/client"
import { useNavigate } from "react-router-dom"

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await sessionsAPI.list()
        setSessions(data.sessions || data)
      } catch (error) {
        console.error("Failed to load sessions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No active sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-foreground">{s.user || s.username}</TableCell>
                    <TableCell>{s.container_id}</TableCell>
                    <TableCell>
                      <Badge variant={s.type === "ssh" ? "secondary" : "default"}>{s.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.ip_address || "N/A"}</TableCell>
                    <TableCell>{new Date(s.started_at).toLocaleString()}</TableCell>
                    <TableCell className="font-mono">{s.duration || "Active"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.type !== "ssh" && (
                          <Button onClick={() => navigate(`/terminal/${s.container_id}`)} variant="ghost" size="icon" title="View Terminal" className="text-muted-foreground hover:text-primary">
                            <TerminalSquare className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Disconnect" className="text-muted-foreground hover:text-destructive">
                          <Unplug className="h-4 w-4" />
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
