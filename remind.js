import { Service, Bot } from "ringcentral-chatbot/dist/models";

import moment from "moment-timezone";

const remind = async () => {
    let services = [];
    let sorted = [];
    services = await Service.findAll({ where: { name: "Remind" } });

    if (services.length > 0) {
        sorted = services.sort(
            (a, b) => moment(a.data.reminderTime) - moment(b.data.reminderTime)
        );

        if (moment() >= moment(sorted[0].data.reminderTime)) {
            let id = sorted[0].id;
            let groupId = sorted[0].groupId;
            let text = sorted[0].data.reminderText;
            let botId = sorted[0].botId;
            let creator = sorted[0].data.creator;
            let mentions = sorted[0].data.teamMentions;

            let tempService = await Service.findByPk(id);
            console.log("Sending Message from reminder loop");

            const bot = await Bot.findByPk(botId);
            if (mentions.length > 0) {
                for (const m of mentions) {
                    if (m.type === "Team") {
                        try {
                            await bot.sendMessage(m.id, {
                                attachments: [
                                    {
                                        type: "Card",
                                        text: `**${text}**`,
                                        footnote: {
                                            text: `Reminder created by ${creator}`,
                                        },
                                    },
                                ],
                            });
                        } catch (error) {
                            await bot.sendMessage(groupId, {
                                text: `${error.data.message}: ${m.name}`,
                            });
                            console.log(error);
                        }
                    }
                }
            } else
                try {
                    await bot.sendMessage(groupId, {
                        attachments: [
                            {
                                type: "Card",
                                text: `**${text}**`,
                                footnote: {
                                    text: `Reminder created by ${creator}`,
                                },
                            },
                        ],
                    });
                } catch (error) {
                    console.log(error);
                    await bot.sendMessage(groupID, {
                        text: "There was a problem creating the reminder",
                    });
                }

            sorted.shift();

            await tempService.destroy();

            services = await Service.findAll({ where: { name: "Remind" } });
        }
    } else {
        return;
    }
};

export default remind;
