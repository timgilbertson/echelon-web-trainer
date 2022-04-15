import { average, quantile } from "./utilities.js";
import { score } from "./model.js";

function calculateQuantileFeatures(featureArray) {
  var quantile_features = [];
  var quantiles = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (var q in quantiles) {
    var quant = quantile(featureArray, q / 10);
    quantile_features.push(quant);
  }
  return quantile_features;
}

export function calculateFeatures(powerArray, heartArray, timeArray, maxHR) {
  var powerQuantiles = calculateQuantileFeatures(powerArray);
  var heartQuantiles = calculateQuantileFeatures(heartArray.map((i) => (i - 45) / (maxHR - 45)));
  var averageHeart = average(heartArray);
  var averagePower = average(powerArray);
  // var startHour = new Date.getHours();
  var startHour = 12;
  var movingTime = timeArray[timeArray.length - 1];

  var MLFeatures = [averageHeart]
    .concat([averagePower])
    .concat([movingTime])
    .concat(powerQuantiles)
    .concat(heartQuantiles)
    .concat([startHour]);
  return MLFeatures;
}

export function calculateFTP(features) {
  var ftp = score(features);
  return ftp.toFixed(0);
}

export function calculateTSS(FTP, avgPower, movingTime) {
  /**
   * Calculates Training Stress Score (TSS) as the cumulative average power-FTP ratio per hour
   */
  return (avgPower / FTP) * (movingTime / 36);
}

export function calculateWeight(elevation, prev_elev, speed, power, stepDistance) {
  /**
   * Uses Newton's method to calculate weight given speed, slope, and power.
   */
  var density = 1.05;
  var A2 = 0.5 * 0.324 * density;
  var slope = (elevation - prev_elev) / stepDistance;
  var wind = 0;
  var loss = 0.99;
  var weight = Math.floor(newtonianWeight(A2, wind, slope, loss, power, speed));
  return weight;
}

function newtonianWeight(aero, hw, slope, tran, p, vel) {
  /* Newton's method */
  var riderMass = 60; // Initial guess
  var bikeMass = 8;
  var Crr = 0.005;
  var MAX = 10000; // maximum iterations
  var TOL = 1; // tolerance
  for (var i = 1; i < MAX; i++) {
    var tv = vel + hw;
    var aeroEff = tv > 0.0 ? aero : -aero; // wind in face, must reverse effect
    var f =
      vel *
        (aeroEff * tv * tv +
          9.81 * Math.cos(Math.atan(slope)) * (riderMass + bikeMass) * Crr +
          9.81 * Math.sin(Math.atan(slope)) * (riderMass + bikeMass)) -
      tran * p; // the function
    var fp =
      aeroEff * (3.0 * vel + hw) * tv +
      9.981 * Math.cos(Math.atan(slope)) * (riderMass + bikeMass) * Crr +
      9.981 * Math.sin(Math.atan(slope)) * (riderMass + bikeMass); // the derivative
    var vNew = riderMass - f / fp;

    if (Math.abs(vNew - riderMass) < TOL) {
      return vNew;
    } // success
    riderMass = vNew;
  }
}
