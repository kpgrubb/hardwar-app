export interface BriefingMessage {
  prefix: string;
  text: string;
  priority: "standard" | "alert" | "intel";
}

export const BRIEFING_MESSAGES: BriefingMessage[] = [
  { prefix: "SIGINT", text: "Hostile elements detected in sector 7-G. Recommend rapid deployment of forward recon units.", priority: "alert" },
  { prefix: "METEO", text: "Atmospheric conditions nominal. Visibility 12km. Wind bearing 047° at 6kts. No electromagnetic interference detected.", priority: "standard" },
  { prefix: "INTEL", text: "Satellite imagery confirms two enemy firebases along the northern ridgeline. Classification: C3 static defence.", priority: "intel" },
  { prefix: "LOGCOM", text: "Supply convoy ETA 0340 UTC. Budget allocation confirmed. All field assets operational.", priority: "standard" },
  { prefix: "TACNET", text: "Friendly callsign ANVIL-6 requesting fire support coordinates. Forward observer in position.", priority: "alert" },
  { prefix: "RECON", text: "Terrain analysis complete. Primary AO features mixed urban and open ground. Multiple elevation changes.", priority: "standard" },
  { prefix: "COMMS", text: "Encrypted channel established on frequency 7. Electronic warfare suite standing by. 5 interference tokens allocated.", priority: "standard" },
  { prefix: "OPORD", text: "Mission parameters loaded. Objective: secure forward operating area and neutralise hostile armoured elements.", priority: "intel" },
  { prefix: "HQ", text: "All units report ready status. Initiative phase commencing. Commanders, deploy at your discretion.", priority: "alert" },
  { prefix: "SITREP", text: "Sector quiet. No contact since last patrol. Recommend cautious advance along grid reference 4F2A.", priority: "standard" },
  { prefix: "ELINT", text: "Enemy communications intercepted. Possible reinforcement column inbound from eastern approach.", priority: "intel" },
  { prefix: "MAINT", text: "Walker maintenance cycle complete. All actuators nominal. Reactor output at 94%. Combat ready.", priority: "standard" },
];
