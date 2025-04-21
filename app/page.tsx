"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, TreesIcon as Lungs, AlertCircle } from "lucide-react"
import { AnalysisResult } from "@/components/analysis-result"
import { ServerConfig } from "@/components/server-config"

// Define the type for formData
interface FormData {
  Age: string
  SpO2: string
  "Heart Rate (BPM)": string
  "Blood Pressure (Systolic)": string
  Symptoms: string
}

export default function Home() {
  const [serverUrl, setServerUrl] = useState("http://localhost:5000")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    Age: "",
    SpO2: "",
    "Heart Rate (BPM)": "",
    "Blood Pressure (Systolic)": "",
    Symptoms: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name as keyof FormData]: value }))
    setError(null) // Clear error on input change
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setError(null)

    // Validate inputs
    const numericFields = ["Age", "SpO2", "Heart Rate (BPM)", "Blood Pressure (Systolic)"]
    for (const field of numericFields) {
      if (!formData[field as keyof FormData] || isNaN(Number(formData[field as keyof FormData]))) {
        setError(`Please enter a valid number for ${field}`)
        setIsAnalyzing(false)
        return
      }
    }
    if (!formData.Symptoms.trim()) {
      setError("Please enter symptoms (comma-separated)")
      setIsAnalyzing(false)
      return
    }

    try {
      const requestBody = {
        Age: Number(formData.Age),
        SpO2: Number(formData.SpO2),
        "Heart Rate (BPM)": Number(formData["Heart Rate (BPM)"]),
        "Blood Pressure (Systolic)": Number(formData["Blood Pressure (Systolic)"]),
        Symptoms: formData.Symptoms
      }
      console.log("Request body:", requestBody)

      const response = await fetch(`${serverUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      let result
      try {
        result = await response.json()
      } catch (e) {
        throw new Error("Failed to parse server response")
      }

      if (!response.ok) {
        const errorMessage = result.error || `Server returned ${response.status}: ${response.statusText}`
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: result.error
        })
        throw new Error(errorMessage)
      }

      setAnalysisResult(result)
    } catch (error: any) {
      console.error("Error analyzing data:", error)
      setError(error.message || "Failed to analyze data. Please check your server connection.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setFormData({
      Age: "",
      SpO2: "",
      "Heart Rate (BPM)": "",
      "Blood Pressure (Systolic)": "",
      Symptoms: ""
    })
    setAnalysisResult(null)
    setError(null)
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-center mb-8">
        <Lungs className="h-10 w-10 text-blue-500 mr-2" />
        <h1 className="text-3xl font-bold">AI Respiratory Assistant</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ServerConfig serverUrl={serverUrl} setServerUrl={setServerUrl} />
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Enter Respiratory Health Data</CardTitle>
              <CardDescription>
                Provide your age, vital signs, and symptoms for AI-powered respiratory health analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="Age">Age</Label>
                  <Input
                    id="Age"
                    name="Age"
                    type="number"
                    value={formData.Age}
                    onChange={handleInputChange}
                    placeholder="e.g., 45"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="SpO2">SpO2 (%)</Label>
                  <Input
                    id="SpO2"
                    name="SpO2"
                    type="number"
                    value={formData.SpO2}
                    onChange={handleInputChange}
                    placeholder="e.g., 95"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="Heart Rate (BPM)">Heart Rate (BPM)</Label>
                  <Input
                    id="Heart Rate (BPM)"
                    name="Heart Rate (BPM)"
                    type="number"
                    value={formData["Heart Rate (BPM)"]}
                    onChange={handleInputChange}
                    placeholder="e.g., 80"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="Blood Pressure (Systolic)">Blood Pressure (Systolic, mmHg)</Label>
                  <Input
                    id="Blood Pressure (Systolic)"
                    name="Blood Pressure (Systolic)"
                    type="number"
                    value={formData["Blood Pressure (Systolic)"]}
                    onChange={handleInputChange}
                    placeholder="e.g., 120"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="Symptoms">Symptoms</Label>
                  <Input
                    id="Symptoms"
                    name="Symptoms"
                    type="text"
                    value={formData.Symptoms}
                    onChange={handleInputChange}
                    placeholder="e.g., Fever, Cough, Shortness of breath"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Data"
                )}
              </Button>
            </CardFooter>
          </Card>

          {analysisResult && (
            <div className="mt-6">
              <AnalysisResult result={analysisResult} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}