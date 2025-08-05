import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Privacy Policy – Clarnote',
  description: 'Learn how Clarnote handles and protects your data.',
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <Container className="max-w-3xl py-12 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
      <p className="mb-8 text-gray-600"><strong>Last Updated: August 5, 2025</strong></p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Introduction</h2>
      <p className="mb-4 text-gray-700">
        This Privacy Policy explains how DE Management Group s.r.o. ("Company", "we", "us", or "our") collects, uses, shares, and protects personal data in connection with the Clarnote platform ("Platform") and website located at https://clarnote.com and its subdomains ("Website").
      </p>
      <p className="mb-6 text-gray-700">
        By using the Platform or Website, you agree to this Privacy Policy. We may update this policy from time to time and encourage you to review it regularly.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Information We Collect</h2>
      <p className="mb-6 text-gray-700">
        We may collect personal data you voluntarily provide, such as your email address, contact details, uploaded files, and subscription preferences. We also collect data automatically such as IP address, device information, usage logs, and cookies.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Use of Personal Data</h2>
      <p className="mb-4 text-gray-700">
        We use your data for the following purposes:
      </p>
      <p className="mb-2 text-gray-700">
        To provide and operate the Platform and Website.
      </p>
      <p className="mb-2 text-gray-700">
        To communicate with you and respond to inquiries.
      </p>
      <p className="mb-2 text-gray-700">
        To improve our services and develop new features.
      </p>
      <p className="mb-2 text-gray-700">
        To ensure the security and integrity of our Platform.
      </p>
      <p className="mb-2 text-gray-700">
        To comply with legal obligations and enforce our rights.
      </p>
      <p className="mb-6 text-gray-700">
        For internal analytics, research, and marketing (if consented).
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Legal Basis for Processing</h2>
      <p className="mb-4 text-gray-700">
        We process personal data on the following legal bases:
      </p>
      <p className="mb-2 text-gray-700">
        Your consent (e.g., for marketing).
      </p>
      <p className="mb-2 text-gray-700">
        Performance of a contract (e.g., to deliver services).
      </p>
      <p className="mb-2 text-gray-700">
        Compliance with legal obligations.
      </p>
      <p className="mb-6 text-gray-700">
        Legitimate interests (e.g., improving services, preventing fraud).
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Cookies and Analytics</h2>
      <p className="mb-6 text-gray-700">
        We use cookies and similar technologies to provide functionality, improve your experience, and analyze traffic. We may use tools like Google Analytics, which may collect information such as IP address and usage patterns. You can manage your cookie preferences in your browser settings.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Data Sharing</h2>
      <p className="mb-4 text-gray-700">
        We do not sell your data. We may share data with:
      </p>
      <p className="mb-2 text-gray-700">
        Service providers who support our operations.
      </p>
      <p className="mb-2 text-gray-700">
        Affiliates and subsidiaries.
      </p>
      <p className="mb-2 text-gray-700">
        Legal or regulatory authorities if required by law.
      </p>
      <p className="mb-6 text-gray-700">
        Investors or in connection with a merger/acquisition.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">International Data Transfers</h2>
      <p className="mb-6 text-gray-700">
        Your data may be transferred outside the EEA. In such cases, we ensure appropriate safeguards such as Standard Contractual Clauses.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Data Retention</h2>
      <p className="mb-4 text-gray-700">
        We retain personal data for as long as necessary to fulfill the purposes for which it was collected, including for legal, accounting, or reporting obligations. Retention periods are determined based on the nature and purpose of the data, legal requirements, and the need for operational efficiency.
      </p>
      <p className="mb-6 text-gray-700">
        We reserve the right to delete any data at any time, at our sole discretion, including but not limited to data related to inactive accounts or historical usage. This policy supports data minimization and security while allowing operational flexibility.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Your Rights</h2>
      <p className="mb-4 text-gray-700">
        You may have rights under applicable laws, including the right to:
      </p>
      <p className="mb-2 text-gray-700">
        Access, correct, or delete your data.
      </p>
      <p className="mb-2 text-gray-700">
        Object to or restrict processing.
      </p>
      <p className="mb-2 text-gray-700">
        Withdraw consent (where applicable).
      </p>
      <p className="mb-2 text-gray-700">
        Data portability.
      </p>
      <p className="mb-4 text-gray-700">
        Lodge a complaint with a supervisory authority.
      </p>
      <p className="mb-6 text-gray-700">
        To exercise your rights, contact us at <a href="mailto:hello@clarnote.com" className="text-blue-600 hover:text-blue-800 underline">hello@clarnote.com</a>. We may need to verify your identity before fulfilling your request.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Security</h2>
      <p className="mb-6 text-gray-700">
        We implement technical and organizational measures to protect personal data, including encryption, access control, and secure infrastructure. However, no system is completely secure, and we encourage users to take precautions when sharing sensitive information.
      </p>

      <h2 className="font-semibold text-lg mt-8 mb-3 text-gray-900">Contact</h2>
      <p className="mb-8 text-gray-700">
        If you have questions or concerns about this Privacy Policy or your personal data, please contact us at <a href="mailto:hello@clarnote.com" className="text-blue-600 hover:text-blue-800 underline">hello@clarnote.com</a>.
      </p>

      <Separator className="my-8" />
    </Container>
  );
} 