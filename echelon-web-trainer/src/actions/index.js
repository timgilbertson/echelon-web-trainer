export const setUserActivities = (data) => {
  return {
    type: "SET_USER_ACTIVITIES",
    payload: data,
  };
};

export const setUserFTP = (data) => {
  return {
    type: "SET_USER_FTP",
    payload: data,
  };
};

export const setUserCTL = (data) => {
  return {
    type: "SET_USER_CTL",
    payload: data,
  };
};

export const setUserWeight = (data) => {
  return {
    type: "SET_USER_WEIGHT",
    payload: data,
  };
};

export const setUser = (data) => {
  return {
    type: "SET_USER",
    payload: data,
  };
};

export const setPowerArray = (data) => {
  return {
    type: "SET_POWER_ARRAY",
    payload: data,
  };
};

export const setMovingTimeArray = (data) => {
  return {
    type: "SET_MOVING_TIME_ARRAY",
    payload: data,
  };
};

export const setStravaClient = (data) => {
  return {
    type: "SET_STRAVA_CLIENT",
    payload: data,
  };
};
