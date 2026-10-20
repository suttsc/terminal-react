import type { StravaActivityData } from '@/repositories/types'
import type { StravaClient } from '@/integrations/strava/strava-client'

export class FakeStravaClient implements StravaClient {
  constructor(private readonly activities: StravaActivityData[] = []) {}

  async activitiesSince(since: Date) {
    return this.activities.filter((activity) => activity.startedAt.getTime() > since.getTime())
  }
}
