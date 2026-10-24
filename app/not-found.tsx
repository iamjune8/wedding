import Link from 'next/link';
import { StarMotif } from '@/components/ornaments/StarMotif';

export default function NotFound() {
  return (
    <main className="not-found">
      <StarMotif />
      <h1 className="not-found__title">This page could not be found</h1>
      <Link className="btn btn-secondary" href="/">
        Return to the invitation
      </Link>
    </main>
  );
}
