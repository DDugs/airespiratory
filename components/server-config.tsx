"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface ServerConfigProps {
  serverUrl: string
  setServerUrl: (url: string) => void
}

export function ServerConfig({ serverUrl, setServerUrl }: ServerConfigProps) {
  const [tempUrl, setTempUrl] = useState(serverUrl)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "failed">("untested")
  const [modelInfo, setModelInfo] = useState<any>(null)

  const testConnection = async () => {
    setIsTesting(true)
    setConnectionStatus("untested")
    setModelInfo(null)

    try {
      const response = await fetch(`${tempUrl}/info`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Connection failed")
      }

      const info = await response.json()
      setConnectionStatus("success")
      setModelInfo(info)
      setServerUrl(tempUrl)
    } catch (error) {
      console.error("Error connecting to server:", error)
      setConnectionStatus("failed")
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flask Server Configuration</CardTitle>
        <CardDescription>Connect to your Flask server with the trained respiratory model</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="server-url">Server URL</Label>
            <Input
              id="server-url"
              placeholder="http://localhost:5000"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
            />
          </div>

          {connectionStatus === "success" && modelInfo && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium">Connected Successfully</span>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Model:</span> {modelInfo.model_name}
                </p>
                <p>
                  <span className="font-medium">Version:</span> {modelInfo.model_version}
                </p>
                <p>
                  <span className="font-medium">Accuracy:</span> {modelInfo.accuracy}%
                </p>
              </div>
            </div>
          )}

          {connectionStatus === "failed" && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium">Connection Failed</span>
              </div>
              <p className="text-sm mt-1">
                Could not connect to the server. Please check the URL and ensure the server is running.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={isTesting || !tempUrl} className="w-full">
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
