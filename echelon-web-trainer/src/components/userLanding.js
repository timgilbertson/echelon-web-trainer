import React from "react";
import { connect } from "react-redux";

class FreeRide extends React.Component {
  /**
   * Landing page after successful login.
   * User is shown current fitness and ride metrics in a widget and presented with option
   * to free ride or do a workout.
   */
  render() {
    var { maxHR, returnTokens, FTP, CTL, weight, workout, accessToken } = this.props;
    const minnRide = () => {
      workout = false;
      var rideMap = "minn";
      this.props.history.push({
        pathname: "/webtrainer",
        state: {
          stravaFTP: FTP,
          weight: 80.6,
          workout: workout,
          maxHR: maxHR,
          accessToken: accessToken,
          map: rideMap,
        },
      });
    };
    const drumRide = () => {
      workout = false;
      var rideMap = "drum";
      this.props.history.push({
        pathname: "/webtrainer",
        state: {
          stravaFTP: FTP,
          weight: 80.6,
          workout: workout,
          maxHR: maxHR,
          map: rideMap,
        },
      });
    };
    return (
      <div>
        <h1>Hi, {returnTokens.athlete.firstname}!</h1>
        <h2>FTP: {FTP} w</h2>
        <h2>Max HR: {maxHR} bpm</h2>
        <h2>CTL: {CTL}</h2>
        <h2>Weight: {weight} kg</h2>
        <button onClick={minnRide}>Ride Minnewanka</button>
        <button onClick={drumRide}>Ride Drumheller</button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    maxHR: state.maxHR,
    returnTokens: state.returnTokens,
    FTP: state.FTP,
    CTL: state.CTL,
    weight: state.weight,
    workout: state.workout,
    accessToken: state.accessToken,
    map: state.map,
  };
};

export default connect(mapStateToProps)(FreeRide);
