const root = document.getElementById("root");
const list = document.getElementById("list");
const eventlistContainer = document.getElementById("eventlist");
const totalContainer = document.getElementById("total");
const totalBar = document.getElementById("total-bar");
const progress = document.getElementById("progress");

const activities = "activities";
const startedActivityKey = "startedActivity";
const existingActivities = getItem(activities);
const startedActivity = getItem(startedActivityKey) ?? undefined;

if (!existingActivities) {
  setLocalItem(activities, []);
} else {
  existingActivities.forEach((activity) => {
    renderList(activity);
  });

  const sortedEvents = sortEvents(existingActivities);
  renderEvents(sortedEvents, existingActivities);
}

//Input
const inputContainer = document.createElement("div");
inputContainer.classList.add("input-container");
const input = document.createElement("input");
input.setAttribute("type", "text");
input.setAttribute("placeholder", "Aktivitet");

// Color input
const colorInput = document.createElement("input");
colorInput.setAttribute("type", "color");
colorInput.classList.add("color-picker");

// Button
const confirmBtn = document.createElement("button");
confirmBtn.innerText = "+";

//Button click
confirmBtn.addEventListener("click", () => {
  const activitesFromLocal = getItem(activities);

  if (
    (input.value != "" || input.value != undefined) &&
    activitesFromLocal.find((a) => a.name === input.value) === undefined
  ) {
    // object
    const activity = {
      name: input.value,
      color: colorInput.value,
      events: [
        // {
        //   start: "09:20",
        //   end: "09:30",
        //   note: "This is the note"
        // },
      ],
    };

    activitesFromLocal.push(activity);
    setLocalItem(activities, activitesFromLocal);
    renderList(activity);
    input.value = "";
  }
});

function renderList(activity) {
  const listItem = document.createElement("li");
  listItem.innerHTML = activity.name;
  listItem.setAttribute("id", activity.name);
  listItem.style.borderColor = activity.color;
  list.appendChild(listItem);

  const startedActivity = getItem(startedActivityKey) ?? undefined;
  if (startedActivity === activity.name) {
    listItem.style.color = "white";
    listItem.style.backgroundColor = activity.color;
  }

  listItem.addEventListener("click", (e) => {
    const startedActivity = getItem(startedActivityKey) ?? undefined;
    const updatedActivities = getItem(activities);
    const selectedActivity = updatedActivities.find(
      (a) => a.name === e.target.innerText
    );
    console.log("target", e.target.innerHTML);
    console.log("started", startedActivity);
    console.log("selected", selectedActivity);

    if (!startedActivity) {
      // start timer
      console.log("start");
      updatedActivities[
        updatedActivities.indexOf(selectedActivity)
      ].events.push({
        start: new Date(),
        end: null,
        note: "",
      });

      const selectedElement = document.getElementById(activity.name);
      selectedElement.style.color = "white";
      selectedElement.style.backgroundColor = activity.color;

      setLocalItem(activities, updatedActivities);
      setLocalItem(startedActivityKey, selectedActivity.name);
    } else {
      console.log("in else");
      console.log(startedActivity.name === selectedActivity.name);
      console.log(updatedActivities);
      if (startedActivity === selectedActivity.name) {
        // end timer
        console.log("stop");
        updatedActivities[
          updatedActivities.indexOf(selectedActivity)
        ].events.at(-1).end = new Date();

        const selectedElement = document.getElementById(activity.name);
        selectedElement.style.color = "black";
        selectedElement.style.backgroundColor = "transparent";

        localStorage.removeItem(startedActivityKey);
        setLocalItem(activities, updatedActivities);
        renderEvents(sortEvents(updatedActivities), updatedActivities);
      }
    }
  });
}

function renderEvents(events, activitesFromLocal) {
  const existingList = document.getElementById("events");
  if (existingList) {
    existingList.remove();
  }
  const eventList = document.createElement("ul");
  eventList.setAttribute("id", "events");
  eventlistContainer.append(eventList);

  for (const event of events) {
    const list = document.createElement("li");
    const dataContainer = document.createElement("div");

    const marker = document.createElement("span");
    marker.style.backgroundColor = event.color;

    const activityname = document.createElement("h4");
    activityname.innerText = event.activityName;

    const time = document.createElement("p");
    time.innerText =
      new Date(event.start).toLocaleString("sv-SE", {
        hour: "numeric",
        minute: "numeric",
      }) +
      " -> " +
      new Date(event.end).toLocaleString("sv-SE", {
        hour: "numeric",
        minute: "numeric",
      }) +
      " (" +
      getTimeDifference(new Date(event.start), new Date(event.end)) +
      ")";

    dataContainer.appendChild(activityname);
    dataContainer.appendChild(time);

    list.appendChild(marker);
    list.appendChild(dataContainer);
    eventList.appendChild(list);
  }
  showTotal(activitesFromLocal);
}

