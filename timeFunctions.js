function getTimeDifference(startDate, endDate) {
  let diffInMs = Math.abs(endDate - startDate);

  let timeDiffString = getTime(diffInMs);

  return timeDiffString;
}

function getTime(diffInMs) {
  let hours = Math.floor(diffInMs / (1000 * 60 * 60));
  let minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

  let timeDiffArray = [];
  if (hours !== 0) {
    timeDiffArray.push(hours + "h");
  }
  if (minutes !== 0) {
    timeDiffArray.push(minutes + "min");
  }

  if (seconds !== 0) {
    timeDiffArray.push(seconds + "s");
  }
  return timeDiffArray.join(" ");
}
