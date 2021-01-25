import { Service, Bot } from 'ringcentral-chatbot/dist/models';
import moment from 'moment-timezone';
import { findTeam, createSchedule, clearAll } from './database/index';
import log4js from 'log4js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});
const logger = log4js.getLogger('CREATE PROFILE');
const args = '0 10 * * 1';
const tokens = args.split(/\s+/);
const expression = tokens.slice(0, 5).join(' ');
console.log('expression :>> ', expression);

export const eventHandler = async (event) => {
    const { type, bot, group } = event;

    switch (type) {
        case 'Message4Bot':
            let response = await handleMessage4Bot(event);
            await bot.sendMessage(group.id, response);
            break;
        case 'BotJoinGroup':
            await handleBotJoinedGroup(event);
            break;
    }
};

const handleMessage4Bot = async (event) => {
    const { text, group, bot } = event;
    let service = null;
    let response = 'default';

    let res = await bot.rc.get(`restapi/v1.0/glip/teams/${group.id}`);

    service = await findTeam(group.id);
    console.log('event :>> ', event);

    let args = text.split(' ');
    logger.info(`Args [ ${args} ]`);
    switch (text.toLowerCase()) {
        case 'enable':
            logger.trace('Case [ENABLE]');
            if (service !== null) {
                logger.info(`User already exists`);
                response = {
                    text:
                        'Description notifications have already been enabled for this team.',
                };
            } else {
                await createSchedule(
                    event,
                    expression,
                    'This is a test message',
                    { utc: true }
                );
                return {
                    text: `Description notifications have been enabled. This is a preview of the announcement: \n\n${res.data.description}`,
                };
            }

            break;
        case 'disable':
            logger.trace('Case [DISABLE]');
            const { dataValues } = await Service.findOne({
                where: { name: 'Announce' },
            });

            console.log('temp :>> ', dataValues.data);

            await remove(event);
            console.log('task stopped');
            // await clearTeam(group.name, group.id);
            response = {
                text: 'Announcement notifications have been disabled.',
            };

            break;
        case 'clear':
            await clearAll(event);
        default:
            logger.warn(`Not a valid command: ${text}`);
            response = { text: 'Command not valid' };
    }
    return response;
};

// const remove = async (args, { bot, group, userId }) => {
//     if (args[1] === undefined) {
//         return {
//             text: "Please add an ID number.Type **@Remind -l** to view ID's",
//         };
//     }
//     const services = await Service.findAll({
//         where: { name: 'Remind', userId: userId, id: args[1] },
//     });
//     if (services.length === 0) {
//         await bot.sendMessage(group.id, {
//             text: 'Could not find Reminder with that ID',
//         });
//     } else {
//         let text = services[0].data.text;
//         await services[0].destroy();
//         return { text: `${text}  -  deleted.` };
//     }
// };

// const list = async ({ bot, userId, group }) => {
//     const services = await Service.findAll({
//         where: { name: 'Remind', userId: userId },
//     });

//     let tempArr = [];
//     let tempField = {
//         title: null,
//         value: null,
//         style: null,
//     };

//     if (services.length === 0) {
//         await bot.sendMessage(group.id, { text: 'No reminders' });
//     } else {
//         let sorted = services.sort(
//             (a, b) => moment(a.data.reminderTime) - moment(b.data.reminderTime)
//         );
//         for (const s of sorted) {
//             tempField = {
//                 title: moment
//                     .tz(s.data.reminderTime, s.data.timezone)
//                     .format('MMMM Do YYYY, h:mm a'),

//                 value: `*${s.data.reminderText}* \n**ID:** ${s.id.toString()}`,
//                 style: 'Long',
//             };
//             tempArr.push(tempField);
//         }

//         await bot.sendMessage(group.id, {
//             attachments: [
//                 {
//                     type: 'Card',
//                     text: '**__Current Reminders__**',
//                     fields: tempArr,
//                     footnote: {
//                         text: 'Created and maintained by RC on RC',
//                     },
//                 },
//             ],
//         });
//     }
// };

const handleBotJoinedGroup = async (event) => {
    const { bot, group } = event;

    let res = await bot.rc.get(`restapi/v1.0/glip/teams/${group.id}`);
    console.log(res.data);
    await bot.sendMessage(group.id, {
        text:
            `Hi, I'm announcement bot. I will announce the team description every Monday at 10:00 am PST. ` +
            `This is a preview of the announcement: \n\n${res.data.description}`,
    });
};

async function remove({ userId, group }) {
    let service = await Service.findOne({
        where: { name: 'Announce', userId: userId, groupId: group.id },
    });

    await service.destroy();

    console.log('Reminder removed');
}
