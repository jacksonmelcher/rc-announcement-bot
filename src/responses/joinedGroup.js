export const joinedGroup = (description) => {
    return {
        attachments: [
            {
                type: 'Card',
                title: 'Instructions',
                text:
                    'Hi, I am a bot that posts your team description on a weekly basis (Every Monday at 10:00am PST). \n\nTo use me type **@Descritpion Reminder enable**.\n To disable notifications type **@Descritpion Reminder disable** ',

                footnote: {
                    text:
                        'Created and maintained by RC on RC. Icon made by [Freepik](https://www.freepik.com) from https://www.flaticon.com/',
                },
            },
        ],
    };
};
