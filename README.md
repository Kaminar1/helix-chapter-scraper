# helix-chapter-scraper

With twitch's new Helix API, [video archive endpoint](https://dev.twitch.tv/docs/api/reference#get-videos) no longer returns 'chapters' or games info from a video. This is a temporary solution using [puppeteer](https://github.com/puppeteer/puppeteer) to scrape which game or games is attached to recent vods from the archive.

JSON format as output:

```json
{
  "video_id": "1442171798",
  "channel": 560363490,
  "chapters": [
    {
      "starts_at": "0h0m1s",
      "game": {
        "game_id": "488552",
        "name": "Overwatch",
        "box_art_url": "https://static-cdn.jtvnw.net/ttv-boxart/488552-{width}x{height}.jpg"
      }
    },
    {
      "starts_at": "2h58m18s",
      "game": {
        "game_id": "509658",
        "name": "Just Chatting",
        "box_art_url": "https://static-cdn.jtvnw.net/ttv-boxart/509658-{width}x{height}.jpg"
      }
    }
  ]
}
```
