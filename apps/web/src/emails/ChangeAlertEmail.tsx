import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { BRANDING } from '@cct/db';

interface ChangeAlertEmailProps {
  workspaceId: string;
  urlId: string;
  changeEventId: string;
  competitorName: string;
  pageLabel: string;
  impactLevel: string;
  diffSummary?: string;
  dashboardUrl: string;
}

export const ChangeAlertEmail = ({
  workspaceId,
  urlId,
  changeEventId,
  competitorName,
  pageLabel,
  impactLevel,
  diffSummary = 'Changes detected on the page. View diff for details.',
  dashboardUrl,
}: ChangeAlertEmailProps) => {
  const diffLink = `${dashboardUrl}/dashboard/changes/${changeEventId}`;

  return (
    <Html>
      <Head />
      <Preview>{`Change detected on ${competitorName} - ${pageLabel}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Change Detected: {competitorName}</Heading>
          
          <Text style={text}>
            We detected a change on <strong>{pageLabel}</strong> for {competitorName}.
          </Text>

          <Section style={infoBox}>
            <Text style={impactText(impactLevel)}>
              Impact Level: {impactLevel.toUpperCase()}
            </Text>
            <Text style={diffText}>{diffSummary}</Text>
          </Section>

          <Section style={btnContainer}>
            <Button style={button} href={diffLink}>
              View Diff
            </Button>
          </Section>

          <Text style={footer}>
            You received this email because of your Notification Preferences in {BRANDING.name}.
            <br />
            <Link href={`${dashboardUrl}/dashboard/settings/notifications`} style={link}>
              Manage Preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ChangeAlertEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
};

const infoBox = {
  backgroundColor: '#f9f9f9',
  borderLeft: '4px solid #6366f1',
  margin: '20px 48px',
  padding: '16px',
};

const impactText = (level: string) => ({
  color: level.toLowerCase() === 'high' ? '#ef4444' : level.toLowerCase() === 'medium' ? '#f59e0b' : '#64748b',
  fontWeight: '600',
  margin: '0 0 8px 0',
});

const diffText = {
  color: '#4b5563',
  margin: '0',
  fontSize: '14px',
  lineHeight: '22px',
};

const btnContainer = {
  textAlign: 'center' as const,
  padding: '0 48px',
};

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
  marginTop: '32px',
};

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
};
