import type { TerminalCommand } from '@/terminal/types'
import about from '@/terminal/commands/about'
import ai from '@/terminal/commands/ai'
import ask from '@/terminal/commands/ask'
import blog from '@/terminal/commands/blog'
import coffee from '@/terminal/commands/coffee'
import deploy from '@/terminal/commands/deploy'
import help from '@/terminal/commands/help'
import hire from '@/terminal/commands/hire'
import link from '@/terminal/commands/link'
import linkAdd from '@/terminal/commands/link-add'
import linkRm from '@/terminal/commands/link-rm'
import links from '@/terminal/commands/links'
import login from '@/terminal/commands/login'
import logout from '@/terminal/commands/logout'
import projects from '@/terminal/commands/projects'
import strava from '@/terminal/commands/strava'
import sudo from '@/terminal/commands/sudo'
import theme from '@/terminal/commands/theme'
import tools from '@/terminal/commands/tools'
import uptime from '@/terminal/commands/uptime'
import whoami from '@/terminal/commands/whoami'

/**
 * Every command, by file name. Bundlers can't glob at runtime, so a test reads
 * this directory and fails if a file is missing from here.
 */
export const commandFiles = {
  about,
  ai,
  ask,
  blog,
  coffee,
  deploy,
  help,
  hire,
  link,
  'link-add': linkAdd,
  'link-rm': linkRm,
  links,
  login,
  logout,
  projects,
  strava,
  sudo,
  theme,
  tools,
  uptime,
  whoami,
} satisfies Record<string, TerminalCommand>

export const commands: TerminalCommand[] = Object.values(commandFiles)
