import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import MarketingLeadsManager from "@/components/MarketingLeadsManager";
import { LeadScoringAI } from "@/components/LeadScoringAI";
import { SmartFollowupSequencer } from "@/components/SmartFollowupSequencer";

const LeadGeneration = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Lead Generation</h1>
              <p className="text-muted-foreground">
                Capture and manage digital marketing leads
              </p>
            </div>
          </div>
        </div>

        <LeadScoringAI />
        <SmartFollowupSequencer />
        
        <Card>
          <CardHeader>
            <CardTitle>Marketing Leads</CardTitle>
            <CardDescription>
              Track and manage all your digital marketing leads from various sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarketingLeadsManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadGeneration;
