require("@dotenvx/dotenvx").config();
const { App, AwsLambdaReceiver } = require("@slack/bolt");

function getPSTDateString(date = new Date()) {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    };
    const [month, day, year] = new Intl.DateTimeFormat("en-US", options).format(date).split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver
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

app.command('/wordle-guess', async ({ ack, respond, command }) => {
    await ack();

    const userId = command.user_id;
    const guessWord = command.text.trim().split(/\s+/)[0]?.toLowerCase();

    if (!guessWord || guessWord.length !== 5 || !/^[a-z]+$/.test(guessWord)) {
        await respond("Please provide a valid 5-letter word. Example: `/wordle-guess words`");
        return;
    }

    const pstDate = getPSTDateString();
    try {
        const apiRes = await fetch("https://slack-wordle-api.vercel.app/api/slack-guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                guess: guessWord,
                timestamp: pstDate
            })
        });

        if (!apiRes.ok) {
            const errData = await apiRes.json();
            await respond(`Error: ${errData.error ?? apiRes.statusText}`);
            return;
        }

        const data = await apiRes.json();

        await respond(data);

    } catch (error) {
        await respond(`An error occurred: ${error.message}`);
    }
});

module.exports.handler = async (event, context, callback) => {
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}