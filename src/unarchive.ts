import * as core from '@actions/core'
import * as fs from 'fs'
import * as tar from 'tar'
import * as unzipper from 'unzipper'

export const extract = async (
  filePath: string,
  destDir: string
): Promise<void> => {
  const isTarGz = filePath.includes('.tar.gz')
  const isZip = filePath.includes('.zip')

  if (!isTarGz && !isZip) {
    core.warning(`${filePath} is not a supported archive. It will be skipped.`)
  }

  // Create the destination directory if it doesn't already exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, {recursive: true})
  }

  // Extract the file to the destination directory
  if (isTarGz) {
    await tar.x({
      file: filePath,
      cwd: destDir
    })
  } else if (isZip) {
    await fs
      .createReadStream(filePath)
      .pipe(unzipper.Extract({path: destDir}))
      .promise()
  }
  core.info(`${filePath} extracted to ${destDir}.`)
}
