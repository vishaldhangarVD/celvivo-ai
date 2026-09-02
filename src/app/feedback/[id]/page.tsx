/** PURGED FOR ROUTE GROUP MIGRATION **/
import { redirect } from 'next/navigation';

export default function PurgedPage({ params }: { params: { id: string } }) {
  redirect(`/feedback/${params.id}`);
}
