'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function GoogleAuthTest() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;

  if (session) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Signed in as:</h3>
        <p>Name: {session.user.name}</p>
        <p>Email: {session.user.email}</p>
        <p>Role: {session.user.role}</p>
        <Button onClick={() => signOut()} className="mt-2">
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Not signed in</h3>
      <Button onClick={() => signIn('google')} className="mr-2">
        Sign in with Google
      </Button>
      <Button onClick={() => signIn('credentials')} variant="outline">
        Sign in with Email
      </Button>
    </div>
  );
}
