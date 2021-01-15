import { Service } from 'ringcentral-chatbot/dist/models';
import log4js from 'log4js';
log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});
const logger = log4js.getLogger('LOOKING FOR TEAM');

export const findTeam = async (id) => {
    try {
        const service = await Service.findOne({
            where: {
                groupId: id,
            },
        });

        if (service === null) {
            logger.fatal(`Cannot find [${id}] in database`);
            return null;
        }
        logger.info(`User/team found.`);
        return service;
    } catch (e) {
        logger.fatal(e);
        return;
    }
};
