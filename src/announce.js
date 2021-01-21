import { Service, Bot } from 'ringcentral-chatbot/dist/models';
import cronParser from 'cron-parser';
import moment from 'moment-timezone';

const announce = async () => {
    const every10Seconds = '*****';

    let services = await Service.findAll({ where: { name: 'cron' } });

    const [{ dataValues }] = await Bot.findAll();

    for (const s of services) {
        const bot = await Bot.findByPk(s.botId);
        const groupId = s.groupId;
        const currentTimestamp = moment
            .tz(
                new Date(),
                service.data.options.utc ? 'utc' : service.data.options.tz
            )
            .seconds(0)
            .milliseconds(0);
        // const currentTimestamp = moment.tz(new Date(), 'America/Los_Angeles');
        console.log('currentTimestamp :>> ', currentTimestamp.toString());
        const interval = cronParser.parseExpression('* * * * *', {
            utc: true,
        });
        console.log('currentTimestamp :>> ', currentTimestamp);
        const prevTimestamp = interval.prev()._date;

        console.log(currentTimestamp - prevTimestamp);
        if (currentTimestamp - prevTimestamp === 0) {
            const bot = await Bot.findByPk(s.botId);
            try {
                console.log('Reminded at: ' + currentTimestamp);
                // await bot.sendMessage(s.groupId, { text: s.data.message })
            } catch (e) {
                // catch the exception so that it won't break the for loop
                console.error(e);
            }
            console.log(currentTimestamp - prevTimestamp);

            // console.log(interval.next().toString());
        }
        // console.log('interval :>> ', interval.next().toString());
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
