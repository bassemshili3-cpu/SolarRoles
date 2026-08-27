type InfographicKind =
  | 'first-solar-role'
  | 'nabcep-credits'
  | 'texas-licensing'
  | 'sales-pay'
  | 'installer-certifications'
  | 'pvip-exam';

type Item = { number?: string; title: string; detail: string; color: string };

const palette = {
  navy: '#0B1A2E', teal: '#0F9B93', blue: '#1596D1', gold: '#F5B819', orange: '#FF6A3D', sage: '#6D9775', ink: '#4F5968', paper: '#FFFEFA', line: '#DCE3E8',
};

const data: Record<InfographicKind, { label: string; items: Item[]; note: string }> = {
  'first-solar-role': {
    label: 'Solar career entry routes from general laborer to project management, ordered by how much related experience they normally require.',
    items: [
      { number: '01', title: 'Helper / laborer', detail: 'No solar background needed', color: palette.navy },
      { number: '02', title: 'PV installer', detail: 'Learn on an install crew', color: palette.teal },
      { number: '03', title: 'Solar sales', detail: 'A separate, commission-led route', color: palette.blue },
      { number: '04', title: 'Service / electrical', detail: 'Trade foundation usually needed', color: palette.gold },
      { number: '05', title: 'Crew lead', detail: 'Proven field responsibility', color: palette.orange },
      { number: '06', title: 'Project management', detail: 'Construction experience first', color: palette.sage },
    ],
    note: 'More prior experience usually required →',
  },
  'nabcep-credits': {
    label: 'Decision flow for NABCEP PVIP project credits: qualifying role, qualifying PV work, documentation, credits, and the six-credit target.',
    items: [
      { number: '01', title: 'Worked on a PV project?', detail: 'Start with a real, documented system', color: palette.navy },
      { number: '02', title: 'Made decisions?', detail: 'Lead, design, commission, or supervise', color: palette.teal },
      { number: '03', title: 'Project qualifies?', detail: 'Check NABCEP system and role rules', color: palette.blue },
      { number: '04', title: 'Document the work', detail: 'Keep role, system, and verifier details', color: palette.gold },
      { number: '05', title: 'Count the credits', detail: 'System size affects the credit total', color: palette.orange },
      { number: '06', title: 'Reach 6 credits', detail: 'Then submit the PVIP application', color: palette.sage },
    ],
    note: 'A crew presence alone is not enough: the qualifying role matters.',
  },
  'texas-licensing': {
    label: 'Texas solar work licensing decision tree showing that work on the PV system requires an electrical licensing path, while non-electrical logistics work is a separate entry route.',
    items: [
      { number: '01', title: 'What is the task?', detail: 'Separate system work from logistics', color: palette.navy },
      { number: '02', title: 'Touches the PV system?', detail: 'Racking, modules, DC, grounding, or AC', color: palette.teal },
      { number: '03', title: 'Yes: electrical path', detail: 'Work through a licensed contractor', color: palette.blue },
      { number: '04', title: 'Entry route', detail: 'TDLR Electrical Apprentice license', color: palette.gold },
      { number: '05', title: 'On-site supervision', detail: 'Master, Journeyman, or Residential Wireman', color: palette.orange },
      { number: '06', title: 'No: logistics route', detail: 'Panel handling, site prep, transport', color: palette.sage },
    ],
    note: 'Texas does not create a lower-barrier “DC-only” category.',
  },
  'sales-pay': {
    label: 'Comparison of 1099 commission-only and W-2 base-plus-commission solar sales compensation structures and the questions to ask before accepting either offer.',
    items: [
      { number: '01', title: 'Start with runway', detail: 'Know how long your savings must last', color: palette.navy },
      { number: '02', title: '1099: no base', detail: 'Higher upside, taxes and expenses on you', color: palette.orange },
      { number: '03', title: 'W-2: income floor', detail: 'Base pay and payroll withholding', color: palette.teal },
      { number: '04', title: 'Ask about leads', detail: 'Who provides them and when pay lands', color: palette.blue },
      { number: '05', title: 'Ask about clawbacks', detail: 'What happens after a cancellation', color: palette.gold },
      { number: '06', title: 'Choose the risk fit', detail: 'Runway and experience matter more than headlines', color: palette.sage },
    ],
    note: 'Higher advertised earnings do not guarantee early cash flow.',
  },
  'installer-certifications': {
    label: 'Solar installer certification map showing the NABCEP PV Associate, PV Installation Specialist, and PV Installation Professional credentials and their typical role fit.',
    items: [
      { number: '01', title: 'PV Associate', detail: 'Entry-level solar knowledge', color: palette.navy },
      { number: '02', title: 'Installer helper', detail: 'Build field hours and safe habits', color: palette.teal },
      { number: '03', title: 'PVIS', detail: 'Installation-focused credential', color: palette.blue },
      { number: '04', title: 'Experienced installer', detail: 'Own more physical install work', color: palette.gold },
      { number: '05', title: 'PVIP', detail: 'Full installation professional scope', color: palette.orange },
      { number: '06', title: 'Lead installer', detail: 'More responsibility and field judgment', color: palette.sage },
    ],
    note: 'PVIS and PVIP have different scopes; neither is presented here as a prerequisite for the other.',
  },
  'pvip-exam': {
    label: 'NABCEP PVIP exam path from job task analysis preparation through the seventy-question exam, pass result, and 275-dollar retake process.',
    items: [
      { number: '01', title: 'Study the JTA', detail: 'Prepare against the actual exam scope', color: palette.navy },
      { number: '02', title: 'Timed practice', detail: 'Use scenario and code questions', color: palette.teal },
      { number: '03', title: 'Take the PVIP exam', detail: '70 questions: 60 scored, 10 pilot', color: palette.blue },
      { number: '04', title: 'Pass', detail: 'Move to certification or Board Eligible', color: palette.gold },
      { number: '05', title: 'If you do not pass', detail: 'Review weak task areas before retrying', color: palette.orange },
      { number: '06', title: 'Retake', detail: 'Current retake fee: $275', color: palette.sage },
    ],
    note: 'Confirm current NABCEP fees and policies before scheduling.',
  },
};

