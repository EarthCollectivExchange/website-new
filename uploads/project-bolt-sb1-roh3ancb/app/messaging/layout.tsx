import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messaging — Archived',
  description: 'EarthOS QLPA Matrix Source Code Base — Messaging product UI archived.',
};

export default function MessagingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
