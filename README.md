# [oscarduignan.co.uk](http://oscarduignan.co.uk)

[![Build Status](https://img.shields.io/travis/oscarduignan/oscarduignan.co.uk.svg?style=flat-square)](https://travis-ci.org/oscarduignan/oscarduignan.co.uk)

## Run locally

Static assets
```
npm install
npm start
```

Content (requires hugo, see .travis.yml for example of how to grab it)
```
hugo server
```

(Or run both with `foreman start` if you have foreman installed)

Then open your browser to http://localhost:1313 and away you go

<hr>

If you want to build the assets for production instead to test that out then rather than `npm start` run `npm run build` hugo will need to rebuild the site after this happens, however this will happen automatically if you have `hugo server` running.

## Deploy changes

Anything pushed to github master get's automatically built and deployed by travis-ci. See https://travis-ci.org/oscarduignan/oscarduignan.co.uk for a build history.
