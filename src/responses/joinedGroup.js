export const joinedGroup = {
    attachments: [
        {
            type: "Card",

            author: {
                name: "Reminder Bot",
            },
            title: "Instructions",
            text:
                "Hi, I am a reminder bot. I can be used to remind you, or a whole team, of events at a specified " +
                "time.\nTo use me for personal use, you can send me a direct message or add me to a team.",

            fields: [
                {
                    title: "Personal reminder instructions",
                    value:
                        "Send **@Reminder** a direct message with the syntax described below.",
                    style: "Long",
                },
                {
                    title: "Personal Reminder Syntax",
                    value:
                        "@Remind **-m** Your reminder message **-t** MM/DD/YYYY hh:mm am/pm",
                    style: "Long",
                },
                {
                    title: "Team reminder instructions",
                    value:
                        "Make sure **you and me** are added to the team you are trying to remind," +
                        " or the reminder will not send.",
                    style: "Long",
                },
                {
                    title: "Team Reminder Syntax",
                    value:
                        "@Reminder **@team1 @team2** -m Your reminder message -t MM/DD/YYYY hh:mm am/pm",
                    style: "Long",
                },

                {
                    title: "For help",
                    value: "@Reminder **help** or @Remind **-h**",
                    style: "Short",
                },
                {
                    title: "To submit a bug/issue",
                    value: "@Reminder **issue** or @Remind **-i**",
                    style: "Short",
                },
                {
                    title: "Clear ALL your existing reminders",
                    value: "@Reminder **clear** or @Remind **-c**",
                    style: "Short",
                },
                {
                    title: "List all active reminders",
                    value: "@Reminder **list** or @Remind **-l**",
                    style: "Short",
                },
            ],
            footnote: {
                text: "Created and maintained by RC on RC",
            },
        },
    ],
};
