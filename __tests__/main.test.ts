import * as process from 'process'
import * as fs from 'fs'
import * as handlers from 'typed-rest-client/Handlers'
import * as thc from 'typed-rest-client/HttpClient'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {IReleaseDownloadSettings} from '../src/interfaces'
import {ReleaseDownloader} from '../src/release-downloader'
import {extract} from '../src/unarchive'


let downloader: ReleaseDownloader
let httpClent: thc.HttpClient
const outputFilePath = './test-output'
const defaultRepo = 'stedolan/jq'

beforeEach(() => {
  const githubtoken = process.env.REPO_TOKEN || ''
  const githubApiUrl = 'https://api.github.com'

  const credentialHandler = new handlers.BearerCredentialHandler(
    githubtoken,
    false
  )
  httpClent =
    githubtoken != ''
      ? new thc.HttpClient('gh-api-client', [credentialHandler])
      : new thc.HttpClient('gh-api-client')
  downloader = new ReleaseDownloader(httpClent, githubApiUrl)
})

afterEach(async () => {
  fs.rmSync(outputFilePath, { recursive: true, force: true });
})

test('Download all files from repo', async () => {
  const downloadSettings: IReleaseDownloadSettings = {
    sourceRepoPath: defaultRepo,
    isLatest: true,
    tag: '',
    id: '',
    fileName: '*',
    outFilePath: outputFilePath
  }
  const result = await downloader.download(downloadSettings)
  expect(result.length).toBe(7)
  console.log(result)
}, 50000)

test("Download single file from repo", async () => {
  const downloadSettings: IReleaseDownloadSettings = {
    sourceRepoPath: defaultRepo,
    isLatest: true,
    tag: "",
    id: "",
    fileName: "jq-1.6.zip",
    outFilePath: outputFilePath
  }
  const result = await downloader.download(downloadSettings)
  expect(result.length).toBe(1)
}, 50000)

test("Download single file from repo at specific release", async () => {
  const downloadSettings: IReleaseDownloadSettings = {
    sourceRepoPath: defaultRepo,
    isLatest: false,
    tag: "jq-1.5",
    id: "",
    fileName: "jq-1.5.zip",
    outFilePath: outputFilePath
  }
  const result = await downloader.download(downloadSettings)
  expect(result.length).toBe(1)
}, 50000)

test("Download single file from repo and extract", async () => {
  const extract_assats = true
  const downloadSettings: IReleaseDownloadSettings = {
    sourceRepoPath: defaultRepo,
    isLatest: false,
    tag: "jq-1.5",
    id: "",
    fileName: "jq-1.5.zip",
    outFilePath: outputFilePath
  }
  const result = await downloader.download(downloadSettings)

  if (extract_assats) {
    for (const asset of result) {
      await extract(asset, downloadSettings.outFilePath)
    }
  }
  const file = result[0].slice(0,-4) + path.sep + 'README.md'
  expect(fs.existsSync(file)).toBe(true)
}, 50000)


test("Fail if given filename is not found", async () => {
  const downloadSettings: IReleaseDownloadSettings = {
    sourceRepoPath: defaultRepo,
    isLatest: true,
    tag: "",
    id: "",
    fileName: "missing-file.txt",
    outFilePath: outputFilePath
  }
  const result = downloader.download(downloadSettings)
  await expect(result).rejects.toThrow(
    "Asset with name missing-file.txt not found!"
  )
}, 10000)
