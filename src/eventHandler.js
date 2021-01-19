import { Service, Bot } from 'ringcentral-chatbot/dist/models';
import moment from 'moment-timezone';
import { findTeam, createTeam, clearAll } from './database/index';
import log4js from 'log4js';
import cron from 'node-cron';

log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
});
const logger = log4js.getLogger('CREATE PROFILE');

export const eventHandler = async (event) => {
    const { type } = event;

    switch (type) {
        case 'Message4Bot':
            await handleMessage4Bot(event);
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

    service = await findTeam(group.id);

    let args = text.split(' ');
    logger.info(`Args [ ${args} ]`);
    switch (text.toLowerCase()) {
        case 'enable':
            console.log('STARTING CRON');
            const task = cron.schedule(
                '*/10 * * * * *',
                () => {
                    console.log('HEY MAN');
                },
                {
                    scheduled: false,
                }
            );

            await Service.create({
                name: `cron`,
                groupId: group.id,
                botId: bot.id,
                data: {
                    task: task,
                },
            });
            task.start();
            // if (service !== null) {
            //     logger.info(`User already exists`);
            //     return {
            //         text: 'Automated announcements are already enabled',
            //     };
            // }
            // let res = await bot.rc.get(`restapi/v1.0/glip/teams/${group.id}`);
            // console.log(res.data);

            // await createTeam(event, res.data.description);

            // return {
            //     text: 'Automatic message notifications have been enabled.',
            // };
            break;
        case 'disable':
            logger.trace('Case [DISABLE]');
            const { dataValues } = await Service.findOne({
                where: { name: 'cron' },
            });

            console.log('temp :>> ', dataValues.data);

            dataValues.data.stop();
            console.log('task stopped');
            // await clearTeam(group.name, group.id);
            // response = {
            //     text: 'Freshservice notifications have been disabled.',
            // };

            break;
        case 'clear':
            await clearAll(event);
        default:
            logger.warn(`Not a valid command: ${text}`);
            response = { text: 'Command not valid' };
    }
    return response;
};

const determineResponse = async (event) => {
    const { text, group, bot } = event;
    let args = [];
    if (typeof text !== 'undefined') {
        args = text.split(' ');
        if (text === 't') {
            await handleBotJoinedGroup(event);
        }
    } else {
        return false;
    }
};

const removeAll = async ({ userId }) => {
    const service = await Service.findAll({
        where: { name: 'Remind', userId: userId },
    });

    if (service.length === 0) {
        return { text: 'Array empty' };
    } else {
        for (let i = 0; i < service.length; i++) {
            // console.log("SERVICE: " + service[i].userId);
            await service[i].destroy();
        }
        return { text: 'Cleared' };
    }
};
const clear = async ({ bot, userId }) => {
    const res = await removeAll(userId);
    await bot.sendMessage(group.id, res);
};

const remove = async (args, { bot, group, userId }) => {
    if (args[1] === undefined) {
        return {
            text: "Please add an ID number.Type **@Remind -l** to view ID's",
        };
    }
    const services = await Service.findAll({
        where: { name: 'Remind', userId: userId, id: args[1] },
    });
    if (services.length === 0) {
        await bot.sendMessage(group.id, {
            text: 'Could not find Reminder with that ID',
        });
    } else {
        let text = services[0].data.text;
        await services[0].destroy();
        return { text: `${text}  -  deleted.` };
    }
};
const list = async ({ bot, userId, group }) => {
    const services = await Service.findAll({
        where: { name: 'Remind', userId: userId },
    });

    let tempArr = [];
    let tempField = {
        title: null,
        value: null,
        style: null,
    };

    if (services.length === 0) {
        await bot.sendMessage(group.id, { text: 'No reminders' });
    } else {
        let sorted = services.sort(
            (a, b) => moment(a.data.reminderTime) - moment(b.data.reminderTime)
        );
        for (const s of sorted) {
            tempField = {
                title: moment
                    .tz(s.data.reminderTime, s.data.timezone)
                    .format('MMMM Do YYYY, h:mm a'),

                value: `*${s.data.reminderText}* \n**ID:** ${s.id.toString()}`,
                style: 'Long',
            };
            tempArr.push(tempField);
        }

        await bot.sendMessage(group.id, {
            attachments: [
                {
                    type: 'Card',
                    text: '**__Current Reminders__**',
                    fields: tempArr,
                    footnote: {
                        text: 'Created and maintained by RC on RC',
                    },
                },
            ],
        });
    }
};

const handleBotJoinedGroup = async (event) => {
    const { bot, group } = event;

    let res = await bot.rc.get(`restapi/v1.0/glip/teams/${group.id}`);
    console.log(res.data);
    await bot.sendMessage(group.id, {
        text: `This is a preview of the announcement: \n\n${res.data.description}`,
    });
};
