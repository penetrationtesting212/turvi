import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Award, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScoreData {
  overallScore: number;
  readability: number;
  seoOptimization: number;
  engagement: number;
  grammar: number;
  structure: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  grade: string;
}

const ContentScoring = () => {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreData | null>(null);
  const { toast } = useToast();

  const handleScore = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to score",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-scoring', {
        body: { content, contentType }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Success",
        description: "Content scored successfully!",
      });
    } catch (error) {
      console.error('Error scoring content:', error);
      toast({
        title: "Error",
        description: "Failed to score content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Content Scoring
        </CardTitle>
        <CardDescription>Rate content quality before publishing (0-100)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blog">Blog Post</SelectItem>
              <SelectItem value="social">Social Media Post</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="landing">Landing Page</SelectItem>
              <SelectItem value="ad">Advertisement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content to Score</Label>
          <Textarea
            id="content"
            placeholder="Paste your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <Button onClick={handleScore} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scoring...
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Score Content
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                    <p className="text-4xl font-bold">{result.overallScore}</p>
                  </div>
                  <div className={`text-6xl font-bold ${getGradeColor(result.grade)}`}>
                    {result.grade}
                  </div>
                </div>
                <Progress value={result.overallScore} className="h-3" />
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Readability</Label>
                  <span className="text-sm font-semibold">{result.readability}%</span>
                </div>
                <Progress value={result.readability} className={`h-2 ${getScoreColor(result.readability)}`} />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">SEO Optimization</Label>
                  <span className="text-sm font-semibold">{result.seoOptimization}%</span>
                </div>
                <Progress value={result.seoOptimization} className={`h-2 ${getScoreColor(result.seoOptimization)}`} />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Engagement</Label>
                  <span className="text-sm font-semibold">{result.engagement}%</span>
                </div>
                <Progress value={result.engagement} className={`h-2 ${getScoreColor(result.engagement)}`} />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Grammar</Label>
                  <span className="text-sm font-semibold">{result.grammar}%</span>
                </div>
                <Progress value={result.grammar} className={`h-2 ${getScoreColor(result.grammar)}`} />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Structure</Label>
                  <span className="text-sm font-semibold">{result.structure}%</span>
                </div>
                <Progress value={result.structure} className={`h-2 ${getScoreColor(result.structure)}`} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="text-sm">✓ {strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm">• {improvement}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">💡 {rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentScoring;
