import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { RoomForm } from '../RoomForm';

export const metadata: Metadata = { title: 'New Room · Admin', robots: { index: false } };

export default function NewRoomPage() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/rooms" eyebrow="Rooms" title="Add a new room" />
      <RoomForm />
    </section>
  );
}
