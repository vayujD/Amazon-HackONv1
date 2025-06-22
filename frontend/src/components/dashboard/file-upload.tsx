import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api.service";
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  X,
  FileSpreadsheet,
  Zap,
  Copy,
  Bot
} from "lucide-react";

interface FileUploadResult {
  totalReviews: number;
  processedReviews: number;
  fakeReviews: number;
  averageRiskScore: number;
  sentimentDistribution: any;
  results: Array<{
    reviewId: string;
    reviewText: string;
    predictions: any;
    error?: string;
  }>;
}

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<FileUploadResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['text/csv', 'application/json', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or JSON file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setIsSubmitted(false);
      setResults(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsSubmitted(false);
    setResults(null);
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload and process file
      const result = await apiService.uploadAndProcessFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setResults(result);
      setIsSubmitted(true);

      toast({
        title: "File Processing Complete",
        description: `Successfully analyzed ${result.processedReviews} reviews`,
      });

      // Trigger a refresh of the analytics dashboard
      window.dispatchEvent(new CustomEvent('reviewSubmitted'));

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to process file. Please check the file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const exportResults = () => {
    if (!results) return;

    const csvData = [
      ['Review ID', 'Review Text', 'Is Fake', 'Confidence', 'Risk Score', 'Sentiment', 'Authenticity', 'Error'],
      ...results.results.map(result => [
        result.reviewId || 'N/A',
        `"${result.reviewText.replace(/"/g, '""')}"`,
        result.predictions?.isFake ? 'Yes' : 'No',
        result.predictions?.confidence ? (result.predictions.confidence * 100).toFixed(1) + '%' : 'N/A',
        result.predictions?.riskScore ? result.predictions.riskScore.toFixed(1) : 'N/A',
        result.predictions?.sentiment || 'N/A',
        result.predictions?.reviewAuthenticity ? result.predictions.reviewAuthenticity.toFixed(0) + '%' : 'N/A',
        result.error || ''
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 70) return { level: "High", color: "bg-red-100 text-red-800" };
    if (riskScore >= 40) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Low", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">File Upload Analysis</h2>
        <p className="text-muted-foreground">
          Upload a CSV or JSON file with multiple reviews for batch analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Review File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Review File (CSV or JSON)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {file ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="h-8 w-8 mx-auto text-blue-500" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop a file here, or click to select
                      </p>
                      <Input
                        type="file"
                        accept=".csv,.json,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button type="button" variant="outline">
                          Choose File
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>File Format:</strong> CSV should have columns: reviewText, rating, reviewerId, productId, productName, sellerId, sellerName<br />
                    <strong>JSON Format:</strong> Array of objects with the same fields
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={!file || isUploading} 
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing File...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analyze Reviews
                  </>
                )}
              </Button>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {isSubmitted && results && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.totalReviews}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.processedReviews}
                    </div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {results.fakeReviews}
                    </div>
                    <div className="text-sm text-muted-foreground">Fake Reviews</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {results.averageRiskScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Risk Score</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Sentiment Distribution</h4>
                  <div className="space-y-1">
                    {results.sentimentDistribution?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="capitalize">{item.sentiment}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={exportResults} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Results */}
      {isSubmitted && results && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        Review {index + 1} • ID: {result.reviewId}
                      </p>
                      <p className="text-sm line-clamp-2 mb-2">
                        "{result.reviewText}"
                      </p>
                      
                      {result.predictions ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Fake:</span>
                            <Badge variant={result.predictions.isFake ? "destructive" : "default"} className="ml-1">
                              {result.predictions.isFake ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Confidence:</span>
                            <span className="ml-1">
                              {(result.predictions.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Risk:</span>
                            <Badge 
                              variant={getRiskLevel(result.predictions.riskScore).color as any}
                              className="ml-1"
                            >
                              {result.predictions.riskScore.toFixed(0)}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Sentiment:</span>
                            <span className="ml-1 capitalize">
                              {result.predictions.sentiment}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Detailed Model Insights */}
                      {result.predictions && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="text-xs font-medium mb-2 text-muted-foreground">Model Insights:</h5>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {/* Burst Review */}
                            <div className="text-center p-2 border rounded bg-orange-50">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Zap className="h-3 w-3 text-orange-500" />
                                <span className="font-medium">Burst</span>
                              </div>
                              {result.predictions.burstReviewDetected ? (
                                <div className="flex items-center justify-center gap-1 text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>{(result.predictions.burstReviewConfidence * 100).toFixed(0)}%</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Clean</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Copy-Paste */}
                            <div className="text-center p-2 border rounded bg-blue-50">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Copy className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">Copy-Paste</span>
                              </div>
                              {result.predictions.copyPasteDetected ? (
                                <div className="flex items-center justify-center gap-1 text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>{(result.predictions.copyPasteConfidence * 100).toFixed(0)}%</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Original</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Bot Activity */}
                            <div className="text-center p-2 border rounded bg-purple-50">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Bot className="h-3 w-3 text-purple-500" />
                                <span className="font-medium">Bot</span>
                              </div>
                              {result.predictions.botActivityDetected ? (
                                <div className="flex items-center justify-center gap-1 text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>{(result.predictions.botActivityConfidence * 100).toFixed(0)}%</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Human</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 