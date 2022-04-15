import { drum_lat, drum_lon } from "../maps/distanceTracks.js";

var lat = drum_lat;
var lon = drum_lon;

const asc = (arr) => arr.sort((a, b) => a - b);

export const quantile = (arr_in, q) => {
  var arr = Array.from(arr_in);
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export function average(array) {
  var total = 0;
  var arrayLength = array.length;
  for (var i = 0; i < array.length; i++) {
    if (isNaN(array[i])) {
      arrayLength--;
      continue;
    }
    total += array[i];
  }
  return total / arrayLength;
}

export function calc_elapsedTime(timeArray) {
  function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  const totalSeconds = timeArray[timeArray.length - 1];
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  var seconds = totalSeconds - hours * 3600 - minutes * 60;
  return str_pad_left(hours, "0", 2) + ":" + str_pad_left(minutes, "0", 2) + ":" + str_pad_left(seconds, "0", 2);
}

export function calc_movingTime(timeArray) {
  function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  const totalSeconds = timeArray[timeArray.length - 1];
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  var seconds = totalSeconds - hours * 3600 - minutes * 60;
  return str_pad_left(hours, "0", 2) + ":" + str_pad_left(minutes, "0", 2) + ":" + str_pad_left(seconds, "0", 2);
}

function newtonianSpeed(aero, hw, tr, Fg, tran, p) {
  /* Newton's method */
  var vel = 20; // Initial guess
  var MAX = 10; // maximum iterations
  var TOL = 0.05; // tolerance
  var i = 1;
  for (i = 1; i < MAX; i++) {
    var tv = vel + hw;
    var aeroEff = tv > 0.0 ? aero : -aero; // wind in face, must reverse effect
    var f = vel * (aeroEff * tv * tv + tr + Fg) - tran * p; // the function
    var fp = aeroEff * (3.0 * vel + hw) * tv + tr + Fg; // the derivative
    var vNew = vel - f / fp;
    if (Math.abs(vNew - vel) < TOL) return vNew; // success
    vel = vNew;
  }
  return 0.0; // failed to converge
}

export function calc_speed(power, speedArray, elevArray, i, weight) {
  var elevation = elevArray[elevArray.length - 1];
  var prev_elev;
  if (elevArray.length > 1) {
    prev_elev = elevArray[elevArray.length - 2];
  } else {
    prev_elev = elevation;
  }
  var density = 1.05;
  var A2 = 0.5 * 0.324 * density;
  var slope = (elevation - prev_elev) / (distanceBetween(i, 1) * 1000);
  var Crr = 0.005;
  var wind = 0;
  var Fg = 9.81 * Math.sin(Math.atan(slope)) * weight;
  var Fr = 9.81 * Math.cos(Math.atan(slope)) * weight * Crr;
  var loss = 0.99;

  var speed = Math.floor(newtonianSpeed(A2, wind, Fr, Fg, loss, power) * 3.6);
  var avgSpeed;
  if (speedArray.length > 4) {
    avgSpeed = Math.floor(
      (speed +
        speedArray[speedArray.length - 1] +
        speedArray[speedArray.length - 2] +
        speedArray[speedArray.length - 3] +
        speedArray[speedArray.length - 4]) /
        5
    );
  } else {
    avgSpeed = speed;
  }
  return avgSpeed;
}

export function calc_distance(speedArray, timeArray) {
  var meanSpeed = average(speedArray);
  var distance = Math.round(meanSpeed * (timeArray[timeArray.length - 1] / 3600) * 100) / 100;
  return distance;
}

export function calculateImputeRatio(currentDistance, trackDistanceArray, i) {
  if (i < 1) {
    return 1;
  }
  var nextTrackDistance = trackDistanceArray[i];
  var lastTrackDistance = trackDistanceArray[i - 1];
  if (isNaN(lastTrackDistance)) {
    return 1;
  }
  if (nextTrackDistance === lastTrackDistance) {
    return 1;
  }
  return (nextTrackDistance - currentDistance) / (nextTrackDistance - lastTrackDistance);
}

export function getLongLatElev(i, imputeRatio, lat, lon, elev, latitudeArray, longitudeArray, elevArray) {
  if (imputeRatio > 1) {
    imputeRatio = 1;
  } else if (imputeRatio < 0) {
    imputeRatio = 0;
  }
  var latitude;
  var longitude;
  var elevation;
  if (longitudeArray.length > 3) {
    longitude = average([
      lon[i] * (1 - imputeRatio) + lon[i - 1] * imputeRatio,
      longitudeArray[longitudeArray.length - 1],
      longitudeArray[longitudeArray.length - 2],
      longitudeArray[longitudeArray.length - 3],
    ]);
    latitude = average([
      lat[i] * (1 - imputeRatio) + lat[i - 1] * imputeRatio,
      latitudeArray[latitudeArray.length - 1],
      latitudeArray[latitudeArray.length - 2],
      latitudeArray[latitudeArray.length - 3],
    ]);
    elevation = average([
      elev[i] * (1 - imputeRatio) + elev[i - 1] * imputeRatio,
      elevArray[elevArray.length - 1],
      elevArray[elevArray.length - 2],
      elevArray[elevArray.length - 3],
    ]);
  } else {
    longitude = lon[i] * (1 - imputeRatio) + lon[i - 1] * imputeRatio;
    latitude = lat[i] * (1 - imputeRatio) + lat[i - 1] * imputeRatio;
    elevation = elev[i] * (1 - imputeRatio) + elev[i - 1] * imputeRatio;
  }
  return [longitude, latitude, elevation];
}

function toRad(coord) {
  return (coord * Math.PI) / 180;
}

export function distanceBetween(i, k) {
  var R = 6371;
  var j;
  if (i < k) {
    j = 0;
  } else {
    j = i - k;
  }
  if (j < 0) {
    j = 0;
  }
  var lat1 = toRad(lat[j]);
  var lon1 = toRad(lon[j]);
  var lat2 = toRad(lat[i]);
  var lon2 = toRad(lon[i]);
  var dLat = lat2 - lat1;
  var dLon = lon2 - lon1;

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function trackDistanceCalculator() {
  var trackDistanceArray = [];
  var totalDist = 0;
  for (var i = 1; i < lat.length - 1; i++) {
    totalDist = totalDist + distanceBetween(i, 1);
    trackDistanceArray.push(totalDist);
  }
  return trackDistanceArray;
}

export var trackDistanceArray = trackDistanceCalculator();
