---
title: I archived all the Tweets referenced by my blog
tags:
  - javascript
  - thisSite
  - note
summary: Preserving Tweets
notion_id: d8726b54-59d7-4ee0-a9cf-d442c4257cdb
---
In light of the chaos that seems to be enveloping Twitter these last few weeks, I decided it was prudent to archive all the Tweets embedded in or mentioned by my personal blog. I ended up doing this with the `twit` NPM package.

In my blog I use a Markdown custom directive for Youtube embeds. So I grepped for these directives as well as any URL that looked like a twitter status. With those collected, I dashed together a quick Node script to download them as JSON. It looked something like:

```javascript
const client = new Twit({
  consumer_key: TWITTER_CREDS.apiKey,
  consumer_secret: TWITTER_CREDS.apiSecret,
  access_token: TWITTER_CREDS.accessToken,
  access_token_secret: TWITTER_CREDS.accessTokenSecret,
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

for (const tweetId of tweetIds) {
  try {
    const tweet = await client.get("statuses/show", { id: tweetId });
    fs.writeFileSync(
      `tweets/${tweetId}.json`,
      JSON.stringify(tweet.data, null, 2)
    );
  } catch (e) {
    console.error(e)
    console.error("Failed to get tweet", tweetId);
  }
}
```

For the Tweets which included videos (there were only two, so I just checked manually) I downloaded them with [`youtube-dl`](https://youtube-dl.org/). I have not yet taken the time to figured out how to download images.

- <https://www.npmjs.com/package/twit>
- <https://youtube-dl.org/>
