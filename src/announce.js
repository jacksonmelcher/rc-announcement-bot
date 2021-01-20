import { Service, Bot } from 'ringcentral-chatbot/dist/models';
import cronParser from 'cron-parser';
import moment from 'moment-timezone';

const announce = async () => {
    const every10Seconds = '*/10 * * * * *';

    const [{ dataValues }] = await Bot.findAll();

    let services = await Service.findAll({ where: { name: 'cron' } });
    console.log(services.length);

    for (const s of services) {
        const interval = cronParser.parseExpression(
            s.data.expression,
            s.data.options
        );
        const currentTimestamp = moment
            .tz(new Date(), s.data.options.utc ? 'utc' : s.data.options.tz)
            .seconds(0)
            .milliseconds(0);
        const prevTimestamp = interval.prev()._date;

        if (currentTimestamp - prevTimestamp === 0) {
            console.log('REMINDER!');
            await remove(710754310);
        }
    }
};

async function remove(userId, groupId) {
    let service = await Service.findOne({
        where: { name: 'cron' },
    });

    await service.destroy();

    console.log('Reminder removed');
}

export default announce;
