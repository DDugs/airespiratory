import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AnalysisResultProps {
  result: {
    predictions: {
      "What type of disease": string
      "Which doctor to consult": string
      "What medicines we have to take": string
      "What foods we have to take": string
      "What foods we have to avoid": string
      "What treatment we have to undergo": string
    }
    confidences: {
      "What type of disease": number
      "Which doctor to consult": number
      "What medicines we have to take": number
      "What foods we have to take": number
      "What foods we have to avoid": number
      "What treatment we have to undergo": number
    }
    status: string
  }
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const getSeverityColor = (disease: string) => {
    // Basic severity mapping based on disease (customize as needed)
    const highSeverityDiseases = ["Pneumonia", "COPD"]
    const mediumSeverityDiseases = ["Asthma", "Bronchitis"]
    
    if (highSeverityDiseases.includes(disease)) return "text-red-500"
    if (mediumSeverityDiseases.includes(disease)) return "text-amber-500"
    return "text-green-500" // Normal or less severe conditions
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500"
    if (confidence >= 70) return "bg-blue-500"
    if (confidence >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  // Extract recommendations from predictions
  const recommendations = [
    `Consult: ${result.predictions["Which doctor to consult"]}`,
    `Medicines: ${result.predictions["What medicines we have to take"]}`,
    `Diet - Include: ${result.predictions["What foods we have to take"]}`,
    `Diet - Avoid: ${result.predictions["What foods we have to avoid"]}`,
    `Treatment: ${result.predictions["What treatment we have to undergo"]}`
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>AI-powered analysis of your respiratory health data</CardDescription>
          </div>
          <Badge variant={result.predictions["What type of disease"] === "Normal" ? "outline" : "destructive"}>
            {result.predictions["What type of disease"]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Prediction Details:</h4>
          {Object.entries(result.predictions).map(([key, value]) => (
            <div key={key} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{key}</span>
                <span className="text-sm font-medium">{result.confidences[key as keyof typeof result.confidences]}%</span>
              </div>
              <Progress
                value={result.confidences[key as keyof typeof result.confidences]}
                className={getConfidenceColor(result.confidences[key as keyof typeof result.confidences])}
              />
              <div className="text-sm mt-1">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Severity:</span>
          <span
            className={`font-bold capitalize ${getSeverityColor(result.predictions["What type of disease"])}`}
          >
            {result.predictions["What type of disease"] === "Normal" ? "low" : 
              ["Pneumonia", "COPD"].includes(result.predictions["What type of disease"]) ? "high" : "medium"}
          </span>
        </div>

        {recommendations.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Recommendations</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>
            Note: This analysis is provided for informational purposes only and should not replace professional medical
            advice.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}