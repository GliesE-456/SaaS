import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldAlert } from 'lucide-react';

import { BRANDING } from '@cct/db';

interface RobotsTxtWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  domain: string;
}

export function RobotsTxtWarning({ open, onOpenChange, onConfirm, domain }: RobotsTxtWarningProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
            <AlertDialogTitle>Robots.txt Blocked</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            The website <strong>{domain}</strong> has a <code>robots.txt</code> file that asks automated crawlers not to read this page.
            <br /><br />
            {BRANDING.name} respects robots.txt by default. You can override this if you believe the rule does not apply or if you have permission to track this page.
            <br /><br />
            <span className="text-destructive font-medium">Warning:</span> Ignoring this may violate the site's Terms of Service. Proceed at your own risk.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-amber-500 hover:bg-amber-600 text-white">
            Override & Add URL
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
