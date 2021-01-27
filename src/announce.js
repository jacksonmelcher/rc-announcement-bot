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

    const [{ dataValues }] = await Bot.findAll();

    for (const s of services) {
        const currentTimestamp = moment
            .tz(new Date(), 'America/Los_Angeles')
            .seconds(0)
            .milliseconds(0);

        const interval = cronParser.parseExpression(s.data.expression, {
            tz: 'America/Los_Angeles',
        });

        console.log('EXPRESSION: ' + s.data.expression);

        const prevTimestamp = interval.prev()._date;

        console.log(
            'Loop time: ' + currentTimestamp.format('MMMM Do YYYY, h:mm:ss a')
        );
        if (currentTimestamp - prevTimestamp === 0) {
            const bot = await Bot.findByPk(s.botId);
            try {
                console.log(
                    'Reminded at: ' +
                        currentTimestamp.format('MMMM Do YYYY, h:mm:ss a')
                );
                await bot.sendMessage(s.groupId, { text: s.data.message });
            } catch (e) {
                // catch the exception so that it won't break the for loop
                console.error(e);
            }
        }

        const newinterval = moment.tz(
            interval.next()._date.toString(),
            'America/Los_Angeles'
        );
        console.log(
            'Next reminder: ' + newinterval.format('MMMM Do YYYY, h:mm:ss a')
        );
    }
};

export default announce;
