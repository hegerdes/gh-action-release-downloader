interface GhAsset {
  name: string
  url: string
}

export interface GithubRelease {
  name: string
  id: number
  tag_name: String
  assets: GhAsset[]
  tarball_url: string
  zipball_url: string
}

export interface DownloadMetaData {
  fileName: string
  url: string
  isTarBallOrZipBall: boolean
}

export interface IReleaseDownloadSettings {
  /**
   * The source repository path. Expected format {owner}/{repo}
   */
  sourceRepoPath: string

  /**
   * A flag to choose between latest release and remaining releases
   */
  isLatest: boolean

  /**
   * The release tag
   */
  tag: string

  /**
   * The release id
   */
  id: string

  /**
   * Name of the file to download
   */
  fileName: string

  /**
   * Download ttarball from release
   */
  tarBall: boolean

  /**
   * Download zipball from release
   */
  zipBall: boolean

  /**
   * Target path to download the file
   */
  outFilePath: string
}
