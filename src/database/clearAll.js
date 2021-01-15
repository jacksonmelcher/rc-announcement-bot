import { Service } from 'ringcentral-chatbot/dist/models';
import log4js from 'log4js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});

export const clearAll = async ({ bot }) => {
    const logger = log4js.getLogger(`CLEAR `);
    logger.info(`Clearing [${bot.id}] DB`);
    let service = await Service.destroy({
        where: {
            botId: bot.id,
        },
    });
    logger.info(`Cleared [${service}] item(s).`);
};
