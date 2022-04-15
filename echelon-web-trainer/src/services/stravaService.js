import axios from "axios";
import { quantile, average } from "./utilities.js";
import { calculateFTP, calculateTSS, calculateFeatures, calculateWeight } from "./calculateFeatures.js";

const { REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET } = process.env;

export const getParamValues = (url) => {
  return url
    .slice(1)
    .split("&")
    .reduce((prev, curr) => {
      const [title, value] = curr.split("=");
      prev[title] = value;
      return prev;
    }, {});
};

export const cleanUpAuthToken = (str) => {
  return str.split("&")[1].slice(5);
};

export const testAuthGetter = async (authTok) => {
  try {
    const response = await axios.post(
      `https://www.strava.com/api/v3/oauth/token?client_id=${REACT_APP_CLIENT_ID}&client_secret=${REACT_APP_CLIENT_SECRET}&code=${authTok}&grant_type=authorization_code`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserData = async (strava) => {
  var hrArray = [];
  var activityArray = [];
  try {
    const page1 = await strava.athlete.listActivities({ page: 1 });
    const page2 = await strava.athlete.listActivities({ page: 2 });
    const page3 = await strava.athlete.listActivities({ page: 3 });

    for (const idx in page1) {
      var rideHR = page1[idx]["max_heartrate"];
      if (page1[idx]["device_watts"] && !isNaN(rideHR)) {
        activityArray.push(page1[idx]["id"]);
      }
      if (!isNaN(rideHR)) {
        hrArray.push(rideHR);
      }
    }
    for (const idx in page2) {
      if (page2[idx]["device_watts"]) {
        activityArray.push(page2[idx]["id"]);
      }
      var rideHR = page1[idx]["max_heartrate"];
      if (!isNaN(rideHR) && !isNaN(rideHR)) {
        hrArray.push(rideHR);
      }
    }
    for (const idx in page3) {
      if (page2[idx]["device_watts"]) {
        activityArray.push(page2[idx]["id"]);
      }
      var rideHR = page1[idx]["max_heartrate"];
      if (!isNaN(rideHR) && !isNaN(rideHR)) {
        hrArray.push(rideHR);
      }
    }
    var maxHR = quantile(hrArray, 0.95);

    var [FTP, TSS, weight] = await getStreams(strava, activityArray, maxHR);
    var avgFTP = Math.floor(average(FTP));
    var CTL = Math.floor(average(TSS));
    var avgWeight = Math.floor(average(weight));

    return [maxHR, avgFTP, CTL, avgWeight];
  } catch (error) {
    console.log(error);
  }
};

const getStreams = async (strava, activityArray, maxHR) => {
  var types = ["time", "distance", "heartrate", "watts", "altitude", "velocity_smooth"];
  var MLFeatures = [];
  var weight = [];
  var FTPArray = [];
  var TSS = [];
  var weight = [];
  try {
    for (var idx = 0; idx < 10; idx++) {
      const ride = await strava.streams.activity({
        id: activityArray[idx],
        types: types,
        resolution: "low",
      });
      var time = ride["5"]["data"];
      var speed = ride["1"]["data"];
      var distance = ride["2"]["data"];
      var heartrate = ride["4"]["data"];
      var watts = ride["0"]["data"];
      var elevation = ride["3"]["data"];

      var features = calculateFeatures(watts, heartrate, time, maxHR);

      weight.push(
        calculateWeight(
          elevation[elevation.length - 1],
          elevation[0],
          average(speed),
          quantile(watts, 0.5),
          distance[distance.length - 1]
        )
      );
      var FTP = parseInt(calculateFTP(features));
      FTPArray.push(FTP);
      TSS.push(calculateTSS(FTP, features[4], features[2]));
    }
    return [FTPArray, TSS, weight];
  } catch (error) {
    console.log(error);
  }
};
