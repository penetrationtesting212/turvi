import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, TrendingUp, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeywordData {
  keywords: Array<{
    keyword: string;
    searchVolume: string;
    difficulty: string;
    trend: string;
    cpc: string;
    intent: string;
  }>;
  longTailKeywords: string[];
  relatedTopics: string[];
  seasonalTrends: string;
}

const KeywordResearchTool = () => {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KeywordData | null>(null);
  const { toast } = useToast();

  const handleResearch = async () => {
    if (!niche.trim()) {
      toast({
        title: "Error",
        description: "Please enter a niche to research",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('keyword-research', {
        body: { niche, location }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Success",
        description: "Keyword research completed successfully!",
      });
    } catch (error) {
      console.error('Error researching keywords:', error);
      toast({
        title: "Error",
        description: "Failed to research keywords. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend.toLowerCase() === 'rising' ? '📈' : trend.toLowerCase() === 'declining' ? '📉' : '➡️';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Keyword Research Tool
        </CardTitle>
        <CardDescription>Find trending keywords in your niche</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Niche/Topic</Label>
          <Input
            id="niche"
            placeholder="e.g., Healthcare Marketing, Digital Marketing"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="e.g., India, United States"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <Button onClick={handleResearch} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Research Keywords
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Keywords
              </h3>
              <div className="space-y-3">
                {result.keywords.map((kw, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{kw.keyword}</span>
                            <span className="text-xl">{getTrendIcon(kw.trend)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(kw.keyword)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Vol: {kw.searchVolume}</Badge>
                            <Badge className={getDifficultyColor(kw.difficulty)}>
                              {kw.difficulty}
                            </Badge>
                            <Badge variant="secondary">{kw.intent}</Badge>
                            <Badge variant="outline">CPC: {kw.cpc}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Long-tail Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.longTailKeywords.map((kw, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleCopy(kw)}>
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {result.relatedTopics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Seasonal Trends</h3>
              <p className="text-muted-foreground">{result.seasonalTrends}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordResearchTool;
