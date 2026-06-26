import { useState, useEffect } from "react"
import { Terminal, Plus, Trash2, Power, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { logsAPI } from "@/api/client"

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await logsAPI.list()
        setLogs(data.logs || data)
      } catch (error) {
        console.error("Failed to load logs", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const getIconConfig = (action: string) => {
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes("create")) return { icon: Plus, color: "text-purple-500", bg: "bg-purple-500/10" }
    if (lowerAction.includes("delete")) return { icon: Trash2, color: "text-red-500", bg: "bg-red-500/10" }
    if (lowerAction.includes("stop")) return { icon: Power, color: "text-zinc-500", bg: "bg-zinc-500/10" }
    if (lowerAction.includes("restart")) return { icon: RotateCcw, color: "text-orange-500", bg: "bg-orange-500/10" }
    return { icon: Terminal, color: "text-blue-500", bg: "bg-blue-500/10" }
  }

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
          {loading ? (
             <div className="flex justify-center py-8">
               <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             </div>
          ) : logs.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">No activity logs found.</div>
          ) : (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {logs.map((item) => {
                const config = getIconConfig(item.action)
                return (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card ${config.bg} ${config.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10`}>
                      <config.icon className="w-4 h-4" />
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {item.action}
                        </div>
                        <time className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</time>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{item.username || "system"}</span> performed action on <span className="font-mono text-primary text-xs">{item.target_id || "global"}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
