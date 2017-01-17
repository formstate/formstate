console.log("--running publish--");

const ghpages = require('gh-pages');
const path = require('path');
const date = new Date();

const demoSrc = path.resolve(__dirname + '/../../demo');
const demoBuilt = path.resolve(__dirname + '/../../docs');

import * as fse from "fs-extra";
fse.copySync(demoSrc, demoBuilt);


ghpages.publish(demoBuilt, {
  message: `[ci skip] deployment (${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}-${date.getUTCHours()}-${date.getUTCMinutes()})`,

  /** Branch */
  branch: 'master',
  repo: 'https://' + process.env.GH_TOKEN + '@github.com/formstate/formstate.github.io.git',

  /** User */
  user: {
    name: 'basarat',
    email: 'basarat@example.com'
  }
}, (err) => {
  if (err) {
    console.log('--publish failed!--', err)
    return;
  }
  console.log("--publish done--");
});
