const { autoUpdate: { branch } } = require('../config.json');
const chalk = require('chalk');
const Logger = require('../util/Logger.js');
let { exec, spawnSync } = require('child_process');
const util = require('util');
exec = util.promisify(exec);
const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

const logger = new Logger('Webhook');

class WebhookListener {
  
  constructor(client) {
    this.client = client;
  }

  start = function() {
    const PORT = 3000;
    const sigHeaderName = 'X-Hub-Signature-256';
    const sigHashAlg = 'sha256';
    const app = express();

    logger.log('Starting WebHookListener')

    app.use(express.json({ 
      verify: (req, res, buf, encoding) => {
        if (buf?.length) {
          req.rawBody = buf.toString(encoding || 'utf8');
        } 
      }
    }));

    function verifyPostData(req, res, next) {
      if (!req.rawBody) {
        return next('Request body empty');
      }

      const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
      const hmac = crypto.createHmac(sigHashAlg, process.env.SECRET);
      const digest = Buffer.from(`${sigHashAlg}=${hmac.update(req.rawBody).digest('hex')}`, 'utf8' )
      if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`)
      }

      return next();
    }

    app.post('/hook', verifyPostData, async (req, res) => {
      res.status(200).send('Request body was signed!');

      const body = JSON.parse(req.rawBody);
      if (body.ref !== `refs/heads/${branch}`) {
        return logger.log(`Ignoring merge on branch: ${body.ref}`)
      }

      logger.log('Github webhook received.');
      try {
        runCommand('git remote update');
        runCommand(`git reset --hard origin/${branch}`);
        runCommand('npm install');
        runCommand('npm audit fix');
        logger.log('Updated to new commit from Github!')
      } catch(err) {
        logger.error(err);
      }
    
      this.client.stop();
    });

    app.use((err, req, res, next) => {
      if (err) logger.error(err);
      res.status(403).send('Request body was not signed or verification failed!');
    })

    app.all('*', (req, res) => res.status(404).end());

    app.listen(PORT, async () => {
      logger.log(`Listening on ${PORT}`);
    });
  }
}

// async function runCommand(command) {
//   console.log(chalk.cyan(command));
//   const { stdout, stderr } = await exec(command);
//   if (stdout)
//     console.log(stdout);
//   if (stderr)
//     console.error(stderr);
// }

function runCommand(command) {
  console.log(chalk.cyan(command));
  const { output, stdout, stderr, err } = spawnSync(command);
  if (err)
    console.error(err);
  if (stderr)
    console.error(stderr);
  if (stdout)
    console.error(stdout);
  console.error(output);
}

module.exports = WebhookListener;