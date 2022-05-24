import fs, { read } from "fs"
import { readdir, access } from "fs/promises"
import mkdirp from "mkdirp"
import { Logme } from "./logging.js"

/**
 * function to create a directory if it does not exist
 * @param {string} directory - path to directory
 */
export const ensureDirExists = async (directory) => {
  await mkdirp(directory)
    .then((made) => {
      if (made)
        Logme.info(
          `Successfuly created dir. directory=${directory}, response=${made}`
        )
      // else Logme.debug(`Directory exists. directory=${directory}`)
    })
    .catch((error) =>
      Logme.error(
        JSON.stringify({ stack: error?.stack, error: error }),
        `Could not create directory=${directory}.`
      )
    )
}

/**
 * Check if a file exists
 * @param {string} file - file path
 * @returns {Promise<boolean>}
 */
export const checkFileExists = async (file) => {
  return access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

const writeToJsonFile = async (content) => {
  fs.writeFile("./out.json", content, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
}
