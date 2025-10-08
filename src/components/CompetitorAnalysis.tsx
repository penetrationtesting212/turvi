import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Target, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompetitorData {
  contentTypes: string[];
  postingFrequency: string;
  topPerformingTopics: string[];
  averageEngagement: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  contentGaps: string[];
  recommendations: string[];
}

const CompetitorAnalysis = () => {
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorData | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!competitorUrl.trim() || !industry.trim()) {
      toast({
        title: "Error",
        description: "Please enter both competitor URL and industry",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('competitor-analysis', {
        body: { competitorUrl, industry }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Success",
        description: "Competitor analysis completed successfully!",
      });
    } catch (error) {
      console.error('Error analyzing competitor:', error);
      toast({
        title: "Error",
        description: "Failed to analyze competitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Competitor Analysis
        </CardTitle>
        <CardDescription>Analyze competitor content strategies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="competitor-url">Competitor Website/URL</Label>
          <Input
            id="competitor-url"
            placeholder="e.g., competitor.com or @competitorhandle"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            placeholder="e.g., Healthcare, Marketing"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Analyze Competitor
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Content Overview</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Content Types</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.contentTypes.map((type, index) => (
                      <Badge key={index} variant="secondary">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Posting Frequency</Label>
                  <p className="mt-1">{result.postingFrequency}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Average Engagement</Label>
                  <p className="mt-1">{result.averageEngagement}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.topPerformingTopics.map((topic, index) => (
                  <Badge key={index} variant="outline">{topic}</Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="text-sm">• {strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm">• {weakness}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Opportunities & Content Gaps
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Opportunities</Label>
                  <ul className="mt-2 space-y-1">
                    {result.opportunities.map((opp, index) => (
                      <li key={index} className="text-sm">✓ {opp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Content Gaps to Fill</Label>
                  <ul className="mt-2 space-y-1">
                    {result.contentGaps.map((gap, index) => (
                      <li key={index} className="text-sm">→ {gap}</li>
                    ))}
                  </ul>
                </div>
              </div>
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

export default CompetitorAnalysis;
