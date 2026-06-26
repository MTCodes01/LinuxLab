import { useState, useEffect } from "react"
import { Server, Download, Cpu, HardDrive, MemoryStick } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { templatesAPI } from "@/api/client"
import { DeployContainerModal } from "@/components/containers/DeployContainerModal"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deployModalOpen, setDeployModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>()

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await templatesAPI.list()
        setTemplates(data)
      } catch (error) {
        console.error("Failed to load templates", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Quickly deploy pre-configured environments.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(t => (
            <Card key={t.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Server className="h-6 w-6" />
                </div>
                <CardTitle>{t.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">{t.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-1 bg-secondary/50 p-2 rounded-md text-center">
                    <Cpu className="h-4 w-4" />
                    <span>{t.cpu_limit} Cores</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-secondary/50 p-2 rounded-md text-center">
                    <MemoryStick className="h-4 w-4" />
                    <span>{t.ram_limit} MB</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-secondary/50 p-2 rounded-md text-center">
                    <HardDrive className="h-4 w-4" />
                    <span>{t.storage_limit} GB</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2 group-hover:bg-primary/90"
                  onClick={() => {
                    setSelectedTemplate(t.key)
                    setDeployModalOpen(true)
                  }}
                >
                  <Download className="h-4 w-4" />
                  Deploy
                </Button>
              </CardFooter>
            </Card>
          ))}
          {templates.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No templates found.
            </div>
          )}
        </div>
      )}
      <DeployContainerModal 
        open={deployModalOpen} 
        onOpenChange={setDeployModalOpen}
        initialTemplate={selectedTemplate}
      />
    </div>
  )
}
