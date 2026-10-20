/**
 * Signs out of Auth.js, which is the only session the admin has.
 */
export function AdminLogoutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="btn btn--style-secondary btn--size-small">
        Log out
      </button>
    </form>
  )
}
