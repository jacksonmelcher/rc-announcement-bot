export const joinedGroup = (description) => {
    return {
        attachments: [
            {
                type: 'Card',
                title: 'Instructions',
                text:
                    `Hi, I am a bot that posts your team description on a weekly basis (Every Monday at 10:00am PST).` +
                    `\n\nTo use me type **@Description Announcement enable**.` +
                    `\nTo disable notifications type **@Description Announcement disable** ` +
                    `\n\nDescription preview: **${description}**`,
                footnote: {
                    text:
                        'Created and maintained by RC on RC. Icon made by [Freepik](https://www.freepik.com) from [Flaticon](https://www.flaticon.com/)',
                },
            },
        ],
    };
};
