const root = document.getElementById("root");
const list = document.getElementById("list");
const eventlistContainer = document.getElementById("eventlist");
const notesInputContainer = document.getElementById("notes-input");
const totalContainer = document.getElementById("total");
const totalBar = document.getElementById("total-bar");
const progress = document.getElementById("progress");
const deleteButton = document.getElementById("delete-btn");

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
input.setAttribute("placeholder", "Activity");

// Color input
const colorInput = document.createElement("input");
colorInput.setAttribute("type", "color");
colorInput.classList.add("color-picker");

// Notes input
const notesInput = document.createElement("input");
notesInput.setAttribute("type", "text");
notesInput.setAttribute("placeholder", "Note");
notesInputContainer.style.visibility = "hidden";

notesInput.addEventListener("input", updateEventNote);

function updateEventNote(e) {
  const storedActivities = getItem(activities);
  const startedActivity = getItem(startedActivityKey) ?? undefined;
  const selectedActivity = storedActivities.find(
    (a) => a.name === startedActivity
  );

  storedActivities[storedActivities.indexOf(selectedActivity)].events.at(
    -1
  ).note = e.target.value;
  setLocalItem(activities, storedActivities);
}

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

  listItem.addEventListener("click", handleActivity);
}

function handleActivity(e) {
  const startedActivity = getItem(startedActivityKey) ?? undefined;
  const updatedActivities = getItem(activities);
  const selectedActivity = updatedActivities.find(
    (a) => a.name === e.target.innerText
  );

  const clickedActivity =
    updatedActivities[updatedActivities.indexOf(selectedActivity)];

  if (!startedActivity) {
    // start timer
    clickedActivity.events.push({
      start: new Date(),
      end: null,
      note: "",
    });

    notesInputContainer.style.visibility = "visible";

    const selectedElement = document.getElementById(clickedActivity.name);
    selectedElement.style.color = "white";
    selectedElement.style.backgroundColor = clickedActivity.color;

    setLocalItem(activities, updatedActivities);
    setLocalItem(startedActivityKey, selectedActivity.name);
  }
  if (startedActivity === selectedActivity.name) {
    // end timer
    clickedActivity.events.at(-1).end = new Date();

    notesInputContainer.style.visibility = "hidden";
    notesInput.value = "";

    const selectedElement = document.getElementById(clickedActivity.name);
    selectedElement.style.color = "black";
    selectedElement.style.backgroundColor = "transparent";

    localStorage.removeItem(startedActivityKey);
    setLocalItem(activities, updatedActivities);
    renderEvents(sortEvents(updatedActivities), updatedActivities);
  }
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

    const time = document.createElement("div");
    time.classList.add("event-time");
    const totalTime = document.createElement("p");
    const arrow = document.createElement("p");
    arrow.innerText = " -> ";

    const startTime = document.createElement("input");
    startTime.setAttribute("type", "time");
    startTime.value = new Date(event.start).toLocaleString("sv-SE", {
      hour: "numeric",
      minute: "numeric",
    });

    const endTime = document.createElement("input");
    endTime.setAttribute("type", "time");
    endTime.value = new Date(event.end).toLocaleString("sv-SE", {
      hour: "numeric",
      minute: "numeric",
    });

    totalTime.innerText =
      " (" +
      getTimeDifference(new Date(event.start), new Date(event.end)) +
      ")";

    time.appendChild(startTime);
    time.appendChild(arrow);
    time.appendChild(endTime);
    time.appendChild(totalTime);

    // Update time
    startTime.addEventListener("blur", (e) => {
      updateTime(e, activitesFromLocal, event, "start");
    });

    endTime.addEventListener("blur", (e) => {
      updateTime(e, activitesFromLocal, event, "end");
    });

    const note = document.createElement("p");
    note.innerText = event.note;

    dataContainer.appendChild(activityname);
    dataContainer.appendChild(time);

    list.appendChild(marker);
    list.appendChild(dataContainer);
    if (event.note !== "") {
      list.appendChild(note);
    }
    eventList.appendChild(list);
  }
  showTotal(activitesFromLocal);
}

function updateTime(e, activitesFromLocal, event, type) {
  const timeString = e.target.value;
  const [hours, minutes] = timeString.split(":").map(Number);

  // The adjusted time will automatically be for the current date. The days can not be changed yet -> To be added at a future update
  const now = new Date();
  const dateWithTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  for (const activity of activitesFromLocal) {
    let eventToModify = activity.events.find((e) =>
      type === "start" ? e.start === event.start : e.end === event.end
    );

    if (eventToModify) {
      if (type === "start") {
        eventToModify.start = dateWithTime;
      } else {
        eventToModify.end = dateWithTime;
      }
    }
  }

  setLocalItem(activities, activitesFromLocal);
  renderEvents(sortEvents(activitesFromLocal), activitesFromLocal);
}

function showTotal(activitesFromLocal) {
  totalContainer.innerHTML = "";
  const activitiedFilteredByEndTime = activitesFromLocal
    .map((a) => ({
      ...a,
      events: a.events.filter((ev) => ev.end !== null),
    }))
    .filter((a) => a.events.length > 0);

  const totalTime = activitiedFilteredByEndTime.reduce(
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

  activitiedFilteredByEndTime.map((ac) => {
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
  });

  const totalSecondsInWorkDay = 8 * 60 * 60;
  const totalTimeWorkedInSeconds = totalTime / 1000;
  const percentWorked =
    (totalTimeWorkedInSeconds / totalSecondsInWorkDay) * 100;

  totalBar.style.border = "1px solid #bbbbbb";
  progress.classList.add("gradient");

  progress.style.width = percentWorked + "%";
}

function sortEvents(activities) {
  const allEvents = activities
    .flatMap((activity) => {
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

deleteButton.addEventListener("click", deleteEvents);

function deleteEvents() {
  const currentActivities = getItem(activities);

  const updatedActivities = currentActivities.map((a) => ({
    ...a,
    events: [],
  }));

  setLocalItem(activities, updatedActivities);
  localStorage.removeItem(startedActivityKey);

  renderEvents(sortEvents(updatedActivities), currentActivities);
}

//Appends
inputContainer.appendChild(colorInput);
inputContainer.appendChild(input);
inputContainer.appendChild(confirmBtn);
notesInputContainer.appendChild(notesInput);
root.appendChild(inputContainer);
