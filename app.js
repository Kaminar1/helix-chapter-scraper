import { settings } from "./settings/settings.js"
import { fetchChapters } from "./utils/chapterFetch.js"
import { Logme } from "./utils/logging.js"

settings

try {
  const ChapterElements = await fetchChapters(settings.userIdToScrape)

  await Logme.debug(ChapterElements)
} catch (error) {
  Logme.error(error)
}
