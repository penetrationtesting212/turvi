import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: string;
  keywords: string[];
  summary: string;
}

const AISentimentAnalyzer = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { text }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      // Save to database
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user && data.sentiment) {
        await supabase.from("sentiment_analysis").insert({
          user_id: session.session.user.id,
          text: text,
          sentiment: data.sentiment,
          confidence: data.score || 0,
        });
      }

      toast({
        title: "Analysis complete!",
        description: "Sentiment analysis results ready and saved",
      });
    } catch (error: any) {
      console.error("Error analyzing sentiment:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze sentiment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = () => {
    if (!result) return null;
    
    switch (result.sentiment) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSentimentColor = () => {
    if (!result) return "default";
    
    switch (result.sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "negative":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Sentiment Analyzer</CardTitle>
            <CardDescription>Analyze emotions and sentiment in text</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text">Text to Analyze</Label>
          <Textarea
            id="text"
            placeholder="Paste comments, messages, or any text to analyze sentiment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="bg-gradient-primary w-full"
        >
          {loading ? "Analyzing..." : "Analyze Sentiment"}
        </Button>

        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                {getSentimentIcon()}
                <div>
                  <p className="font-medium capitalize">{result.sentiment}</p>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {result.confidence}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{(result.score * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key Indicators</Label>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, i) => (
                  <Badge key={i} variant="outline" className={getSentimentColor()}>
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/50">
                {result.summary}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISentimentAnalyzer;
