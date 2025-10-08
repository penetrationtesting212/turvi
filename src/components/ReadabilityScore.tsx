import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReadabilityResult {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  readingLevel: string;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  improvements: string[];
}

export const ReadabilityScore = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadabilityResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to analyze readability.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('readability-score', {
        body: { content }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Readability analysis completed successfully.",
      });
    } catch (error) {
      console.error('Error analyzing readability:', error);
      toast({
        title: "Error",
        description: "Failed to analyze readability. Please try again.",
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
          <BookOpen className="h-5 w-5" />
          Readability Score
        </CardTitle>
        <CardDescription>Assess content complexity (Flesch-Kincaid)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your content here to analyze readability..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Readability"}
        </Button>

        {result && (
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Flesch Reading Ease</span>
                <Badge>{result.fleschReadingEase.toFixed(1)}</Badge>
              </div>
              <Progress value={result.fleschReadingEase} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Grade Level</p>
                <p className="text-lg font-semibold">{result.fleschKincaidGrade.toFixed(1)}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Reading Level</p>
                <p className="text-lg font-semibold">{result.readingLevel}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Avg Words/Sentence</p>
                <p className="text-lg font-semibold">{result.averageWordsPerSentence.toFixed(1)}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Avg Syllables/Word</p>
                <p className="text-lg font-semibold">{result.averageSyllablesPerWord.toFixed(2)}</p>
              </div>
            </div>

            {result.improvements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Improvements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {result.improvements.map((imp, index) => (
                    <li key={index}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
