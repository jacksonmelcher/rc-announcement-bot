import { Service } from 'ringcentral-chatbot/dist/models';
import { findTeam, createSchedule, clearAll, clearOne } from './database/index';
import log4js from 'log4js';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});

const logger = log4js.getLogger('EVENT HANDLER');
const onceAWeek = '0 10 * * 1';
const onceAMinute = '* * * * * *';
const tokens = onceAMinute.split(/\s+/);
const expression = tokens.slice(0, 5).join(' ');

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
    let res = 'Cant find description.';
    try {
        res = await bot.rc.get(`restapi/v1.0/glip/teams/${group.id}`);
    } catch {
        res = 'Cant find description.';
    }

    let args = text.split(' ');
    logger.info(`Args [ ${args} ]`);
    switch (text.toLowerCase()) {
        case 'ping':
            response = { text: 'pong' };
            break;
        case 'enable':
            logger.trace('Case [ENABLE]');
            const onceAWeek = '0 10 * * 1';
            const weekToken = onceAWeek.split(/\s+/);
            const weekExpression = weekToken.slice(0, 5).join(' ');

            service = await findTeam(group.id);
            if (service !== null) {
                logger.info(`User already exists`);
                response = {
                    text:
                        'Description notifications have already been enabled for this team.',
                };
            } else {
                await createSchedule(
                    event,
                    weekExpression,
                    res.data.description,
                    {
                        utc: true,
                    }
                );
                response = {
                    text: `Description notifications have been enabled. This is a preview of the announcement: \n\n${res.data.description}`,
                };
                break;
            }
        case 'enable test':
            logger.trace('Case [ENABLE TEST]');
            const onceAMinute = '* * * * * *';
            const minuteTokens = onceAMinute.split(/\s+/);
            const minuteExpression = minuteTokens.slice(0, 5).join(' ');

            service = await findTeam(group.id);
            if (service !== null) {
                logger.info(`User already exists`);
                response = {
                    text:
                        'Description notifications have already been enabled for this team.',
                };
            } else {
                await createSchedule(
                    event,
                    minuteExpression,
                    res.data.description,
                    {
                        utc: true,
                    }
                );
                response = {
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

            await clearOne(event);
            console.log('task stopped');
            // await clearTeam(group.name, group.id);
            response = {
                text: 'Announcement notifications have been disabled.',
            };

            break;
        case 'clear':
            logger.trace('Case [CLEAR]');
            logger.warn('Clearing.....');
            await clearAll(event);
            response = { text: 'Everything cleared.' };
            break;
        default:
            logger.warn(`Not a valid command: ${text}`);
            response = { text: 'Command not valid' };
            break;
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
            `Hi, I'm announcement bot. I will announce the team description every Monday at 10:00 am PST.` +
            `This is a preview of the announcement: \n\n${res.data.description}. ` +
            `\n \n Customization of anouncements and times will be coming in the future.`,
    });
};
