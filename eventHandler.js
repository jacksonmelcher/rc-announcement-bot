import { createReminder } from "./createReminder";
import { Service } from "ringcentral-chatbot/dist/models";
import moment from "moment-timezone";

import { issueText, noArgsText, joinedGroup } from "./responses/index";

export const eventHandler = async (event) => {
    const { type } = event;

    switch (type) {
        case "Message4Bot":
            await handleMessage4Bot(event);

            break;
        case "BotJoinGroup":
            await handleBotJoinedGroup(event);
            break;
    }
};

const handleMessage4Bot = async (event) => {
    const { bot, group } = event;

    // FIXME Need to add some sort of check to see if the bot has been added to the groups already.

    const mode = await determineResponse(event);
    if (mode) {
        const message = await createReminder(event);
        if (!message) {
            await bot.sendMessage(group.id, {
                text: "Time has already happened",
            });
        } else {
            let reminderText = message.text;
            let timeCreated = message.timeCreated;
            let creator = message.creator;
            let creatorId = message.creatorId;
            let reminderTime = message.reminderTime;
            let duration = message.duration;
            let timezone = message.timezone;
            let teamMentions = message.teamMentions;
            const service = await Service.create({
                name: "Remind",
                botId: bot.id,
                groupId: group.id,
                userId: creatorId,
                data: {
                    reminderText,
                    timeCreated,
                    creator,
                    reminderTime,
                    duration,
                    timezone,
                    teamMentions,
                },
            });

            console.log(service.data.teamMentions);
            let teams = service.data.teamMentions.map((teamMention) => {
                return `![:Team](${teamMention.id}) `;
            });
            let tempTime = service.data.reminderTime;
            let timeConfirm = moment
                .tz(tempTime, service.data.timezone)
                .format("MMMM Do YYYY, h:mm a");

            // , you wil be reminded in ${service.data.duration.humanize()
            await bot.sendMessage(group.id, {
                text: `Reminder set, I  will send a reminder to ${
                    teams.length > 0 ? teams : `you`
                } on **${timeConfirm}**.\nHere is a preview:`,
                attachments: [
                    {
                        type: "Card",
                        text: `**${service.data.reminderText}**`,
                        footnote: {
                            text: `Reminder created by ${service.data.creator}`,
                        },
                    },
                ],
            });
        }
    }
};

const determineResponse = async (event) => {
    const { text, group, bot } = event;
    let args = [];
    if (typeof text !== "undefined") {
        args = text.split(" ");

        if (text === "-h" || text === "help" || text === "-help") {
            console.log("USER ASKED FOR HELP");
            await bot.sendMessage(group.id, joinedGroup);
        } else if (text === "-i" || text === "-issue" || text === "issue") {
            console.log("USER ISSUE");
            await bot.sendMessage(group.id, issueText);
        } else if (text === "clear") {
            console.log("CALLED CLEAR");
            await removeAll(event);
        } else if (text === "-l" || text === "-list" || text === "list") {
            console.log("CALLED LIST");
            await list(event);
        } else if (
            args[0] === "-r" ||
            args[0] === "-remove" ||
            args[0] === "remove"
        ) {
            console.log("CALLED REMOVE");
            await remove(args, event);
        } else if (args.indexOf("-t") === -1 || args.indexOf("-m") === -1) {
            console.log("NO -t OR -m");
            await bot.sendMessage(group.id, noArgsText);
        } else if (args.includes("-t") && args.includes("-m")) {
            return true;
        }
    } else {
        return false;
    }
};

const removeAll = async ({ userId }) => {
    const service = await Service.findAll({
        where: { name: "Remind", userId: userId },
    });

    if (service.length === 0) {
        return { text: "Array empty" };
    } else {
        for (let i = 0; i < service.length; i++) {
            // console.log("SERVICE: " + service[i].userId);
            await service[i].destroy();
        }
        return { text: "Cleared" };
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
        where: { name: "Remind", userId: userId, id: args[1] },
    });
    if (services.length === 0) {
        await bot.sendMessage(group.id, {
            text: "Could not find Reminder with that ID",
        });
    } else {
        let text = services[0].data.text;
        await services[0].destroy();
        return { text: `${text}  -  deleted.` };
    }
};
const list = async ({ bot, userId, group }) => {
    const services = await Service.findAll({
        where: { name: "Remind", userId: userId },
    });

    let tempArr = [];
    let tempField = {
        title: null,
        value: null,
        style: null,
    };

    if (services.length === 0) {
        await bot.sendMessage(group.id, { text: "No reminders" });
    } else {
        let sorted = services.sort(
            (a, b) => moment(a.data.reminderTime) - moment(b.data.reminderTime)
        );
        for (const s of sorted) {
            tempField = {
                title: moment
                    .tz(s.data.reminderTime, s.data.timezone)
                    .format("MMMM Do YYYY, h:mm a"),

                value: `*${s.data.reminderText}* \n**ID:** ${s.id.toString()}`,
                style: "Long",
            };
            tempArr.push(tempField);
        }

        await bot.sendMessage(group.id, {
            attachments: [
                {
                    type: "Card",
                    text: "**__Current Reminders__**",
                    fields: tempArr,
                    footnote: {
                        text: "Created and maintained by RC on RC",
                    },
                },
            ],
        });
    }
};

const handleBotJoinedGroup = async ({ group, bot }) => {
    await bot.sendMessage(group.id, joinedGroup);
};
