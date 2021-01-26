import { Service } from 'ringcentral-chatbot/dist/models';
import log4js from 'log4js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});
const logger = log4js.getLogger('CREATE SCHEDULE');

export const createSchedule = async (event, expression, message, options) => {
    const { bot, group, userId } = event;

    logger.info('CREATING PROFILE ......');

    await Service.create({
        name: `Announce`,
        groupId: group.id,
        botId: bot.id,
        userId: userId,
        data: {
            expression,
            message,
            options,
        },
    });

    logger.info('PROFILE CREATED.');
};
