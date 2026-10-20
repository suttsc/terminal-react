import * as migration_20261020_205756_initial from './20261020_205756_initial'
import * as migration_20261020_210000_seed from './20261020_210000_seed'

export const migrations = [
  {
    up: migration_20261020_205756_initial.up,
    down: migration_20261020_205756_initial.down,
    name: '20261020_205756_initial',
  },
  {
    up: migration_20261020_210000_seed.up,
    down: migration_20261020_210000_seed.down,
    name: '20261020_210000_seed',
  },
]
