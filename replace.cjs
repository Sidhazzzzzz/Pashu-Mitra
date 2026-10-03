const fs = require('fs');
let code = fs.readFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', 'utf8');

const replacements = [
  ['>Cooperative Field Desk</span>', '>{data.extra.coopFieldDesk || "Cooperative Field Desk"}</span>'],
  ['>Phase 2 roadmap - cooperative rollout</span>', '>{data.extra.phase2 || "Phase 2 roadmap - cooperative rollout"}</span>'],
  ['> Registered Farms</span>', '> {data.extra.registeredFarms || "Registered Farms"}</span>'],
  ['> Active Animals</span>', '> {data.extra.activeAnimals || "Active Animals"}</span>'],
  ['> Telemetry Sync Rate</span>', '> {data.extra.telemetrySync || "Telemetry Sync Rate"}</span>'],
  ['> Subclinical Flags</span>', '> {data.extra.subclinicalFlags || "Subclinical Flags"}</span>'],
  ['Powered by TF.js AI', '{data.extra.poweredBy || "Powered by TF.js AI"}'],
  ['<br/>+6 this month</div>', '<br/>{data.extra.plus6Month || "+6 this month"}</div>'],
  ['<br/>Needs follow-up</div>', '<br/>{data.extra.needsFollowUp || "Needs follow-up"}</div>'],
  ['<br/>Treated early</div>', '<br/>{data.extra.treatedEarly || "Treated early"}</div>'],
  ['Reading completion<br/>', '{data.extra.readingCompletion || "Reading completion"}<br/>'],
  ['<h2>Priority List</h2>', '<h2>{data.extra.priorityList || "Priority List"}</h2>'],
  ['>Priority List</div>', '>{data.extra.priorityList || "Priority List"}</div>'],
  ['<th>Action</th>', '<th>{data.extra.action || "Action"}</th>'],
  ['Batt:', '{data.extra.batt || "Batt"}:'],
  ['Review</button>', '{data.extra.reviewBtn || "Review"}</button>']
];

for (let [search, replace] of replacements) {
  code = code.split(search).join(replace);
}

fs.writeFileSync('client/src/pages/dashboard/CooperativeDashboard.tsx', code);
