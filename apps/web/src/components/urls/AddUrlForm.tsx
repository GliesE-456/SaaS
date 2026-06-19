'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  url: z.string().url('Please enter a valid URL (include https://)'),
  label: z.string().min(1, 'Label is required'),
  competitorName: z.string().optional(),
  category: z.enum(['PRICING', 'FEATURES', 'PRODUCT', 'LANDING', 'TOS', 'BLOG', 'OTHER']),
  checkFrequency: z.enum(['DAILY', 'SIX_HOURS', 'ONE_HOUR']),
  noiseThreshold: z.number().min(0).max(10),
});

type FormData = z.infer<typeof formSchema>;

interface AddUrlFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  allowedFrequencies: string[];
}

export function AddUrlForm({ onSubmit, isLoading, onCancel, allowedFrequencies }: AddUrlFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      label: '',
      competitorName: '',
      category: 'PRICING',
      checkFrequency: 'DAILY',
      noiseThreshold: 2.0,
    },
  });

  const noiseValue = watch('noiseThreshold');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">URL to Track</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://acme.com/pricing"
          disabled={isLoading}
          {...register('url')}
        />
        {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label">Page Label</Label>
          <Input
            id="label"
            placeholder="Acme Pricing"
            disabled={isLoading}
            {...register('label')}
          />
          {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitorName">Competitor (Optional)</Label>
          <Input
            id="competitorName"
            placeholder="Acme Corp"
            disabled={isLoading}
            {...register('competitorName')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            disabled={isLoading}
            onValueChange={(val) => setValue('category', val as any)}
            defaultValue="PRICING"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRICING">Pricing</SelectItem>
              <SelectItem value="FEATURES">Features</SelectItem>
              <SelectItem value="PRODUCT">Product Page</SelectItem>
              <SelectItem value="LANDING">Landing Page</SelectItem>
              <SelectItem value="TOS">Terms of Service</SelectItem>
              <SelectItem value="BLOG">Blog</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Check Frequency</Label>
          <Select
            disabled={isLoading}
            onValueChange={(val) => setValue('checkFrequency', val as any)}
            defaultValue="DAILY"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem 
                value="SIX_HOURS" 
                disabled={!allowedFrequencies.includes('six_hours')}
              >
                Every 6 hours {!allowedFrequencies.includes('six_hours') && '(Upgrade)'}
              </SelectItem>
              <SelectItem 
                value="ONE_HOUR"
                disabled={!allowedFrequencies.includes('one_hour')}
              >
                Every hour {!allowedFrequencies.includes('one_hour') && '(Upgrade)'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <Label>Noise Threshold</Label>
          <span className="text-sm text-muted-foreground">{noiseValue}%</span>
        </div>
        <Slider
          disabled={isLoading}
          defaultValue={[2.0]}
          max={10}
          step={0.5}
          onValueChange={([val]) => setValue('noiseThreshold', val)}
        />
        <p className="text-xs text-muted-foreground">
          Changes smaller than this percentage will be silently ignored.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add URL
        </Button>
      </div>
    </form>
  );
}
