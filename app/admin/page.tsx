import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  if ((session.user as { role?: string }).role !== 'admin') redirect('/')
  return <main className="admin-page"><header className="admin-header"><a className="wordmark" href="/">peak</a><span>Admin</span><a href="/" className="admin-link">Back to app</a></header><section className="admin-content"><p className="eyebrow-text">OPERATIONS</p><h1>Keep the circle healthy.</h1><p className="auth-copy">Manage members, gear, and trust signals from one place.</p><div className="admin-grid"><div><strong>0</strong><span>Members</span></div><div><strong>0</strong><span>Gear listings</span></div><div><strong>0</strong><span>Pending reviews</span></div></div><div className="admin-empty"><h2>Admin tools are ready.</h2><p>Connect your first member and listing to start managing Peak.</p></div></section></main>
}
