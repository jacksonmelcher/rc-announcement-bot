import moment from "moment-timezone";
// import mmnt from "moment";

export const createReminder = async ({ text, bot, group, userId, message }) => {
    let args = text.split(" ");
    let reminder = {
        text: null,
        timeCreated: null,
        reminderTime: null,
        creator: null,
        groupId: null,
        duration: null,
        creatorId: null,
        timezone: null,
        teamMentions: [],
    };
    let resTimeArray = [];
    let resMessageArray = [];
    let username = "";
    let userTZ = "";
    console.log("===============ARGS===============");
    console.log(args);

    if (args.indexOf("-t") > args.indexOf("-m")) {
        console.log("Message came first");
        for (let i = args.indexOf("-m") + 1; i < args.indexOf("-t"); i++) {
            resMessageArray.push(args[i]);
        }
        for (let i = args.indexOf("-t") + 1; i < args.length; i++) {
            resTimeArray.push(args[i]);
        }
        console.log(resMessageArray);
    } else if (args.indexOf("-t") < args.indexOf("-m")) {
        console.log("Time came first");
        for (let i = args.indexOf("-t") + 1; i < args.indexOf("-m"); i++) {
            resTimeArray.push(args[i]);
        }
        for (let i = args.indexOf("-m") + 1; i < args.length; i++) {
            resMessageArray.push(args[i]);
        }
    } else {
        console.log("Something weird happened and message is null");
        reminder = null;
    }
    if (typeof bot !== "undefined") {
        try {
            let user = await bot.getUser(userId);
            console.log("============TimeZone============");
            let userTimezone = user.rc.regionalSettings.timezone.name;
            userTZ = userTimezone;
            console.log(userTZ);
            let { name } = user.rc;
            username = name;
        } catch (error) {
            console.log("GET USER ERROR: " + error + " name: " + username);
        }
    }
    if (
        moment.tz(userTZ) >=
        moment.tz(
            resTimeArray.toString().replace(/,/g, " "),
            "MM/DD/YY hh:mm a",
            userTZ
        )
    ) {
        console.log(
            "Time received: " +
                moment(
                    resTimeArray.toString().replace(/,/g, " "),
                    "MM/DD/YY hh:mm a",
                    "MM/DD/YY hh:mm a"
                ).format("MM/DD/YY hh:mm a")
        );
        console.log(
            "Current time: " + moment.tz(userTZ).format("MM/DD/YY hh:mm a")
        );

        console.log("Guessed timezone: " + moment.tz.guess());

        console.log("THE CURRENT TIME IS PAST THE TIME RECEIVED");
        return false;
    }
    const mentions = curateMentions(message.mentions);
    console.log("Mentions");

    console.log(mentions);
    reminder.teamMentions = mentions;
    reminder.creator = username;
    reminder.creatorId = userId;
    reminder.text = resMessageArray.toString().replace(/,/g, " ");
    reminder.timeCreated = moment.tz(userTZ);
    reminder.reminderTime = moment.tz(
        resTimeArray.toString().replace(/,/g, " "),
        "MM/DD/YY hh:mm a",
        userTZ
    );
    reminder.groupId = group.id;
    reminder.duration = moment.duration(
        reminder.reminderTime.diff(moment.timeCreated)
    );
    reminder.timezone = userTZ;
    console.log("Message being returned");
    console.log("Team Mentions: " + reminder.teamMentions);
    console.log("Creator: " + reminder.creator);
    console.log("CreatorID: " + reminder.creatorId);
    console.log("GroupID: " + reminder.groupId);

    console.log("Text: " + reminder.text);
    console.log(
        "Time Created: " + reminder.timeCreated.format("MM/DD/YY hh:mm a")
    );
    console.log(
        "Reminder time: " + reminder.reminderTime.format("MM/DD/YY hh:mm a")
    );
    console.log("Duration: " + reminder.duration);
    console.log("Timezone: " + reminder.timezone);
    console.log("Creator: " + reminder.creator);

    return reminder;
};

const curateMentions = (mentions) => {
    let temp = [];
    for (let m in mentions) {
        if (mentions[m].type === "Team") {
            temp.push(mentions[m]);
        }
    }

    return temp;
};
