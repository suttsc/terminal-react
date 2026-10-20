import type { Access } from 'payload'

/**
 * Pages read through the Local API, which skips access control, so HTTP access
 * to /payload-api is for the signed-in owner and nobody else.
 */
export const ownerOnly: Access = ({ req }) => Boolean(req.user)

export const nobody: Access = () => false
