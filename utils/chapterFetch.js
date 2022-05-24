import puppeteer from "puppeteer"
import { getGameData, getUserInfo } from "./helix.js"
import { Logme } from "./logging.js"

/**
 * Fetches list of all chapters with vod_id's for channel
 * @param  {number | string} user_id
 * @returns {ChaptersObject[]} list of chapters per vod
 */
export const fetchChapters = async (user_id) => {
  // get current user_login of user_id
  const user_login = await getUserInfo(user_id)
    .then((user) => {
      return user?.login
    })
    .catch((e) =>
      Logme.error(e, `Could not get userinfo for user_id=${user_id}`)
    )

  // simulate new browser of vod page
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--lang=en-US"],
  })
  const page = await browser.newPage()
  const archive = `https://www.twitch.tv/${user_login}/videos?filter=archives&sort=time`
  await page.goto(archive)
  await page.waitForNetworkIdle() //if this is slow, try to use waitForSelector('.someClass')

  // pipe console logs on website to terminal
  page.on("console", async (msg) => {
    const msgArgs = msg.args()
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue())
    }
  })

  // add functions to global space to get game data
  await page
    .exposeFunction("getGameData", getGameData)
    .catch((e) => Logme.error(e, `ExposeFunction failed for helix.getGameData`))

  try {
    // ! evaluate runs inside the browser, keep in mind to return the values to access them in node
    const result = await page.evaluate(async () => {
      const chapterDivs = document.querySelectorAll(
        "[data-a-target^='video-tower-card-'] [data-test-selector='toggle-balloon-wrapper__mouse-enter-detector']"
      )

      const vods = []
      // for each vod
      for (const elem of chapterDivs) {
        elem.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))

        /** @type {ChaptersObject} */
        const vod = { chapters: [] }

        const games = elem.parentNode.querySelectorAll(
          '[data-test-selector="balloon-inside-click-detector"] .preview-card-game-balloon__content .media-row > a'
        )

        // for each chapter for vod
        for (const game of games) {
          const vlink = game.href
          const v_id = vlink.substring(
            vlink.lastIndexOf("/") + 1,
            vlink.indexOf("?")
          )
          //   console.log("vod id: ", vod.video_id);
          vod.video_id = v_id
          const start_time = vlink.substring(vlink.indexOf("t=") + 2)
          // alternative: game.querySelector("img").alt
          const game_name = game.querySelector(
            ".media-row__info-text p"
          ).textContent

          const gameChapter = await window
            .getGameData(game_name)
            .then((gameObj) => {
              //   console.log(gameObj);
              return {
                starts_at: start_time,
                game: {
                  game_id: gameObj.id,
                  name: game_name,
                  box_art_url: gameObj.box_art_url,
                },
              }
            })

          vod.chapters.push(gameChapter)
        }

        vods.push(vod)
      }

      return vods
    })

    return result
  } catch (error) {
    Logme.error(error, `Fetching chapters failed, `)
  } finally {
    setTimeout(() => browser.close(), 2000)
  }
}