function showTotal(activitesFromLocal) {
  console.log(activitesFromLocal);

  const eventWithTime = activitesFromLocal
    .map((a) => ({
      ...a,
      events: a.events.filter((ev) => ev.end !== null),
    }))
    .filter((a) => a.events.length > 0);

  console.log(eventWithTime);
  const totalTime = activitesFromLocal.reduce(
    (acc, activity) =>
      acc +
      activity.events.reduce(
        (acc, e) => acc + (new Date(e.end) - new Date(e.start)),
        0
      ),
    0
  );

  const result = document.createElement("span");

  const header = document.createElement("h3");
  header.innerHTML = "Total";
  const time = document.createElement("p");
  time.innerHTML = getTime(totalTime);

  result.appendChild(header);
  result.appendChild(time);
  totalContainer.appendChild(result);

  eventWithTime.map((ac) => {
    const totalTime = ac.events.reduce(
      (acc, e) => acc + (new Date(e.end) - new Date(e.start)),
      0
    );

    const result = document.createElement("span");

    const header = document.createElement("h3");
    header.innerHTML = ac.name;
    const time = document.createElement("p");
    time.innerHTML = getTime(totalTime);

    result.appendChild(header);
    result.appendChild(time);
    totalContainer.appendChild(result);

    //return " " + ac.name + ": " + getTime(totalTime);
  });

  console.log(totalTime);

  const totalSecondsInWorkDay = 8 * 60 * 60;
  const percentWorked =
    ((totalTime % (1000 * 60)) / 1000 / totalSecondsInWorkDay) * 100;

  console.log(percentWorked);

  // totalBar.offsetWidth
  totalBar.style.border = "1px solid #dddddd";
  progress.style.backgroundColor = "gray";
  progress.style.width = percentWorked + "%";

  //totalContainer.innerText = "TOTAL: " + getTime(totalTime);
}

function sortEvents(activities) {
  console.log("sort events");
  const allEvents = activities
    .flatMap((activity) => {
      console.log(activity);
      if (!Array.isArray(activity.events)) return [];

      return activity.events.map((ev) => ({
        ...ev,
        activityId: activity.id,
        activityName: activity.name,
        color: activity.color,
      }));
    })
    .filter((ev) => ev.end !== null);

  return allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
}

// const root = document.getElementById("root");
// const list = document.getElementById("list");

// let startTime;
// let currentTimeViewer;
// let listTimes = [];

// function getCurrent() {
//   startTime = new Date();
//   currentTimeViewer = startTime.toLocaleString("sv-SE", {
//     hour: "numeric",
//     minute: "numeric",
//   });
// }
// getCurrent();

// //Input
// const inputContainer = document.createElement("div");
// const input = document.createElement("input");
// input.setAttribute("type", "time");
// input.setAttribute("value", currentTimeViewer);
// const confirmBtn = document.createElement("button");
// confirmBtn.innerText = "Add time";

// //Radio
// const radioContainer1 = document.createElement("div");
// const radio1 = document.createElement("input");
// radio1.setAttribute("type", "radio");
// radio1.setAttribute("name", "startOrEnd");
// radio1.setAttribute("value", "start");
// radio1.setAttribute("id", "start");
// radio1.setAttribute("checked", "true");
// const label1 = document.createElement("label");
// label1.innerText = "start";
// label1.setAttribute("for", "start");
// radioContainer1.appendChild(radio1);
// radioContainer1.appendChild(label1);

// const radioContainer2 = document.createElement("div");
// const radio2 = document.createElement("input");
// radio2.setAttribute("type", "radio");
// radio2.setAttribute("name", "startOrEnd");
// radio2.setAttribute("value", "end");
// radio2.setAttribute("id", "end");
// const label2 = document.createElement("label");
// label2.innerText = "end";
// label2.setAttribute("for", "end");
// radioContainer1.appendChild(radio2);
// radioContainer1.appendChild(label2);

// //Message
// const inputMessage = document.createElement("input");
// inputMessage.setAttribute("type", "text");
// inputMessage.setAttribute("placeholder", "Task");

// //Button click
// confirmBtn.addEventListener("click", () => {
//   if (inputMessage.value != "") {
//     listTimes.push({
//       time: input.value,
//       type: radio1.checked ? radio1.value : radio2.value,
//       message: inputMessage.value,
//     });
//     console.log(listTimes);
//   }
//   const listItem = document.createElement("li");
//   listItem.innerHTML = input.value;
//   list.appendChild(listItem);
// });

//Appends
inputContainer.appendChild(colorInput);
inputContainer.appendChild(input);
// inputContainer.appendChild(radioContainer1);
// inputContainer.appendChild(radioContainer2);
// inputContainer.appendChild(inputMessage);
inputContainer.appendChild(confirmBtn);

root.appendChild(inputContainer);
