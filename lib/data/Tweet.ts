import { db, sql } from "../db";

/**
 * A Tweet which has been embedded in a piece of content.
 * @gqlType */
export class Tweet {
  constructor(
    /** @gqlField */
    public statusId: string,
  ) {}

  /** @gqlField */
  url(): string {
    return `https://twitter.com/i/web/status/${this.statusId}`;
  }

  /** @gqlQueryField */
  static tweets(): Array<Tweet> {
    const tweets = ALL_TWEETS.all();
    return tweets.map((row) => new Tweet(row.tweet_status));
  }
}
const ALL_TWEETS = db.prepare<[], { tweet_status: string }>(sql`
  SELECT
    tweet_status
  FROM
    content_tweets
`);
