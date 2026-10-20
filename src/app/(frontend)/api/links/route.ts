import { after } from 'next/server'
import { getIsOwner } from '@/auth/auth'
import { createStoreLinkHandler } from '@/http/links'
import { payloadRepositories } from '@/repositories/payload'
import { fetchTitleNow } from '@/services/fetch-title-now'

export const POST = createStoreLinkHandler({
  isOwner: getIsOwner,
  links: async () => (await payloadRepositories()).links,
  // The <title> is fetched once the response has gone, never before.
  scheduleTitleFetch: (id) => after(() => fetchTitleNow(id)),
})