export function EditorialInfographic({ kind }: { kind: InfographicKind }) {
  const infographic = data[kind];
  const positions = [
    [40, 270], [225, 230], [410, 190], [595, 150], [780, 110], [965, 70],
  ];

  return (
    <figure style={{ margin: '32px 0', border: `1px solid ${palette.line}`, background: palette.paper, padding: '18px', overflow: 'hidden' }}>
      <svg viewBox="0 0 1200 530" role="img" aria-label={infographic.label} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <title>{infographic.label}</title>
        <rect x="0" y="0" width="1200" height="530" fill={palette.paper} />
        <line x1="30" y1="450" x2="1170" y2="450" stroke={palette.navy} strokeWidth="2" />
        {infographic.items.map((item, index) => {
          const [x, y] = positions[index];
          const next = positions[index + 1];
          return (
            <g key={item.number}>
              {next && <path d={`M ${x + 150} ${y + 106} H ${next[0] - 18} V ${next[1] + 106}`} fill="none" stroke={palette.navy} strokeWidth="2" />}
              <rect x={x} y={y} width="150" height="180" fill="#FFFFFF" stroke={item.color} strokeWidth="2" />
              <rect x={x} y={y} width="150" height="44" fill={item.color} />
              <text x={x + 14} y={y + 30} fill="#FFFFFF" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="20">{item.number}</text>
              <line x1={x + 14} y1={y + 70} x2={x + 136} y2={y + 70} stroke={item.color} strokeWidth="4" />
              <text x={x + 14} y={y + 97} fill={palette.navy} fontFamily="Arial, sans-serif" fontWeight="700" fontSize="14">{item.title}</text>
              <foreignObject x={x + 14} y={y + 110} width="120" height="54">
                <div style={{ color: palette.ink, fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: 1.25 }}>{item.detail}</div>
              </foreignObject>
            </g>
          );
        })}
        <rect x="40" y="470" width="1120" height="34" fill="#FFFFFF" stroke={palette.line} />
        <text x="54" y="492" fill={palette.ink} fontFamily="Arial, sans-serif" fontSize="13">{infographic.note}</text>
        <text x="40" y="432" fill={palette.navy} fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13">Source: Solar Roles</text>
      </svg>
    </figure>
  );
}
