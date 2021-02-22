import { Service, Bot } from 'ringcentral-chatbot/dist/models';
import cronParser from 'cron-parser';
import moment from 'moment-timezone';
import log4js from 'log4js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});
const logger = log4js.getLogger('ANNOUNCE');

const announce = async () => {
    let services = await Service.findAll({ where: { name: 'Announce' } });

    for (const s of services) {
        const currentTimestamp = moment
            .tz(new Date(), 'America/Los_Angeles')
            .seconds(0)
            .milliseconds(0);

        const interval = cronParser.parseExpression(s.data.expression, {
            tz: 'America/Los_Angeles',
        });

        const prevTimestamp = interval.prev()._date;

        if (currentTimestamp - prevTimestamp === 0) {
            const bot = await Bot.findByPk(s.botId);
            try {
                console.log(
                    'Reminded at: ' +
                        currentTimestamp.format('MMMM Do YYYY, h:mm:ss a')
                );
                let { data } = await bot.rc.get(
                    `restapi/v1.0/glip/teams/${s.groupId}`
                );
                let description = data.description;

                await bot.sendMessage(s.groupId, {
                    text: description,
                });
                const newinterval = moment.tz(
                    interval.next()._date.toString(),
                    'America/Los_Angeles'
                );
                console.log(
                    'Next reminder: ' +
                        newinterval.format('MMMM Do YYYY, h:mm:ss a')
                );
            } catch (e) {
                // catch the exception so that it won't break the for loop
                console.error(e);
            }
        }
    }
};

export default announce;
