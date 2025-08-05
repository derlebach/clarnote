import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Terms of Service – Clarnote',
  description: 'Please read our Terms of Service carefully before using Clarnote.',
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <Container className="max-w-3xl py-12 text-sm leading-relaxed prose prose-neutral">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p><strong>Last Updated: August 5, 2025</strong></p>
      <p>These Terms of Service (the "Terms") govern the access and use of the Clarnote application and website, available at https://clarnote.com and any related subdomains (the "Platform"), operated by DE Management Group s.r.o., a Czech company, IČO 07345771, with its registered office at Klimentská 2066/19, Nové Město, 110 00 Praha 1 (the "Company," "we," or "us").</p>
      <p>By accessing or using the Platform, you ("User" or "you") agree to be bound by these Terms. If you do not agree with any part of the Terms, you must not use the Platform.</p>

      <h2>1. Description of the Service</h2>
      <p>Clarnote is a software platform that allows users to transcribe, analyze, and process audio and video content using artificial intelligence (AI) technologies. The Platform is available free of charge, with an optional paid subscription plan priced at $9 USD/month offering enhanced features.</p>

      <h2>2. AI-Generated Output</h2>
      <ul>
        <li>AI Output may not be unique and may be similar to outputs generated for other users.</li>
        <li>You are solely responsible for how you use any AI Output.</li>
        <li>The Company makes no warranties regarding the accuracy, completeness, legality, or suitability of the AI Output for any purpose.</li>
        <li>You acknowledge that human review is advised before relying on AI Output for critical or sensitive use cases.</li>
        <li>The Platform and AI Output are not intended for use in medical, legal, financial, or other regulated or high-risk domains. Any reliance on AI Output for such use cases is at the sole risk of the User, and the Company disclaims any liability arising therefrom.</li>
      </ul>

      <h2>3. No Guarantee of Availability or Functionality</h2>
      <p>The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee uninterrupted or error-free operation, satisfaction of expectations, or availability at all times.</p>
      <p>The Company may change or update the Platform and Website at any time, including, without limitation, the availability of any feature, content or database, and may impose limitations or restrictions on certain features and services or discontinue any or all parts of the Platform or Website. In case of a material change, the Company will notify users via the Website, Platform, or email.</p>
      <p>By continuing to use the Platform, you acknowledge and agree to these changes and waive any claims or liability resulting from such changes or discontinuation. Use is at your own risk. We are not liable for force majeure events or their consequences.</p>
      <p>The Company reserves the right to delete, remove, or purge any data or content from the Platform or User account at any time, including due to inactivity or legal/operational needs. We are under no obligation to retain User content.</p>

      <h2>4. User Conduct</h2>
      <ul>
        <li>You must not reverse engineer, copy, or modify the software.</li>
        <li>You must not use the Platform illegally or unethically.</li>
        <li>You must not upload harmful code or attempt unauthorized access.</li>
        <li>You are responsible for your content and its compliance with laws and rights.</li>
      </ul>

      <h2>5. Subscription and Payments</h2>
      <ul>
        <li>Subscriptions are billed monthly and non-refundable except where required by law.</li>
        <li>Subscriptions can be canceled anytime, effective at the end of the billing cycle.</li>
        <li>Invoices or tax documents cannot be modified retroactively.</li>
        <li>Subscription pricing may change with prior notice and will apply in the next billing cycle.</li>
        <li>EU users may withdraw from the contract within 14 days, per EU consumer law.</li>
      </ul>

      <h2>6. Ownership and Intellectual Property</h2>
      <p>All rights in the Platform, including code and design, are owned by the Company. You retain ownership of your content but grant us a limited license to use it to provide the service.</p>

      <h2>7. Data Privacy and GDPR Compliance</h2>
      <p>We comply with GDPR and only collect data necessary for operation. We do not sell or share your personal data for marketing purposes. Users may access, correct, or delete their data and file complaints with ÚOOÚ. Data transfers outside the EEA are protected via safeguards. We follow principles of lawfulness, purpose limitation, data minimization, security, and transparency.</p>

      <h2>8. Export Control and Sanctions Compliance</h2>
      <p>You may not use the Platform in violation of applicable export laws or sanctions. You confirm that you are not in a prohibited location or on a restricted list.</p>

      <h2>9. Minimum Age Requirement</h2>
      <p>You must be at least 13 years old or the legal minimum age in your country to use the Platform.</p>

      <h2>10. Cookies and Tracking Technologies</h2>
      <p>The Platform may use cookies and tracking tools for functionality and analytics. Details will be in the upcoming Privacy Policy.</p>

      <h2>11. Termination</h2>
      <p>We may suspend or terminate your access at our discretion, especially in case of abuse. You agree to cooperate in any investigation or violation resolution.</p>

      <h2>12. Governing Law and Dispute Resolution</h2>
      <p>These Terms are governed by Czech law. Disputes shall be resolved by the courts in Prague. EU consumers may use the ODR platform: https://ec.europa.eu/consumers/odr.</p>

      <h2>13. Modifications to the Terms</h2>
      <p>We may update these Terms. Continued use means acceptance of the updated version.</p>

      <h2>14. Contact</h2>
      <p>If you have questions, contact us at <a href="mailto:hello@clarnote.com">hello@clarnote.com</a>.</p>

      <Separator className="my-8" />
    </Container>
  );
} 