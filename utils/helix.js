import axios from "axios"
import { creds } from "../settings/settings.js"
import { Logme } from "./logging.js"

/** @type {string | null} */
let bearerToken = null

/**
 * @returns {Promise<{access_token: string, expires_in: number, token_type: string}>}
 */
const fetchBearerToken = async (credentials) => {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${credentials.client_id}&client_secret=${credentials.client_secret}&grant_type=client_credentials`

  try {
    return await axios
      .post(url)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        throw error
      })
  } catch (error) {
    Logme.error(error, `axios: Failed fetching bearer token.`)
    throw error
  }
}

/**
 * fetches first search result from helix api
 * @param {string} name
 * @returns {Promise<Game>}
 */
const getGameData = async (name) => {
  const url = `https://api.twitch.tv/helix/games?name=${name}`

  try {
    if (!bearerToken) {
      const token = await fetchBearerToken(creds)
      bearerToken = token.access_token
    }

    return await axios
      .get(url, {
        headers: {
          "Client-ID": creds.client_id,
          Authorization: `Bearer ${bearerToken}`,
        },
      })
      .then((response) => {
        const game = response.data?.data?.[0]
        const { id: game_id, name, box_art_url } = game
        return {
          game_id,
          name,
          box_art_url,
        }
      })
      .catch((error) => {
        throw error
      })
  } catch (error) {
    Logme.error(error, `Getting game data for name='${name}'`)
  }
}
/**
 * @param {string | number} user_id
 * @returns {Promise<Vod[]>}
 */
const getAllVods = async (user_id) => {
  const url = `https://api.twitch.tv/helix/videos?user_id=${user_id}&first=100&type=archive`

  try {
    if (!bearerToken) {
      const token = await fetchBearerToken(creds)
      bearerToken = token.access_token
    }

    return await axios
      .get(url, {
        headers: {
          "Client-ID": creds.client_id,
          Authorization: `Bearer ${bearerToken}`,
        },
      })
      .then((response) => {
        return response.data.data
      })
      .catch((error) => {
        throw error
      })
  } catch (error) {
    Logme.error(
      error,
      `Getting vods from helix failed for user_id='${user_id}'`
    )
  }
}

/** Returns first result of user with passed user_id
 * @param  {string | number} user_id
 * @returns {Promise<UserInfo>}
 */
const getUserInfo = async (user_id) => {
  const url = `https://api.twitch.tv/helix/users?id=${user_id}`

  try {
    if (!bearerToken) {
      const token = await fetchBearerToken(creds)
      bearerToken = token.access_token
    }

    const data = await axios
      .get(url, {
        headers: {
          "Client-ID": creds.client_id,
          Authorization: `Bearer ${bearerToken}`,
        },
      })
      .then((response) => {
        return response.data?.data?.[0]
      })
      .catch((error) => {
        throw error
      })

    return data
  } catch (error) {
    Logme.error(error, `getUserInfo failed.`)
    throw error
  }
}

export { getGameData, getAllVods, getUserInfo }
