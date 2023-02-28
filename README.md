# RTF scheduler design and implementation

## Summary

RTF scheduler is a tool to execute any kind of active test (e.g. Playwright, DVAG Selenide or Ranorex) one-time or regularly and and transmit the results (e.g. metrics like success/failure of whole tests or duration of each test step) to monitoring backends like Azure Monitoring/Application Insights or Prometheus.  
It's not necessary to change the test scripts or to integrate an SDK - RTF scheduler captures events
from the tests. 

## Examples

This example uses curl as a simple testing tool to check if www.dvag.de is available and if the result contains the text "Datenschutzerklärung".
```
./rtf_scheduler -rtf test.dvagde -command "curl -v -L www.dvag.de" -rt "..run: ['Trying', 'Datenschutzerklärung']"
```
The standard output of the tool is in json format and shows the execution of this job. 
```json
{"level":"INFO","time":"2023-02-15T18:06:10.897+0100","caller":"rtf_scheduler/main.go:544","message":"rtf_scheduler v0.9.0 started, commandline [./rtf_scheduler -rtf test.dvagde -command curl -v -L www.dvag.de -rt ..run: ['Trying', 'Datenschutzerklärung']]"}
{"level":"INFO","time":"2023-02-15T18:06:10.916+0100","caller":"rtf_scheduler/main.go:663","message":"Starting job test.dvagde(0) exec #1 command curl -v -L www.dvag.de"}
{"level":"INFO","time":"2023-02-15T18:06:11.020+0100","caller":"rtf_scheduler/main.go:702","message":"job test.dvagde(0) exec #1 command curl -v -L www.dvag.de terminated successfully"}
```

While executing this test some telemetry data is transferred to an Application Insights instance real-time. Here are the results rendered in a chart:

![](images/Application%20Insights%20AvailabilityResults%202023-02-15%20at%2018.16.04.png)

The response time of the actual test is about 60ms, while the overall runtime of the test execution (= name of the RTF) is about 100ms.

Let's run this test 100 times starting a single test each 2 seconds:

```
./rtf_scheduler -cron "@every 2s" -limit 100 -rtf test.dvagde -command "curl -v -L www.dvag.de" -rt "..run: ['Trying', 'Datenschutzerklärung']"
```
The results? 

![](images/Application%20Insights%20AvailabilityResults%202023-02-15%20at%2018.35.20.png)

You get the idea ... but there is more:

This example starts a complex Playwright test (npx playwright test) for 3 headless browsers (Firefox, Chrome and Safari/Webkit)
with three parallel workers. The comprehensive pattern matching descriptions are obtained from a so-called capture model from a config file:
```
./rtf_scheduler -cron "@every 5s" -limit 100 -rtf test.playwright -command "npx playwright test" -capture playwright
```
![](images/Application%20Insights%20AvailabilityResults%202023-02-15%20at%2022.44.01.png)
![](images/Application%20Insights%20AvailabilityResults%202023-02-15%20at%2022.44.43.png)


## Usage

```
# Show command line help
rtf_scheduler -help

# Run rtf_scheduler with a configuration file named rtf_scheduler.yaml in the current directory
rtf_scheduler

# Run rtf_scheduler with a one-time job from the command line
# If a configuration file named rtf_scheduler.yaml exists in the current directory, certain parameters (like App Insights/Prometheus # configuration, scheduler configuration and (most important) capture models are loaded from the config file
rtf_scheduler -rtf "npx playwright test" -capture playwright
```

## Infrastructure

rtf_scheduler can be configured to deliver telemetry data to many target endpoints.

To test the delivery of measurement data the Application Insights instance appi-aktives-monitoring-ent-01 in the subscription monitoring-prod-01 (Instrumentation key 8cdb090b-bb46-4e0a-8dc8-4fa9f1b4f311) is required.

This Application Insights instance is used to verify the delivery of telemetry data during automated tests.

## Implementation toolchain / requirements

1. Go compiler and runtime libraries
    - Windows: winget install GoLang.Go.1.19
    - Mac: brew install go
    - Linux (apt): sudo apt-get install golang
2. Visual Studio Code
    - Windows: winget install Microsoft.VisualStudioCode
    - MacOS: brew install visual-studio-code
    - Linux (apt): 
        - wget https://go.microsoft.com/fwlink/?LinkID=760868
        - sudo apt-get install 
3. Go Extensions for Visual Studio Code
    - Golang and other extensions: Windows/Mac/Linux: 
        code --install-extension golang.go
        code --install-extension mohsen1.prettify-json
        code --install-extension (todo: makefile extension)
