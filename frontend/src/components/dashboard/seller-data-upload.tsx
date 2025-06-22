import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api.service';
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
  Users,
  Shield,
  Target,
  TrendingUp
} from 'lucide-react';

interface SellerData {
  sellerId: string;
  sellerName: string;
  email?: string;
  businessType?: string;
  reviews?: Array<{
    reviewText: string;
    rating: number;
    reviewerId: string;
    productId: string;
    productName: string;
    reviewDate: string;
    ipAddress: string;
    verifiedPurchase: boolean;
  }>;
}

interface UploadResult {
  totalSellers: number;
  processedSellers: number;
  sellersWithRiskAssessment: number;
  averageRiskScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  results: Array<{
    sellerId: string;
    sellerName: string;
    riskAssessment?: {
      riskScore: number;
      riskLevel: string;
      totalReviews: number;
      fakeReviews: number;
      fakeReviewPercentage: number;
    };
    error?: string;
  }>;
}

export function SellerDataUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResult | null>(null);
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

      // Upload and process seller data
      const result = await apiService.uploadSellerData(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setResults(result);
      setIsSubmitted(true);

      toast({
        title: "Seller Data Processing Complete",
        description: `Successfully analyzed ${result.processedSellers} sellers`,
      });

      // Trigger a refresh of the seller management dashboard
      window.dispatchEvent(new CustomEvent('sellerDataUploaded'));

    } catch (error) {
      console.error('Error uploading seller data:', error);
      toast({
        title: "Error",
        description: "Failed to process seller data. Please check the file format and try again.",
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
      ['Seller ID', 'Seller Name', 'Risk Score', 'Risk Level', 'Total Reviews', 'Fake Reviews', 'Fake Review %', 'Error'],
      ...results.results.map(result => [
        result.sellerId,
        result.sellerName,
        result.riskAssessment?.riskScore || 'N/A',
        result.riskAssessment?.riskLevel || 'N/A',
        result.riskAssessment?.totalReviews || 'N/A',
        result.riskAssessment?.fakeReviews || 'N/A',
        result.riskAssessment?.fakeReviewPercentage || 'N/A',
        result.error || ''
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller-risk-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Seller Data</h2>
        <p className="text-muted-foreground">
          Upload seller data with their reviews for comprehensive risk analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Seller Data File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Seller Data File (CSV or JSON)</Label>
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
                      <p className="text-sm text-gray-600">
                        Drag and drop your file here, or click to browse
                      </p>
                      <Input
                        type="file"
                        accept=".csv,.json,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                        id="seller-data-file"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('seller-data-file')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {file && (
                <div className="space-y-2">
                  <Label>File Format</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>CSV Format:</strong></p>
                    <p>sellerId,sellerName,email,businessType,reviewText,rating,reviewerId,productId,productName,reviewDate,ipAddress,verifiedPurchase</p>
                    <p><strong>JSON Format:</strong></p>
                    <p>[{'{'}"sellerId": "seller1", "sellerName": "Test Seller", "reviews": [...]{'}'}]</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Seller Data
                  </>
                )}
              </Button>

              {isUploading && (
                <div className="space-y-2">
                  <Label>Processing Progress</Label>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing seller data and calculating risk scores...
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload a file to see analysis results</p>
              </div>
            ) : results ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.totalSellers}</div>
                    <div className="text-sm text-blue-600">Total Sellers</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.processedSellers}</div>
                    <div className="text-sm text-green-600">Processed</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.averageRiskScore.toFixed(1)}</div>
                  <div className="text-sm text-purple-600">Average Risk Score</div>
                </div>

                {/* Risk Distribution */}
                <div className="space-y-2">
                  <Label>Risk Distribution</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">Low Risk</span>
                      <Badge className="bg-green-100 text-green-800">{results.riskDistribution.low}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">Medium Risk</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{results.riskDistribution.medium}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="text-sm">High Risk</span>
                      <Badge className="bg-orange-100 text-orange-800">{results.riskDistribution.high}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm">Critical Risk</span>
                      <Badge className="bg-red-100 text-red-800">{results.riskDistribution.critical}</Badge>
                    </div>
                  </div>
                </div>

                {/* Export Button */}
                <Button onClick={exportResults} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>

                {/* Success Message */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully analyzed {results.processedSellers} sellers. 
                    {results.sellersWithRiskAssessment} sellers now have risk assessments.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Failed to process seller data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sample Data Format */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Data Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">CSV Format Example:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                sellerId,sellerName,email,businessType,reviewText,rating,reviewerId,productId,productName,reviewDate,ipAddress,verifiedPurchase<br/>
                seller001,Electronics Store,store@example.com,business,Great product! Highly recommend.,5,user123,prod456,Smartphone,2024-01-15,192.168.1.1,true<br/>
                seller001,Electronics Store,store@example.com,business,AMAZING!!! BEST EVER!!! BUY NOW!!!,5,user456,prod456,Smartphone,2024-01-15,192.168.1.2,false
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">JSON Format Example:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                [<br/>
                &nbsp;&nbsp;{'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;"sellerId": "seller001",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;"sellerName": "Electronics Store",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;"email": "store@example.com",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;"businessType": "business",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;"reviews": [<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"reviewText": "Great product! Highly recommend.",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"rating": 5,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"reviewerId": "user123",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"productId": "prod456",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"productName": "Smartphone",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"reviewDate": "2024-01-15",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"ipAddress": "192.168.1.1",<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"verifiedPurchase": true<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;]<br/>
                &nbsp;&nbsp;{'}'}<br/>
                ]
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 