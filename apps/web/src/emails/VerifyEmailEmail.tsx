import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { BRANDING } from '@cct/db';

interface VerifyEmailEmailProps {
  verifyLink: string;
}

export const VerifyEmailEmail = ({ verifyLink }: VerifyEmailEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for {BRANDING.name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email address</Heading>
          
          <Text style={text}>
            Welcome to {BRANDING.name}! Please verify your email address to ensure you receive change alerts reliably.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={verifyLink}>
              Verify Email Address
            </Button>
          </Section>

          <Text style={text}>
            If you didn't request this, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            {BRANDING.name} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmailEmail;

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

const btnContainer = {
  textAlign: 'center' as const,
  padding: '24px 48px',
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
  fontSize: '14px',
  lineHeight: '16px',
  padding: '0 48px',
  marginTop: '32px',
};