4. node.js, playwright and playwright test for embedded test scripts
    - Install node.js via the instructions [here](https://github.com/nodesource/distributions#installation-instructions)
    - Install node_modules via `npm ci`
    - Install playwright `npx playwright install`
    - Install packages needed by playwright `sudo npx playwright install-deps`  

5. An alternate approch to install Playwright to make sure all Go tests will pass is
    - Install node.js (see above)
    - Install latest version of playwright `npm init playwright@latest`
    - Required npm init settings are
      ```
      √ Do you want to use TypeScript or JavaScript? · TypeScript
      √ Where to put your end-to-end tests? · e2e
      √ Add a GitHub Actions workflow? (y/N) · false
      √ Install Playwright browsers (can be done manually via 'npx playwright install')? (Y/n) · true
      ```
    - Start test once with `npx playwright test` to check if the tests will pass


Beginning with release v0.9.0 the Go testing framework is used and automated release management via goreleaser is planned. Therefore it is important to use Angular commit message conventions. This means each commit message must start with
one of these prefixes:
* build: Describes a change to the build system without functional impact
* ci: Change to the CI configuration files or scripts
* docs: Change to the documentation without code change
* feat: Code change for a new feature
* fix: Code change for a bug fix
* perf: Code change to improve performance
* refactor: Code change that neither fixes a bug nor adds a feature
* test: Change to the test scripts (added tests, updated/improve tests, remove tests)

Example:
```
build: Introducing new build system with goreleaser
feat: Providing releases to download for the most relevant platforms
```
## Building from scratch

Building rtf_scheduler from the root of the local repo copy
```
go build -o rtf_scheduler
```
Building rtf_scheduler for a couple of relevant architectures (from a Linux or Mac OS Shell)
```
# Windows AMD/Intel 64-Bit
env GOOS=windows GOARCH=amd64 go build -o rtf_scheduler
# Windows AMD/Intel 32-Bit (not sure if necessary)
env GOOS=windows GOARCH=386 go build -o rtf_scheduler
# Linux AMD/Intel 64-Bit
env GOOS=linux GOARCH=amd64 go build -o rtf_scheduler
# Raspberry Pi (for probe usage)
env GOOS=linux GOARCH=arm go build -o rtf_scheduler
# Mac OS AMD/Intel 64-Bit
env GOOS=darwin GOARCH=amd64 go build -o rtf_scheduler
# Mac OS ARM 64-Bit (my favorite)
env GOOS=darwin GOARCH=arm64 go build -o rtf_scheduler
```

Building and installing rtf_scheduler to GOPATH directory
```
go install
```

To add the GOPATH directory to the user's PATH. This allows using go install and having the resulting executable system-wide. 
```
export PATH=$PATH::$(go env GOPATH)/bin
```

Update package supply chain. Required immediately if relevant security risks are discovered, but should also be done regularly, when the test suite for go test covers all aspects of the tool (see https://stackoverflow.com/questions/67201708/go-update-all-modules)
```
go get -u
go mod tidy
```

## Testing
There is a predefined set of test configurations in main_test.go, which can be used from the Visual Studio Test Explorer and by using go test / go tools. test_main.go
uses a small function runtest which redirects output and simulates several command lines. The test results are verified with regex over the output captured. 
```
# Runs the testsuite with all *_test.go tests
go test
# Runs the testsuite and displays the percentage of code covered by the tests
go test -cover
# Runs the testsuite, saves the coverage and renders the output to an html report which is displayed in the standard browser
go test -coverprofile=coverage.out && go tool cover -html=coverage.out
```

## RTF scheduler ingredients and related ToDos

RTF scheduler consists of

1. A cron-style scheduler component to configure jobs
1. A framework to allow the scheduler to act as a Windows service (works also on Mac and Linux)
1. Application Insights to send telemetry data
1. A pipe-like component to capture the output of scheduled processes, search for patterns and convert the result to App Insights Availability
1. TODO: Prometheus compatible scraper with capability to send data to a push gateway
1. DONE: Standalone running with CLI to specify and run jobs
1. TODO: Integrated embedded test scripts based on Yaegi (https://github.com/traefik/yaegi#readme), an embedded Go interpreter
1. TODO: A job-context to allow termination of jobs after a timeout occurs
1. TODO: An autologin handler to make sure GUI jobs are running in an interactive Windows session within a specified user context
1. TODO: A Windowstation component to control resolution and color depth of multiple user sessions
1. DONE: Improve searching for certain patterns in the test runner logs to convert them to more granular reference transactions
1. TODO: A job preparation check to verify if the correct versions of packages/installation for this job are installed 
1. DONE: Add tags to measurement information: customDimensions
1. TODO: Add browser extension to preview web reporting of embedded scripts and submit test reports to a blob storage
1. DONE: Add units tests for the most important functions
1. TODO: Add make/CI/CD to make sure the "npx playwright test" job runs correctly after a change (integration test), select a feasible makefile tool
1. DONE: Select a suitable logging framework (logrus, zap or glog), which supports Prometheus/Loki and App Insights logging and is capable to transport logs of test frameworks (e.g. playwright) also
1. DONE: if / else switch compacter (in scheduler)
1. TODO: Manage the version number in Git, see https://stackoverflow.com/questions/37814286/how-to-manage-the-version-number-in-git and https://github.com/semantic-release/semantic-release
## Useful links and implementation hints

* Command Reference for Go commands in VS Code
    - https://github.com/golang/vscode-go/wiki/commands#detailed-list

* Handling of yaml files
    - yaml configuration is unmarshalled 1:1 to config structs. Only fields
    with an uppercase first letter (exported fields) are initialized. The
    equivalent yaml elements must be all lowercase 
    - https://stackoverflow.com/questions/30947534/how-to-read-a-yaml-file
    - https://pkg.go.dev/gopkg.in/yaml.v3

* Using Application Insights Go SDK
    - https://medium.com/golang-with-azure/monitoring-golang-web-app-with-application-insights-a1d31db9e4e1
    - https://pkg.go.dev/github.com/microsoft/ApplicationInsights-Go/appinsights#pkg-overview

* Windows Service wrapper compatible with Linux and MacOS
    - https://github.com/judwhite/go-svc#go-svc

* Go cron-style Scheduler component
    - https://github.com/go-co-op/gocron/blob/v1.18.0/scheduler.go#L1232

* Exec engine with shell-like pipeline mechanism to control command execution
    - https://github.com/bitfield/script

* Configurable logging framework based on uber zap
    - https://github.com/uber-go/zap


## Program structure

main Package (main.go) -> central package which contains most of the code  
go.mod -> packages used by rtf_scheduler and version during build time  
go.sum -> package hash values for supply chain security (check-in and updates only allowed for build / deployment workflow)  
rtf_scheduler.yaml -> configuration file with exhaustive documentation
