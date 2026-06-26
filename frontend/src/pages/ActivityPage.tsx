import { Terminal, Plus, Trash2, Power, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const activities = [
  { id: 1, user: "admin", action: "Terminal Access", target: "web-server-01", time: "10 minutes ago", icon: Terminal, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, user: "system", action: "Restart", target: "db-primary", time: "1 hour ago", icon: RotateCcw, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 3, user: "developer", action: "SSH Login", target: "db-primary", time: "2 hours ago", icon: Terminal, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 4, user: "admin", action: "Stopped", target: "ubuntu-test", time: "1 day ago", icon: Power, color: "text-zinc-500", bg: "bg-zinc-500/10" },
  { id: 5, user: "admin", action: "Created", target: "ubuntu-test", time: "3 days ago", icon: Plus, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: 6, user: "admin", action: "Deleted", target: "old-cache", time: "1 week ago", icon: Trash2, color: "text-red-500", bg: "bg-red-500/10" },
]

export default function ActivityPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">Timeline of system and user events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {activities.map((item) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card ${item.bg} ${item.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10`}>
                  <item.icon className="w-4 h-4" />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {item.action}
                    </div>
                    <time className="text-xs text-muted-foreground">{item.time}</time>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{item.user}</span> performed action on <span className="font-mono text-primary text-xs">{item.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
