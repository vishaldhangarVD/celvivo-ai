/**
 * @fileOverview Redirected to Certificates (main route group).
 * This file serves as a redirect to resolve duplicate route conflicts.
 */
import { redirect } from 'next/navigation';

export default function ConflictRedirect() {
  redirect('/certificates');
  return null;
}
