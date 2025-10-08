import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Target, Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ScoredLead {
  id: string;
  name: string;
  email: string;
  company: string;
  score: number;
  conversionProbability: number;
  reasoning: string;
  recommendations: string[];
  priority: 'hot' | 'warm' | 'cold';
}

export const LeadScoringAI = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Map to ScoredLead format with default scores
      const scoredLeads = data.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company || 'N/A',
        score: lead.lead_score || 0,
        conversionProbability: 0,
        reasoning: '',
        recommendations: [],
        priority: 'cold' as const
      }));

      setLeads(scoredLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error loading leads",
        description: "Failed to load leads from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeLeads = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('score-leads', {
        body: { leads }
      });

      if (error) throw error;

      setLeads(data.scoredLeads);
      
      // Update lead scores in database
      for (const lead of data.scoredLeads) {
        await supabase
          .from('marketing_leads')
          .update({ lead_score: lead.score })
          .eq('id', lead.id);
      }

      toast({
        title: "Analysis complete!",
        description: `Scored ${data.scoredLeads.length} leads`,
      });
    } catch (error) {
      console.error('Error analyzing leads:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to score leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'hot': return 'destructive';
      case 'warm': return 'default';
      case 'cold': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          AI Lead Scoring
        </CardTitle>
        <CardDescription>Predict conversion likelihood and prioritize leads with AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadLeads} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Leads
          </Button>
          <Button onClick={analyzeLeads} disabled={analyzing || leads.length === 0}>
            {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
            Analyze & Score
          </Button>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No leads found. Create some leads to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="border-2">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{lead.name}</h4>
                        <Badge variant={getPriorityBadge(lead.priority)}>
                          {lead.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{lead.score}</div>
                      <div className="text-xs text-muted-foreground">Lead Score</div>
                    </div>
                  </div>

                  {lead.conversionProbability > 0 && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Conversion Probability</span>
                          <span className="font-semibold">{lead.conversionProbability}%</span>
                        </div>
                        <Progress value={lead.conversionProbability} className={getPriorityColor(lead.priority)} />
                      </div>

                      {lead.reasoning && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">AI Analysis:</p>
                          <p className="text-sm text-muted-foreground">{lead.reasoning}</p>
                        </div>
                      )}

                      {lead.recommendations.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Recommendations:</p>
                          <ul className="text-sm space-y-1">
                            {lead.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
