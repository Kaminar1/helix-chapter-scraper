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
    const result = await page.evaluate(async (user_id) => {
      const chapterDivs = document.querySelectorAll(
        "[data-a-target^='video-tower-card-'] [data-test-selector='toggle-balloon-wrapper__mouse-enter-detector']"
      )

      const vods = []
      // for each vod
      for (const elem of chapterDivs) {
        elem.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))

        /** @type {ChaptersObject} */
        const vod = { channel: user_id, chapters: [] }

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
              return {
                starts_at: start_time,
                game: {
                  ...gameObj,
                },
              }
            })

          vod.chapters.push(gameChapter)
        }

        vods.push(vod)
      }

      // get all the cards for each vod, that has title, chapters, and game if there are no chapters
      const allInfoCards = document.querySelectorAll(
        "[data-test-selector='content'] div.tw-tower div > article > div > div.Layout-sc-nxg1ff-0"
      )

      for (const card of allInfoCards) {
        // skip this card if it has the "Chapter" element (multiple games)
        if (!card.querySelector("[data-a-target='preview-card-game-link']"))
          continue

        /** @type {ChaptersObject} */
        const vod = { channel: user_id, chapters: [] }

        /** @type {string} */
        const link = card.querySelector("a.tw-link").href
        const v_id = link.substring(
          link.lastIndexOf("/") + 1,
          link.indexOf("?")
        )
        vod.video_id = v_id

        /** @type {Element} */
        const image = card.querySelector("img.tw-image")

        const gameName = image.alt

        /** @type {Chapter} */
        const gameChapter = await window.getGameData(gameName).then((res) => {
          return {
            starts_at: "0h0m0s",
            game: {
              ...res,
            },
          }
        })

        vod.chapters.push(gameChapter)
        vods.push(vod)
      }

      return vods
    }, user_id)

    return result
  } catch (error) {
    Logme.error(error, `Fetching chapters failed, `)
  } finally {
    setTimeout(() => browser.close(), 2000)
  }
}
