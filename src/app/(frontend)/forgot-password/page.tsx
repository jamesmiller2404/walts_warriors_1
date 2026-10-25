import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Forgot password',
};

export default function ForgotPasswordPage() {
  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Reset your password</h1>
        <p className="mt-2 text-stone-600">
          Enter the email you used to sign up and we&apos;ll send you a reset link.
        </p>

        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </Container>
  );
}
