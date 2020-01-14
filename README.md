# docker-sm-automatic-restart
A docker image that alerts slack when an automated stream restart has taken place.

If you've provided a `streams.json` in the same directory as `index.json` or mount
it as a volume into your container, this script will look to see if there
is a stream that it can recreate from it. If it can, it will delete that existing
stream from primary and recreate it.

## requirements

* slack webhook url (https://api.slack.com/incoming-webhooks)
* node v10.16.3

## deployment
The following environment variables need to be provided for this to work:

* `SOURCE_URL` the /api/sources endpoint in StreamMachine. (Example: `http://streammachine_url/api/streams`)  If this endpoint is
in a private network, then this script needs to either run within that
network or have access to that endpoing.
* `WEBHOOK_URL` slack webhook URL. (Example: https://hooks.slack.com/services/LISAFRANK/BLAHBLAHUNICORNS124)

**optional**
This can be set up to run as a regular cronjob on a machine (`node index.js`),
or set up as a container running as a kubernetes cronjob.

## development
The meat of the script is in `index.js`