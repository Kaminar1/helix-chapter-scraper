import { settings } from "./settings/settings.js"
import { fetchChapters } from "./utils/chapterFetch.js"
import { writeToJsonFile } from "./utils/fileHandler.js"
import { Logme } from "./utils/logging.js"

settings

try {
  const ChapterElements = await fetchChapters(settings.userIdToScrape)

  await Logme.debug(ChapterElements)

  await writeToJsonFile(JSON.stringify(ChapterElements, null, 2))
} catch (error) {
  Logme.error(error)
}
