require("@dotenvx/dotenvx").config();
const { App, AwsLambdaReceiver } = require("@slack/bolt");

const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver
});

app.message("hello", async ({ message, say }) => {
    await say(
        `Yo ID ${ message.user }. Your name is <@${ message.user }>.`
    );
});

app.message("help", async ({ message, say }) => {
   await say(
       `Hello <@${ message.user }>. This is the /help command.`
   );
});

app.message("play", async ({ message, say }) => {
    await say(
        `Hello <@${ message.user }>. This is the /play command.`
    );
});

app.message("leaderboard", async ({ message, say }) => {
    await say(
        `Hello <@${ message.user }>. This is the /leaderboard command.`
    );
});

app.message("button", async ({ message, say }) => {
    await say({
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Hey there <@${message.user}>!`,
                },
                accessory: {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Click Me',
                    },
                    action_id: 'button_click',
                },
            },
        ],
        text: `Hey there <@${message.user}>!`,
    });
});

app.command('/wordle-leaderboard', async ({ ack, respond }) => {
    await ack();

    try {
        const apiUrl = 'https://slack-wordle-api.vercel.app/api/game/leaderboard/viewAll';
        const res = await fetch(apiUrl);
        if (!res.ok) {
            throw new Error(`API error: ${ res.status } ${ res.statusText }`);
        }
        const data = await res.json();

        if (!data.leaderboard || data.leaderboard.length === 0) {
            await respond("No leaderboard data found for today.");
            return;
        }

        const leaderboardMsg = data.leaderboard
            .map((entry, idx) =>
                `*${idx + 1}.* <@${entry.userId}> — *${entry.score}* points (${entry.guessesCount} guesses)`
            ).join("\n");

        await respond(`🏆 *Today's Wordle Leaderboard* (${data.date}):\n${leaderboardMsg}`);

    } catch (error) {
        await respond(`Failed to fetch leaderboard: ${error.message}`);
    }
});

app.action('button_click', async ({ body, ack, say }) => {
    await ack();

    await say(`<@${body.user.id}> clicked the button`);
});

app.message('goodbye', async ({ message, say }) => {
    await say(`See ya later, <@${message.user}> :wave:`);
});

module.exports.handler = async (event, context, callback) => {
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}