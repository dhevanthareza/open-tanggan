import { findAdmin } from '~/server/utils/admins'

export default defineOAuthGoogleEventHandler({
  config: { scope: ['email', 'profile'] },
  async onSuccess(event, { user }) {
    const admin = await findAdmin(user.email)
    if (!admin) return sendRedirect(event, '/unauthorized')

    await setUserSession(event, {
      user: {
        email: admin.email,
        nama: admin.nama,
        picture: user.picture,
        role: admin.role,
        rt: admin.rt,
      },
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('OAuth error:', error)
    return sendRedirect(event, '/login?error=oauth')
  },
})
