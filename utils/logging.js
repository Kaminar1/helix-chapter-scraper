import { appendFile, open } from "fs/promises"
import path from "path"
import { settings } from "../settings/settings.js"
import { formatDateLong } from "./dateFormatter.js"
import { ensureDirExists } from "./fileHandler.js"

const { logFilePath } = settings

const loggingTypes = {
  info: "INFO",
  error: "ERROR",
  debug: "DEBUG",
  fatalError: "FATAL ERROR",
}

//funtion that should write this to file with timestamps
const logme = async (loggingType, message) => {
  // make dir if it does not exist
  await ensureDirExists(path.dirname(logFilePath))

  const s = `[${formatDateLong(new Date())}][${loggingType}] ${message}`

  // append to log file
  await appendFile(logFilePath, `\n${s}`).catch((error) => {
    console.error("Could not append to file :c")
    throw new Error(error)
  })
}

export const Logme = {
  error: (error, message) => {
    logme(
      loggingTypes.error,
      `${JSON.stringify({
        message: error?.message,
        options: error?.options,
        fileName: error?.fileName,
        lineNumber: error?.lineNumber,
        columnNumber: error?.columnNumber,
        stack: error?.stack,
      })}${JSON.stringify({ message })}`
    )
    console.error(error)
  },
  info: (message) => {
    logme(
      loggingTypes.info,
      `${JSON.stringify({
        message,
      })}`
    )
    console.log(message)
  },
  debug: (message) => {
    logme(
      loggingTypes.debug,
      `${JSON.stringify({
        message,
      })}`
    )
    console.log(message)
  },
  debugc: (message) => {
    logme(loggingTypes.debug, message)
    console.log(message)
  },
}
