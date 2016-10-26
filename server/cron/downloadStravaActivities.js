Cron.downloadStravaActitivities = function () {
    // Retrieve last activity from db
    var lastActivity = StravaActivities.findOne({}, {sort: {date: -1}});
    var params = {};
    if (lastActivity) {
        // Activity found, set after param
        params.after = lastActivity.date.getTime() / 1000;
    }

    // Call strava api
    Meteor.http.get(process.env.STRAVA_API_URL, {
            params: params,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.STRAVA_API_TOKEN
            }
        },
        function (err, response) {
            if (err) {
                console.log("An error occurred while downloading data from Strava");
                console.log(err);
                return;
            }
            var activities = response.data;
            var size = activities.length;

            console.log("Found " + size + " new activities");

            while (size--) {
                // Add activity to db
                StravaActivities.insert({
                    type: activities[size].type,
                    name: activities[size].name,
                    date: activities[size].start_date_local,
                    distance: activities[size].distance,
                    elapsedTime: activities[size].elapsed_time,
                    elevation: activities[size].total_elevation_gain,
                    stravaId: activities[size].id,
                    athlete: {
                        id: activities[size].athlete.id,
                        firstname: activities[size].athlete.firstname,
                        lastname: activities[size].athlete.lastname,
                        profile: activities[size].athlete.profile,
                        profileMedium: activities[size].athlete.profile_medium
                    }
                });
            }
        });
}

Meteor.setInterval(Cron.downloadStravaActitivities, process.env.STRAVA_REFRESH_INTERVAL);