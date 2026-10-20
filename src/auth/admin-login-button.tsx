/**
 * The admin's whole login screen: there is no password form to fill in.
 */
export function AdminLoginButton() {
  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      {/* A full page load: the route hands the browser to Google. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="btn btn--style-primary btn--size-large" href="/auth/google?next=/admin">
        Sign in with Google
      </a>
    </div>
  )
}
