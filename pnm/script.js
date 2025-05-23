const data = {
    "Points": {
      "Point of Personal Privilege": "Used when a delegate experiences discomfort that affects their ability to participate (e.g. can't hear, room temperature).",
      "Point of Order": "Raised when a delegate believes the rules of procedure are being violated.",
      "Point of Parliamentary Inquiry": "Asked when a delegate wants clarification on the rules of procedure.",
      "Point of Information": "Used to ask a question to the chairs."
    },
    "Motions": {
      "Request to Follow Up": "Used to ask a follow-up question after a delegate has spoken.",
      "Motion to Adjourn the Debate": "Ends the current session and adjourns the meeting.",
      "Motion to Move into a Head-to-Head Debate": "Used to move into a head-to-head debate format.",
      "Motion to Solicit Third Party": "Used to ask a third party to provide their opinion on the matter at hand.",
      "Motion to Divide the house": "Used to divide the house into two groups for a vote.",
      "Motion to Exit the Room to Research": "Used to exit the room in order to research something, under the observation of an usher or chair.",
      "Motion to Request Information from Chairs": "Used to ask the chairs for information on a specific topic.",
      "Motion to Clarify State Position": "Used to clarify the state position of a delegate after an EDC (Events, Developments, and Crises).",
      "Motion to Refine State Position":"Used to ask a delegate's nation to alter their state policy.",
      "Motion to Request State Action": "Used by delegates to ask for a state to take positive or negative action.",
      "Motion to Appeal Chair's Decision": "Used to appeal a decision made by the chairs.",
      "Motion to Set Speaking Time": "Sets or changes the speaking time for speeches.",
      "Motion to Move to a Moderated Caucus": "Begins a structured debate on a sub-topic, with a specific speaking time and total duration.",
      "Motion to Move into Unmoderated Caucus": "Allows for informal lobbying, writing resolutions, or coalition forming."
    }
  };

  const createList = (listId, items) => {
  const list = document.getElementById(listId);
  Object.entries(items).forEach(([title, desc]) => {
      const li = document.createElement("li");
      li.className = "bg-gray-50 p-4 rounded shadow cursor-pointer transition hover:bg-gray-100 select-none";

      const titleEl = document.createElement("div");
      titleEl.className = "font-semibold select-none";
      titleEl.textContent = title;

      const descEl = document.createElement("div");
      descEl.className = "text-gray-700 mt-2 hidden select-none";
      descEl.textContent = desc;

      titleEl.onclick = () => {
      descEl.classList.toggle("hidden");
      };

      li.appendChild(titleEl);
      li.appendChild(descEl);
      list.appendChild(li);
  });
  };


  createList("pointsList", data.Points);
  createList("motionsList", data.Motions);