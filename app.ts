require('@dotenvx/dotenvx').config();
const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
    await app.start(process.env.PORT || 3000);

    app.logger.info('⚡️ Bolt app is running!');
})();