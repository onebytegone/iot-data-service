# IoT Data Service

![Version](https://img.shields.io/github/package-json/v/onebytegone/iot-data-service.svg?style=flat)
[![License](https://img.shields.io/github/license/onebytegone/iot-data-service.svg)](./LICENSE)
[![Build Status](https://travis-ci.com/onebytegone/iot-data-service.svg?branch=master)](https://travis-ci.com/onebytegone/iot-data-service)
[![Coverage Status](https://coveralls.io/repos/github/onebytegone/iot-data-service/badge.svg?branch=master)](https://coveralls.io/github/onebytegone/iot-data-service?branch=master)
[![Dependency Status](https://david-dm.org/onebytegone/iot-data-service.svg)](https://david-dm.org/onebytegone/iot-data-service)
[![Dev Dependency Status](https://david-dm.org/onebytegone/iot-data-service/dev-status.svg)](https://david-dm.org/onebytegone/iot-data-service#info=devDependencies&view=table)

## What?

_TODO: Fill in_

## Why?

_TODO: Fill in_

## Setup

```
git clone git@github.com:onebytegone/iot-data-service.git
cd iot-data-service
npm install
pushd ./services/feed-data-storage && sls deploy && popd
cp ./services/feed-api/vars/example.yml ./services/feed-api/vars/dev.yml
vi ./services/feed-api/vars/dev.yml # and change the JWT signing key
pushd ./services/feed-api && sls deploy && popd
```

## Usage

_TODO: Write docs_

### POSTing data

```
curl -v "https://${APIGW_API_ID}.execute-api.us-east-1.amazonaws.com/dev/feed/FEED_NAME/FACET_NAME" -H "Authorization: Bearer ${JWT}" --data-binary '{ "value": 5 }' -H 'Content-Type: application/json'
```

## License

This software is released under the MIT license. See [the license
file](LICENSE) for more details.
