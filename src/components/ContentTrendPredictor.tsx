import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Trend {
  topic: string;
  trendScore: number;
  predictedPeakDate: string;
  reasoning: string;
  keywords: string[];
  contentSuggestions: string[];
}

export const ContentTrendPredictor = () => {
  const { toast } = useToast();
  const [industry, setIndustry] = useState('');
  const [niche, setNiche] = useState('');
  const [timeframe, setTimeframe] = useState('7');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!industry.trim()) {
      toast({
        title: "Industry required",
        description: "Please enter your industry or niche",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-content-trends', {
        body: { industry, niche, timeframe }
      });

      if (error) throw error;

      setTrends(data.trends);
      toast({
        title: "Trends predicted!",
        description: `Found ${data.trends.length} emerging trends`,
      });
    } catch (error) {
      console.error('Error predicting trends:', error);
      toast({
        title: "Prediction failed",
        description: "Failed to predict trends. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Content Trend Predictor
        </CardTitle>
        <CardDescription>Predict trending topics before they peak using AI + web search</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry/Topic</label>
            <Input
              placeholder="e.g., Digital Marketing, Fashion, Tech"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Niche (Optional)</label>
            <Input
              placeholder="e.g., Email Marketing, Sustainable Fashion"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Prediction Timeframe</label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="14">Next 2 weeks</SelectItem>
              <SelectItem value="30">Next month</SelectItem>
              <SelectItem value="90">Next quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handlePredict} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Trends...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Predict Trends
            </>
          )}
        </Button>

        {trends.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold">Predicted Trends</h3>
            {trends.map((trend, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{trend.topic}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{trend.reasoning}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="whitespace-nowrap">
                        Peak: {trend.predictedPeakDate}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Trend Score:</span>
                        <div className={`w-12 h-2 rounded-full ${getTrendColor(trend.trendScore)}`} />
                        <span className="text-xs font-semibold">{trend.trendScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Content Suggestions:</p>
                    <ul className="text-sm space-y-1">
                      {trend.contentSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
