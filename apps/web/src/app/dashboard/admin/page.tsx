'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckProgressModal } from '@/components/urls/CheckProgressModal';
import { Zap, Sparkles, Shield, Plus, Trash2, Globe, Play, Save } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  pricing: string;
  description: string;
  features: string;
  ctaText: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [competitors, setCompetitors] = React.useState<Competitor[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>('competitor-alpha');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [newFeatureText, setNewFeatureText] = React.useState('');
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [progressOpen, setProgressOpen] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [pricing, setPricing] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [ctaText, setCtaText] = React.useState('');
  const [featuresList, setFeaturesList] = React.useState<string[]>([]);

  const fetchCompetitors = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/competitors');
      const json = await res.json();
      if (json.data) {
        setCompetitors(json.data);
        // Load selected
        const current = json.data.find((c: Competitor) => c.id === selectedId) || json.data[0];
        if (current) {
          setName(current.name);
          setPricing(current.pricing);
          setDescription(current.description);
          setCtaText(current.ctaText);
          setFeaturesList(current.features.split('\n').filter(Boolean));
        }
      }
    } catch (err) {
      console.error('Error fetching competitors:', err);
      toast({
        title: 'Error',
        description: 'Failed to load competitor data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedId, toast]);

  React.useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const handleSelectCompetitor = (id: string) => {
    setSelectedId(id);
    const current = competitors.find((c) => c.id === id);
    if (current) {
      setName(current.name);
      setPricing(current.pricing);
      setDescription(current.description);
      setCtaText(current.ctaText);
      setFeaturesList(current.features.split('\n').filter(Boolean));
    }
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    setFeaturesList([...featuresList, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const handleSave = async (triggerCheck: boolean = false) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedId,
          name,
          pricing,
          description,
          features: featuresList.join('\n'),
          ctaText,
          triggerCheck,
        }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        toast({
          title: 'Success',
          description: triggerCheck ? 'Page updated and check queued!' : 'Competitor demo page updated successfully.',
        });

        // Update local list
        setCompetitors((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, name, pricing, description, ctaText, features: featuresList.join('\n') } : c))
        );

        if (triggerCheck && json.jobId) {
          setJobId(json.jobId);
          setProgressOpen(true);
        }
      } else {
        toast({
          title: 'Error',
          description: json.error || 'Failed to update page.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Network error occurred.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <span className="animate-pulse text-muted-foreground">Loading Admin Testing Tool...</span>
      </div>
    );
  }

  const selectedCompetitor = competitors.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        heading="Competitor Mock & Testing Tool"
        text="Customize internal competitor pages and trigger scraper checks to test change alerts end-to-end."
      />

      {/* Select Competitor Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.map((comp) => {
          const isSelected = comp.id === selectedId;
          const isAlpha = comp.id === 'competitor-alpha';
          const isBeta = comp.id === 'competitor-beta';

          return (
            <Card
              key={comp.id}
              onClick={() => handleSelectCompetitor(comp.id)}
              className={`cursor-pointer transition-all border ${
                isSelected
                  ? isAlpha
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                    : isBeta
                    ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                    : 'border-rose-500 ring-2 ring-rose-500/10'
                  : 'hover:border-border/80'
              } glass`}
            >
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-2.5">
                  {isAlpha && <Zap className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-muted-foreground'}`} />}
                  {isBeta && <Sparkles className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-muted-foreground'}`} />}
                  {!isAlpha && !isBeta && (
                    <Shield className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-muted-foreground'}`} />
                  )}
                  <CardTitle className="text-base font-bold">{comp.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {comp.id}
                </Badge>
              </CardHeader>
              <CardContent className="pb-3 text-xs text-muted-foreground line-clamp-2">
                {comp.description}
              </CardContent>
              <CardFooter className="flex justify-between items-center text-xs border-t pt-3">
                <span className="font-mono font-medium text-foreground">{comp.pricing}</span>
                <a
                  href={`/demo/${comp.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-3.5 h-3.5" />
                  View Page
                </a>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Editor & Scraper Config Panel */}
      {selectedCompetitor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Edit {selectedCompetitor.name} Content</CardTitle>
                <CardDescription>Update values below. Saving will update the mock landing page instantly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Competitor Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pricing">Plan Pricing</Label>
                    <Input id="pricing" value={pricing} onChange={(e) => setPricing(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cta">CTA Button Text</Label>
                  <Input id="cta" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-4">
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Content Only
                </Button>
                <Button
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Save & Trigger Monitor Check
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Features Manager */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Manage Features</CardTitle>
                <CardDescription>Add or remove features list items shown on the competitor page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Feature List */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {featuresList.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No features listed. Add one below.</p>
                  ) : (
                    featuresList.map((feat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 rounded-lg border bg-background/50 hover:bg-background/80 text-sm group"
                      >
                        <span className="line-clamp-1 pr-2">{feat}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Feature Form */}
                <form onSubmit={handleAddFeature} className="flex gap-2 pt-2 border-t">
                  <Input
                    placeholder="New feature name..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" className="shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Progress Dialog for Triggered Scrapes */}
      {jobId && (
        <CheckProgressModal
          jobId={jobId}
          open={progressOpen}
          onOpenChange={setProgressOpen}
          onComplete={() => {
            toast({
              title: 'Success!',
              description: 'Scraper check completed. Any detected changes are now generated as alerts/reports.',
            });
          }}
        />
      )}
    </div>
  );
}
