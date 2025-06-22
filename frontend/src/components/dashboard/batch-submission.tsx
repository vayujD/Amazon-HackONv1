import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, Download, Loader2, CheckCircle, AlertTriangle, FileText, BarChart3 } from "lucide-react";
import { apiService } from "@/services/api.service";

interface ReviewData {
  reviewText: string;
  rating: number;
  reviewerId: string;
  productId: string;
  productName: string;
  reviewDate: string;
  ipAddress: string;
  verifiedPurchase: boolean;
}

interface BatchResult {
  reviewId: string | null;
  predictions: any;
  error?: string;
}

export function BatchSubmission() {
  const [reviews, setReviews] = useState<ReviewData[]>([
    {
      reviewText: "",
      rating: 5,
      reviewerId: "",
      productId: "",
      productName: "",
      reviewDate: new Date().toISOString().split('T')[0],
      ipAddress: "192.168.1.1",
      verifiedPurchase: false,
    }
  ]);

  const [results, setResults] = useState<BatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const addReview = () => {
    setReviews(prev => [...prev, {
      reviewText: "",
      rating: 5,
      reviewerId: "",
      productId: "",
      productName: "",
      reviewDate: new Date().toISOString().split('T')[0],
      ipAddress: "192.168.1.1",
      verifiedPurchase: false,
    }]);
  };

  const removeReview = (index: number) => {
    if (reviews.length > 1) {
      setReviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateReview = (index: number, field: keyof ReviewData, value: any) => {
    setReviews(prev => prev.map((review, i) => 
      i === index ? { ...review, [field]: value } : review
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setIsSubmitted(false);

    // Filter out empty reviews
    const validReviews = reviews.filter(review => review.reviewText.trim() !== "");

    if (validReviews.length === 0) {
      toast({
        title: "No Reviews to Submit",
        description: "Please add at least one review with text content.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Submit to backend API using authenticated service
      const result = await apiService.processBatchReviews(validReviews);
      
      setResults(result.results);
      setIsSubmitted(true);

      toast({
        title: "Batch Analysis Complete",
        description: `Analyzed ${validReviews.length} reviews successfully`,
      });

      // Trigger a refresh of the analytics dashboard
      window.dispatchEvent(new CustomEvent('reviewSubmitted'));

    } catch (error) {
      console.error('Error submitting batch reviews:', error);
      toast({
        title: "Error",
        description: "Failed to analyze reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (results.length === 0) return;

    const csvData = [
      ['Review ID', 'Is Fake', 'Confidence', 'Risk Score', 'Sentiment', 'Authenticity', 'Error'],
      ...results.map(result => [
        result.reviewId || 'N/A',
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
    a.download = `batch-analysis-results-${new Date().toISOString().split('T')[0]}.csv`;
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
        <h2 className="text-2xl font-bold">Batch Review Analysis</h2>
        <p className="text-muted-foreground">
          Submit multiple reviews for batch analysis using our ML-powered detection system
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Review Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Review {index + 1}</h4>
                    {reviews.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeReview(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Review Text *</Label>
                    <Textarea
                      placeholder="Enter review text..."
                      value={review.reviewText}
                      onChange={(e) => updateReview(index, 'reviewText', e.target.value)}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Select
                        value={review.rating.toString()}
                        onValueChange={(value) => updateReview(index, 'rating', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} Star{rating !== 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reviewer ID</Label>
                      <Input
                        placeholder="user123"
                        value={review.reviewerId}
                        onChange={(e) => updateReview(index, 'reviewerId', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product ID</Label>
                      <Input
                        placeholder="prod456"
                        value={review.productId}
                        onChange={(e) => updateReview(index, 'productId', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        placeholder="Product Name"
                        value={review.productName}
                        onChange={(e) => updateReview(index, 'productName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={review.verifiedPurchase}
                      onCheckedChange={(checked) => updateReview(index, 'verifiedPurchase', checked)}
                    />
                    <Label>Verified Purchase</Label>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addReview}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Review
              </Button>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing {reviews.length} Reviews...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Analyze Batch
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            {isSubmitted && results.length > 0 && (
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!isSubmitted && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Submit reviews to see batch analysis results</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                <p>Analyzing {reviews.length} reviews with ML models...</p>
              </div>
            )}

            {isSubmitted && results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Results Summary</span>
                  <Badge variant="outline">
                    {results.filter(r => r.reviewId).length} / {results.length} Successful
                  </Badge>
                </div>

                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Review {index + 1}</span>
                        {result.error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : result.predictions?.isFake ? (
                          <Badge variant="destructive">Suspicious</Badge>
                        ) : (
                          <Badge variant="default">Legitimate</Badge>
                        )}
                      </div>

                      {result.error ? (
                        <p className="text-sm text-red-600">{result.error}</p>
                      ) : result.predictions ? (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-1 font-medium">
                              {(result.predictions.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk:</span>
                            <Badge className={`ml-1 ${getRiskLevel(result.predictions.riskScore).color}`}>
                              {result.predictions.riskScore.toFixed(1)}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Sentiment:</span>
                            <span className="ml-1 font-medium capitalize">
                              {result.predictions.sentiment}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Authenticity:</span>
                            <span className="ml-1 font-medium">
                              {result.predictions.reviewAuthenticity.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No prediction data available</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 