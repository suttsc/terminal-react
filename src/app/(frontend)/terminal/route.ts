import { createTerminalHandler } from '@/http/terminal'
import { requestContext } from '@/terminal/context'
import { registry } from '@/terminal/registry'

export const POST = createTerminalHandler({ registry, context: requestContext })
