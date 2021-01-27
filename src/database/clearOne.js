import { Service } from 'ringcentral-chatbot/dist/models';
import log4js from 'log4js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});

const logger = log4js.getLogger(`CLEAR ONE `);

export const clearOne = async ({ userId, group }) => {
    logger.info(
        `Clearing [${{
            name: 'Announce',
            userId: userId,
            groupId: group.id,
        }}] DB`
    );
    let service = await Service.findOne({
        where: { name: 'Announce', userId: userId, groupId: group.id },
    });

    await service.destroy();

    logger.info('Announcement removed');
};
