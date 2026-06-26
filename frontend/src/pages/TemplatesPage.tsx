import { Server, Download, Cpu, HardDrive, MemoryStick } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const templates = [
  { id: 1, name: "Debian 12", desc: "A robust and stable Linux distribution.", cpu: "1 Core", ram: "1GB", disk: "10GB" },
  { id: 2, name: "Ubuntu 24.04", desc: "The latest LTS release of Ubuntu.", cpu: "2 Cores", ram: "2GB", disk: "20GB" },
  { id: 3, name: "Arch Linux", desc: "A lightweight and flexible Linux distribution.", cpu: "1 Core", ram: "512MB", disk: "10GB" },
  { id: 4, name: "Fedora", desc: "Innovative, free, and open source Linux.", cpu: "2 Cores", ram: "2GB", disk: "15GB" },
  { id: 5, name: "Python Lab", desc: "Pre-configured environment with Python 3.12, pip, and venv.", cpu: "2 Cores", ram: "1GB", disk: "10GB" },
  { id: 6, name: "Docker Learning Lab", desc: "Nested container environment for learning Docker.", cpu: "4 Cores", ram: "4GB", disk: "40GB" },
]

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Quickly deploy pre-configured environments.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <Card key={t.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Server className="h-6 w-6" />
              </div>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-1 bg-secondary/50 p-2 rounded-md">
                  <Cpu className="h-4 w-4" />
                  <span>{t.cpu}</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-secondary/50 p-2 rounded-md">
                  <MemoryStick className="h-4 w-4" />
                  <span>{t.ram}</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-secondary/50 p-2 rounded-md">
                  <HardDrive className="h-4 w-4" />
                  <span>{t.disk}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2 group-hover:bg-primary/90">
                <Download className="h-4 w-4" />
                Deploy
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
