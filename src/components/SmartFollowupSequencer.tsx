import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2, Copy, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FollowUpEmail {
  day: number;
  subject: string;
  body: string;
  purpose: string;
}

interface FollowUpSequence {
  sequenceName: string;
  totalDays: number;
  emails: FollowUpEmail[];
  bestPractices: string[];
}

export const SmartFollowupSequencer = () => {
  const { toast } = useToast();
  const [leadStage, setLeadStage] = useState('new');
  const [leadBehavior, setLeadBehavior] = useState('no_response');
  const [industry, setIndustry] = useState('');
  const [sequence, setSequence] = useState<FollowUpSequence | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-followup-sequence', {
        body: { leadStage, leadBehavior, industry }
      });

      if (error) throw error;

      setSequence(data.sequence);
      toast({
        title: "Sequence generated!",
        description: `Created ${data.sequence.emails.length} personalized follow-up emails`,
      });
    } catch (error) {
      console.error('Error generating sequence:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate follow-up sequence. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = (email: FollowUpEmail) => {
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Email copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Smart Follow-up Sequencer
        </CardTitle>
        <CardDescription>AI creates personalized follow-up sequences based on lead behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Lead Stage</label>
            <Select value={leadStage} onValueChange={setLeadStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Lead</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="negotiation">In Negotiation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Lead Behavior</label>
            <Select value={leadBehavior} onValueChange={setLeadBehavior}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_response">No Response</SelectItem>
                <SelectItem value="opened_email">Opened Email</SelectItem>
                <SelectItem value="clicked_link">Clicked Link</SelectItem>
                <SelectItem value="visited_website">Visited Website</SelectItem>
                <SelectItem value="downloaded_resource">Downloaded Resource</SelectItem>
                <SelectItem value="asked_question">Asked Question</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Industry (Optional)</label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Sequence...
            </>
          ) : (
            'Generate Follow-up Sequence'
          )}
        </Button>

        {sequence && (
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{sequence.sequenceName}</h3>
                <p className="text-sm text-muted-foreground">
                  {sequence.totalDays} day sequence • {sequence.emails.length} emails
                </p>
              </div>
              <Badge variant="secondary">
                <Calendar className="w-3 h-3 mr-1" />
                {sequence.totalDays} days
              </Badge>
            </div>

            {sequence.bestPractices.length > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium text-sm mb-2">Best Practices:</p>
                <ul className="text-sm space-y-1">
                  {sequence.bestPractices.map((practice, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {sequence.emails.map((email, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Day {email.day}</Badge>
                          <span className="text-sm text-muted-foreground">{email.purpose}</span>
                        </div>
                        <h4 className="font-semibold">{email.subject}</h4>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyEmail(email)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                      {email.body}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
