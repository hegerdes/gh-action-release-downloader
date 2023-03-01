## GitHub Release Downloader

[![build-test](https://github.com/hegerdes/gh-action-release-downloader/actions/workflows/test.yml/badge.svg)](https://github.com/hegerdes/gh-action-release-downloader/actions/workflows/test.yml)

A GitHub Action to download assets from GitHub release. It can download specified files from both private and public repositories.

## Usage

```yaml

- uses: hegerdes/gh-action-release-downloader@v1
  with:
    # The source repository path.
    # Expected format {owner}/{repo}
    # Default: ${{ github.repository }}
    repository: ""

    # A flag to set the download target as latest release
    # The default value is 'false'
    latest: true

    # The github tag. e.g: v1.0.1
    # Download assets from a specific tag/version
    tag: ""

    # The name of the file to download.
    # Use this field only to specify filenames, if any.
    # Supports wildcard pattern (eg: '*', '*.deb', '*.zip' etc..)
    fileName: ""

    # A flagt to set if the downloaded assats are archives and should be extracted
    # Checks all downloaded files if they end with zip, tar or tar.gz and extracts them, if true.
    # Prints a warning if enabled but file is not an archive - but does not fail.
    extract: false

    # Relative path under $GITHUB_WORKSPACE to place the downloaded file(s)
    # It will create the target directory automatically if not present
    # eg: out-file-path: "my-downloads" => It will create directory $GITHUB_WORKSPACE/my-downloads
    out-file-path: ""

    # Github access token to download files from private repositories
    # https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
    # eg: token: ${{ secrets.MY_TOKEN }}
    token: ""

    # The URL of the Github API, only use this input if you are using Github Enterprise
    # Default: "https://api.github.com"
    # Use http(s)://[hostname]/api/v3 to access the API for GitHub Enterprise Server
    github-api-url: ""
```

#### Outputs variables

- `tag_name` it outputs the tag used to download a release.

> This variable can be used by other actions as an input as follows
> ```
> ${{steps.<step-id>.outputs.tag_name}}
> ```

## Scenarios

### Download asset from the latest release in the current repository

```yaml
- uses: hegerdes/gh-action-release-downloader@v1
  with:
    latest: true
    fileName: "foo.zip"
```

### Download asset from a specific release version.

```yaml
- uses: hegerdes/gh-action-release-downloader@v1
  with:
    repository: "owner/repo"
    tag: "v1.0.0"
    fileName: "foo.zip"
```

### Download all assets if more than one files are available

```yaml
- uses: hegerdes/gh-action-release-downloader@v1
  with:
    repository: "owner/repo"
    latest: true
    fileName: "*"
```

### Download assets using wildcard pattern

```yaml
- uses: hegerdes/gh-action-release-downloader@v1
  with:
    repository: "owner/repo"
    latest: true
    fileName: "*.deb"
```

## Contribute
Feel free to improve this action.

To develop you need:
 * NodeJS >=16.x
 * Python >=3.7

Setup the env
```bash
# Clone
git clone https://github.com/hegerdes/gh-action-release-downloader.git
cd gh-action-release-downloader && npm install

# Setup Git Hooks
pip install pre-commit
pre-commit install

# Build and share
npm run release
git commit -m "improve xxx"
```
