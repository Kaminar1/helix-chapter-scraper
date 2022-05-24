/**
 *
 * @typedef credentials
 * @property {string} client_id
 * @property {string} client_secret
 *
 * @typedef Settings
 * @property {string} logFilePath - path to log file.
 * @property {string} userIdToScrape - user id to scrape chapters from
 *
 * Helix /users
 * @typedef UserInfo
 * @property {string} id
 * @property {string} login
 * @property {string} display_name
 * @property {string} type
 * @property {string} broadcaster_type
 * @property {string} description
 * @property {string} profile_image_url
 * @property {string} offline_image_url
 * @property {number} view_count
 * @property {string}
 *
 * @typedef Vod
 * @property {string} id
 * @property {string} stream_id
 * @property {string} user_id
 * @property {string} user_login
 * @property {string} user_name
 * @property {string} title
 * @property {string} description
 * @property {string} created_at
 * @property {string} published_at
 * @property {string} url
 * @property {string} thumbnail_url
 * @property {string} viewable
 * @property {number} view_count
 * @property {string} language
 * @property {string} type
 * @property {string} duration
 * @property {null} muted_segments
 *
 * @typedef Channel
 * @property {string} name
 * @property {number | string} id
 */

/** Object for each video, with list of chapters
 * @typedef ChaptersObject
 * @property {string} video_id
 * @property {number} channel
 * @property {Chapter[]} chapters
 *
 * @typedef {Object} Chapter
 * @property {string} starts_at - Time string with format '0h0m20s'
 * @property {Game} game
 *
 * @typedef {Object} Game
 * @property {string} game_id
 * @property {string} name
 * @property {string} box_art_url
 */
