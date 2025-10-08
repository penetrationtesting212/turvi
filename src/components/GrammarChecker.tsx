import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GrammarIssue {
  type: string;
  original: string;
  suggestion: string;
  explanation: string;
}

interface GrammarResult {
  correctedContent: string;
  issues: GrammarIssue[];
  score: number;
  summary: string;
}

const GrammarChecker = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);

  const handleCheck = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content to check",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-grammar', {
        body: { content }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);

      toast({
        title: "Grammar check complete!",
        description: `Found ${data.issues.length} suggestion(s)`,
      });
    } catch (error: any) {
      console.error("Error checking grammar:", error);
      toast({
        title: "Check failed",
        description: error.message || "Failed to check grammar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.correctedContent);
      toast({
        title: "Copied!",
        description: "Corrected content copied to clipboard",
      });
    }
  };

  const getIssueIcon = (type: string) => {
    return type === "grammar" || type === "spelling" ? "🔴" : "🟡";
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Grammar & Style Checker</CardTitle>
            <CardDescription>Real-time corrections with suggestions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Paste your content here for grammar and style checking..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        <Button 
          onClick={handleCheck} 
          disabled={loading}
          className="bg-gradient-primary w-full"
        >
          {loading ? "Checking..." : "Check Grammar & Style"}
        </Button>

        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Quality Score</span>
              </div>
              <Badge variant={result.score >= 80 ? "default" : "secondary"} className="text-lg">
                {result.score}/100
              </Badge>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{result.summary}</p>
            </div>

            {result.issues.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <Label>Issues Found ({result.issues.length})</Label>
                </div>
                {result.issues.map((issue, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getIssueIcon(issue.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm line-through text-muted-foreground">{issue.original}</p>
                            <p className="text-sm font-medium text-primary">{issue.suggestion}</p>
                            <p className="text-xs text-muted-foreground">{issue.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Corrected Content</Label>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={result.correctedContent}
                readOnly
                className="min-h-[200px]"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrammarChecker;
