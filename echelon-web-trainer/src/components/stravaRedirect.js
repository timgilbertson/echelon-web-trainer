import React from "react";
import _ from "lodash";
import { connect } from "react-redux";

import { setUser, setUserActivities, setUserFTP, setUserCTL, setUserWeight, setStravaClient } from "../actions";
import { cleanUpAuthToken, testAuthGetter, getUserData } from "../services/stravaService";

class StravaRedirect extends React.Component {
  componentDidMount() {
    const authenticate = async () => {
      const { history, location } = this.props;
      try {
        // If not redirected to Strava, return to home
        console.log(location)
        if (_.isEmpty(location)) {
          return history.push("/");
        }

        // Save the Auth Token to the Store (it's located under 'search' for some reason)
        const stravaAuthToken = cleanUpAuthToken(location.search);

        // Post Request to Strava (with AuthToken) which returns Refresh Token and and Access Token
        const tokens = await testAuthGetter(stravaAuthToken);
        this.props.setUser(tokens);
        const accessToken = tokens.access_token;
        const userID = tokens.athlete.id;

        const stravaApi = require("strava-v3");
        var stravaClient = new stravaApi.client(accessToken);

        const [maxHR, FTP, CTL, weight] = await getUserData(stravaClient, userID);
        this.props.setUserActivities(maxHR);
        this.props.setUserFTP(FTP);
        this.props.setUserCTL(CTL);
        this.props.setUserWeight(weight);
        this.props.setStravaClient(accessToken);

        // Once complete, go to display page
        history.push("/userlanding");
      } catch (error) {
        history.push("/");
      }
    };
    authenticate();
  }

  render() {
    return <div>Loading</div>;
  }
}

const mapStateToProps = (state) => {
  return { authTokenURL: state.authTokenURL };
};

export default connect(mapStateToProps, {
  setUserActivities,
  setUserFTP,
  setUserCTL,
  setUserWeight,
  setUser,
  setStravaClient,
})(StravaRedirect);
