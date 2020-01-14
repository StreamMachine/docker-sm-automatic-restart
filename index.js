const http = require('http');

const SOURCE_URL = process.env.SOURCE_URL;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PREPEND_MESSAGE = ':arrows_counterclockwise:';

// JSON file that contains the body to POST to streammachine when creating streams.
const streamsJson = require('./streams.json');

/* Start: helper functions */
const notify = function(message) {
  const data = JSON.stringify({
    text: `${PREPEND_MESSAGE} ${message}`
  });
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(WEBHOOK_URL, options, (resp) => {
  });

  req.on('error', (error) => {
    console.error("Error posting to slack:");
    console.error(error);
  });

  req.write(data);
  req.end();
};

const createStream = function(streamKey) {
  const config = JSON.stringify(streamsJson[streamKey]);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': config.length
    }
  };

  const req = http.request(SOURCE_URL, options, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      console.log(data)
    });
  });

  req.on('error', (error) => {
    console.error("Error creating to stream: " + streamKey);
    console.error(error);
  });


  req.write(config);
  req.end();
};

const recreateStream = function(streamKey) {
  console.log(`deleting stream: ${streamKey}`);
  const deleteUrl = `${SOURCE_URL}/${streamKey}`;
  const options = {
    method: 'DELETE'
  };

  const req = http.request(deleteUrl, options, (resp) => {
    resp.on('data', () => {
      createStream(streamKey);
    });
  });
  req.end();
};
/* End: helper functions */


// Check if we have the necessary environment variables
if (SOURCE_URL === undefined) {
  console.error("No SOURCE_URL");
  return;
} else if (WEBHOOK_URL === undefined) {
  console.error("No WEBHOOK_URL");
  return;
}

// Collect all the streams and begin recreating them
http.get(SOURCE_URL, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    let notify_body = [];
    const body = JSON.parse(data);
    if (body.length === 0) {
      notify_body.push("No streams found.");
      return;
    }
    body.forEach((stream) => {
      const source = stream.source;
      if (source === undefined) {
        notify_body.push(`No source for: ${stream.key}`);
        return;
      }

      if (streamsJson[stream.key] !== undefined) {
        recreateStream(stream.key);
        notify_body.push(`Stream \`${stream.key}\` has been automatically recreated.`);
      }

    });
    if (notify_body.length > 0) {
      notify(notify_body.join("\n"));
    }
  });
}).on("error", (err) => {
  notify(err.message);
});