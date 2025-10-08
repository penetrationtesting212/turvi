import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlagiarismResult {
  originalityScore: number;
  suspiciousSegments: Array<{ text: string; reason: string }>;
  overallAssessment: string;
  recommendations: string[];
}

export const PlagiarismChecker = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to check for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plagiarism-checker', {
        body: { content }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Plagiarism check completed successfully.",
      });
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      toast({
        title: "Error",
        description: "Failed to check plagiarism. Please try again.",
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
          <Shield className="h-5 w-5" />
          Plagiarism Checker
        </CardTitle>
        <CardDescription>Ensure your content is original</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your content here to check for plagiarism..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
        <Button onClick={handleCheck} disabled={loading}>
          {loading ? "Checking..." : "Check Plagiarism"}
        </Button>

        {result && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Originality Score</span>
              <Badge variant={result.originalityScore >= 80 ? "default" : "destructive"}>
                {result.originalityScore}%
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Overall Assessment</h4>
              <p className="text-sm text-muted-foreground">{result.overallAssessment}</p>
            </div>

            {result.suspiciousSegments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Suspicious Segments
                </h4>
                <div className="space-y-2">
                  {result.suspiciousSegments.map((segment, index) => (
                    <div key={index} className="bg-muted p-3 rounded-lg text-sm">
                      <p className="font-medium">{segment.text}</p>
                      <p className="text-muted-foreground mt-1">{segment.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
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
