export const STATE_CODES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export type StateKey = (typeof STATE_CODES)[number];

export type StateRuleMode =
  | "detailed"
  | "standard"
  | "program"
  | "jurisdiction"
  | "contractor";

export type GenericQuestionId =
  | "supervision"
  | "registration"
  | "education"
  | "employer";

export type RuleQuestion = {
  id: GenericQuestionId;
  label: string;
  requirement: string;
  severity: "warning" | "problem";
};

export type StateRule = {
  name: string;
  credential: string;
  mode: StateRuleMode;
  summary: string;
  target?: {
    value: number;
    unit: string;
    label: string;
  };
  amountLabel?: string;
  amountHint?: string;
  jurisdictionLabel?: string;
  questions?: RuleQuestion[];
  notes?: Array<{
    title: string;
    body: string;
    type: "info" | "warning";
  }>;
  nextSteps: string[];
  sources: Array<{
    label: string;
    href: string;
    note: string;
  }>;
};

export const STATE_RULES: Record<StateKey, StateRule> = {
  "AL": {
    "name": "Alabama",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Alabama's statewide journeyman examination route uses an 8,000-hour electrical-experience requirement. Approved electrical education or apprenticeship may substitute for up to 2,000 of those hours.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported electrical experience"
    },
    "notes": [
      {
        "title": "Education can replace only part of the experience requirement.",
        "body": "The Board permits approved electrical curriculum or apprenticeship education to substitute for up to 2,000 of the 8,000 required hours.",
        "type": "info"
      }
    ],
    "nextSteps": [
      "Separate documented electrical work from general solar construction or material-handling time.",
      "Keep employer verification and any approved electrical curriculum or apprenticeship records.",
      "Confirm the current examination application before relying on education as substituted experience."
    ],
    "sources": [
      {
        "label": "Alabama Board of Electrical Contractors — Journeyman Examination Application",
        "href": "https://aecb.alabama.gov/wp-content/uploads/2023/04/NEWJManAp4-10-23.pdf",
        "note": "Statewide journeyman experience and education-substitution requirements."
      },
      {
        "label": "Alabama Board of Electrical Contractors — Forms",
        "href": "https://aecb.alabama.gov/licensees/forms/",
        "note": "Current examination forms and licensing materials."
      }
    ]
  },
  "AK": {
    "name": "Alaska",
    "credential": "Electrician Journeyman Certificate of Fitness",
    "mode": "standard",
    "summary": "Alaska requires 8,000 hours of commercial/industrial electrical-construction experience for the Electrician Journeyman Certificate of Fitness. Residential, classroom, line, military/vocational and maintenance experience are treated differently.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported experience"
    },
    "questions": [
      {
        "id": "registration",
        "label": "If the work was performed in Alaska, did you hold the required Electrician Trainee Certificate of Fitness?",
        "requirement": "Alaska states that work performed in Alaska without a valid Electrician Trainee Certificate will not be counted.",
        "severity": "problem"
      },
      {
        "id": "supervision",
        "label": "Was the electrical work performed under direct supervision of a journey-level tradesperson?",
        "requirement": "Alaska's current guidance ties qualifying trainee work to direct supervision by a journey-level tradesperson.",
        "severity": "problem"
      }
    ],
    "notes": [
      {
        "title": "Not every reported hour is treated the same.",
        "body": "The state limits residential, classroom, line and military/vocational credit and states that maintenance hours are not accepted for the Electrician Journeyman route.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Confirm that Alaska work was performed while you held the required Trainee Certificate of Fitness.",
      "Obtain Experience Verification Forms from employers while records and supervisors are still available.",
      "Break out residential, classroom, line, military/vocational and maintenance time before applying."
    ],
    "sources": [
      {
        "label": "Alaska Department of Labor — Certificate of Fitness License Requirements",
        "href": "https://labor.alaska.gov/lss/mi-license-req.html",
        "note": "Electrician Journeyman experience limits and trainee-certificate rules."
      },
      {
        "label": "Alaska Mechanical Inspection — Trade Licensing FAQ",
        "href": "https://labor.alaska.gov/lss/mi-faq.html",
        "note": "Current guidance on trainee registration, supervision and experience verification."
      }
    ]
  },
  "AZ": {
    "name": "Arizona",
    "credential": "Local electrician / Arizona electrical-contractor path",
    "mode": "jurisdiction",
    "summary": "Arizona's Registrar of Contractors licenses electrical contractors and qualifying parties, while journeyman licensing can be imposed locally. A single statewide worker-hour total is therefore not enough to determine whether solar hours satisfy the credential that applies where the work occurred.",
    "jurisdictionLabel": "City or county where the work was performed",
    "nextSteps": [
      "Identify the city or county whose journeyman rules apply to the work location.",
      "If you are pursuing an Arizona contractor classification instead, use the ROC classification and qualifying-party requirements rather than a local journeyman rule.",
      "Keep records of the actual electrical tasks, dates and supervising license holders."
    ],
    "sources": [
      {
        "label": "Arizona Registrar of Contractors — Applying for a License",
        "href": "https://roc.az.gov/applying-for-a-license",
        "note": "State electrical-contractor licensing and qualifying-party framework."
      },
      {
        "label": "Arizona Legislature — 2026 SB 1670 veto summary",
        "href": "https://www.azleg.gov/legtext/57leg/2R/summary/S.1670RAGE_ASVETOED.DOCX.htm",
        "note": "Official legislative summary noting the proposal to remove local journeyman licensing authority was vetoed."
      }
    ]
  },
  "AR": {
    "name": "Arkansas",
    "credential": "Journeyman Electrician",
    "mode": "program",
    "summary": "Arkansas recognizes a Journeyman route based on completion of a U.S. Department of Labor-certified electrical apprenticeship with 8,000 hours of qualifying OJT. The Board's current verification form also identifies a 16,000-hour out-of-state OJT route for applicants who did not complete the qualifying apprenticeship, subject to reciprocity rules.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported OJT against the completed-apprenticeship route"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Did you complete a U.S. Department of Labor-certified electrical apprenticeship for this route?",
        "requirement": "The standard Arkansas journeyman route shown on the current verification form is completion of a USDOL-certified apprenticeship with 8,000 hours of qualifying OJT.",
        "severity": "warning"
      }
    ],
    "notes": [
      {
        "title": "Applicants without the qualifying completed apprenticeship may face a different experience route.",
        "body": "The current Arkansas employment-verification form lists 16,000 hours of qualified out-of-state OJT for that route unless reciprocity applies.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Use the Arkansas Board's own employment-verification form for each employer.",
      "Confirm whether you are applying through completed apprenticeship, reciprocity or the out-of-state experience route.",
      "Do not combine general solar labor with electrical-construction OJT without documentation."
    ],
    "sources": [
      {
        "label": "Arkansas Board of Electrical Examiners — Employment Verification",
        "href": "https://labor.arkansas.gov/wp-content/uploads/Employment_Verification-AR-2.0.pdf",
        "note": "Current experience-verification form and journeyman experience routes."
      },
      {
        "label": "Arkansas Electrical Rules",
        "href": "https://www.labor.arkansas.gov/wp-content/uploads/Electrical-Rules-April-2024.pdf",
        "note": "Board rules for electrician licensing and qualifying experience."
      }
    ]
  },
  "CA": {
    "name": "California",
    "credential": "General Electrician",
    "mode": "detailed",
    "summary": "California uses detailed work-category limits and worker-status rules for General Electrician experience.",
    "nextSteps": [],
    "sources": [
      {
        "label": "California DIR — Eligibility for Certification (8 CCR §291.1)",
        "href": "https://www.dir.ca.gov/t8/291_1.html",
        "note": "Experience totals, work areas and maximum credit by category."
      },
      {
        "label": "California DIR — Electrician Certification Application Instructions",
        "href": "https://www.dir.ca.gov/dlse/ecu/ElectricianApplicationInstructions.html",
        "note": "Application documentation and proof-of-experience instructions."
      }
    ]
  },
  "CO": {
    "name": "Colorado",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Colorado's current journeyman framework requires at least 8,000 hours over a minimum of four years and at least 288 hours of required training within the applicable training/experience period.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported practical/apprenticeship experience"
    },
    "questions": [
      {
        "id": "education",
        "label": "Have you completed the required electrical training for your Colorado journeyman route?",
        "requirement": "Colorado's current framework includes at least 288 hours of training in safety, the National Electrical Code and other required subjects.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Verify that the work fits Colorado's apprenticeship or practical-experience categories rather than only counting calendar time.",
      "Keep transcripts or training records for the required electrical instruction.",
      "Preserve employer and supervisor records supporting the four-year experience period."
    ],
    "sources": [
      {
        "label": "Colorado General Assembly — SB25-165 Licensure of Electricians",
        "href": "https://www.leg.colorado.gov/bills/sb25-165",
        "note": "Current statutory changes describing the 8,000-hour/four-year requirement and 288 hours of training."
      }
    ]
  },
  "CT": {
    "name": "Connecticut",
    "credential": "PV-2 Electrical Limited Solar Journeyperson",
    "mode": "standard",
    "summary": "Connecticut publishes a solar-specific PV-2 journeyperson pathway requiring 4,000 hours of on-the-job training and 324 classroom hours.",
    "target": {
      "value": 4000,
      "unit": "hours",
      "label": "Reported PV-2 OJT"
    },
    "questions": [
      {
        "id": "education",
        "label": "Have you completed at least 324 hours of qualifying classroom instruction for the PV-2 route?",
        "requirement": "Connecticut DCP's current table lists 324 classroom hours with 4,000 OJT hours for PV-2.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Confirm that the work falls within the PV-2 scope rather than assuming all solar construction time is PV-2 OJT.",
      "Keep apprenticeship/OJT records and classroom transcripts.",
      "Verify the current DCP application path before filing."
    ],
    "sources": [
      {
        "label": "Connecticut DCP — Electrical Journeyperson Equivalent Experience and Training",
        "href": "https://portal.ct.gov/dcp/license-services-division/all-license-applications/electrical-journeyperson---equivalent-experience-and-training",
        "note": "Current OJT and classroom-hour table, including PV-2."
      }
    ]
  },
  "DE": {
    "name": "Delaware",
    "credential": "Journeyperson Electrician",
    "mode": "standard",
    "summary": "Delaware's examination route requires at least 8,000 hours of full-time electrical-work experience under the supervision of an appropriately licensed Delaware electrician unless another approved route applies.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported supervised electrical experience"
    },
    "questions": [
      {
        "id": "supervision",
        "label": "Was the work supervised by a licensed Master, Master Special, Limited or Limited Special Electrician?",
        "requirement": "Delaware's examination route requires 8,000 hours of full-time experience under an appropriately licensed supervising electrician.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Obtain a Verification of Employment form from each supervising employer/licensee.",
      "Keep W-2 records in case an employer is no longer available to complete verification.",
      "Confirm that the claimed solar duties are electrical work covered by the NEC."
    ],
    "sources": [
      {
        "label": "Delaware Division of Professional Regulation — Journeyperson Electrician",
        "href": "https://dpr.delaware.gov/boards/electrician/journeyperson/",
        "note": "Current journeyperson application routes and employment-verification requirements."
      }
    ]
  },
  "FL": {
    "name": "Florida",
    "credential": "Local journeyman electrician credential",
    "mode": "jurisdiction",
    "summary": "Florida DBPR does not issue or regulate journeyman electrician licenses at the state level. Journeyman requirements are handled by the county or municipality where the worker intends to practice, so there is no single statewide hour rule to apply here.",
    "jurisdictionLabel": "County or municipality",
    "nextSteps": [
      "Identify the county or municipality whose journeyman rules apply.",
      "Check that jurisdiction's experience, supervision, exam and documentation requirements.",
      "Keep detailed employer/supervisor records because local boards may require affidavits or verification."
    ],
    "sources": [
      {
        "label": "Florida DBPR — Electrical Contractors FAQ",
        "href": "https://www2.myfloridalicense.com/electrical-contractors/faqs/",
        "note": "DBPR guidance stating that journeyman electricians are licensed through local jurisdictions rather than the state."
      }
    ]
  },
  "GA": {
    "name": "Georgia",
    "credential": "Electrical Contractor Class I / Class II",
    "mode": "contractor",
    "summary": "Georgia's state electrical board licenses electrical contractors rather than a statewide journeyman-electrician credential. Solar work experience may matter toward a contractor application, but it should not be treated as progress toward a single statewide journeyman-hour threshold.",
    "jurisdictionLabel": "City or county, if a local worker credential is involved",
    "nextSteps": [
      "Decide whether your target is a Georgia electrical-contractor license or a local employer/union apprenticeship milestone.",
      "Review the Board's current Class I or Class II experience requirements before treating any solar hours as qualifying contractor experience.",
      "Keep records showing the electrical scope and level of responsibility on each project."
    ],
    "sources": [
      {
        "label": "Georgia Secretary of State — Board of Electrical Contractors FAQ",
        "href": "https://sos.ga.gov/page/board-electrical-contractors-faq",
        "note": "State board scope and electrical-contractor licensing information."
      }
    ]
  },
  "HI": {
    "name": "Hawaii",
    "credential": "Journey Worker Electrician (EJ)",
    "mode": "standard",
    "summary": "Hawaii's Journey Worker Electrician route requires five years and at least 10,000 hours of qualifying residential/commercial wiring experience, plus the required electrical academic coursework.",
    "target": {
      "value": 10000,
      "unit": "hours",
      "label": "Reported residential/commercial wiring experience"
    },
    "questions": [
      {
        "id": "education",
        "label": "Have you completed the required electrical academic coursework for the EJ route?",
        "requirement": "Hawaii requires an educational component for journey-worker electrician classifications in addition to work experience.",
        "severity": "problem"
      }
    ],
    "notes": [
      {
        "title": "Hawaii also has specialty electrician classifications.",
        "body": "A different classification can carry a different experience and coursework requirement; confirm that EJ is the credential matching your work scope.",
        "type": "info"
      }
    ],
    "nextSteps": [
      "Separate residential/commercial wiring work from specialty or non-electrical solar duties.",
      "Keep employer certifications supporting the five-year/10,000-hour record.",
      "Retain coursework records accepted by the University of Hawaii Community College system."
    ],
    "sources": [
      {
        "label": "Hawaii DCCA PVL — Electrician/Plumber Requirements and Application",
        "href": "https://cca.hawaii.gov/wp-content/uploads/2026/01/Require-App-for-Electrician-Plumber_11.25.pdf",
        "note": "Current experience and coursework requirements for electrician classifications."
      }
    ]
  },
  "ID": {
    "name": "Idaho",
    "credential": "Electrical Journeyman",
    "mode": "program",
    "summary": "Idaho's standard apprenticeship pathway requires completion of a Board-approved electrical apprenticeship program and 8,000 hours of supervised electrical-installation work. The application also provides a separate experience pathway for applicants without the approved-program completion.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported experience against the apprenticeship pathway"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Did you complete a Board-approved electrical apprenticeship program?",
        "requirement": "The standard Idaho 8,000-hour pathway is paired with completion of a Board-approved electrical apprenticeship program.",
        "severity": "warning"
      },
      {
        "id": "supervision",
        "label": "Were these hours supervised electrical-installation work?",
        "requirement": "Idaho's 8,000-hour apprenticeship pathway requires supervised electrical-installation work.",
        "severity": "problem"
      }
    ],
    "notes": [
      {
        "title": "Idaho has an alternate experience route.",
        "body": "Applicants without approved apprenticeship completion may need substantially more verified supervised experience under the alternate pathway.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Keep Work Verification Forms for every employer and supervisor.",
      "Confirm whether you are applying through the approved-apprenticeship route or the separate experience route.",
      "Exclude duties the Board does not treat as electrical installation work."
    ],
    "sources": [
      {
        "label": "Idaho DOPL — Electrical Journeyman Application",
        "href": "https://dopl.idaho.gov/wp-content/uploads/2024/08/ELE-Journeyman-Application-1.pdf",
        "note": "Current journeyman application pathways and supervised-work requirement."
      }
    ]
  },
  "IL": {
    "name": "Illinois",
    "credential": "Local electrician / electrical-contractor requirements",
    "mode": "jurisdiction",
    "summary": "Illinois does not use one statewide journeyman-hour rule in this checker. Illinois law expressly permits municipalities to regulate/register electrical contractors, and electrician requirements can depend on the local jurisdiction.",
    "jurisdictionLabel": "Municipality or local authority",
    "nextSteps": [
      "Identify the municipality or local authority that controls the credential you are pursuing.",
      "Use that authority's published experience and examination rules.",
      "Keep documentation that distinguishes electrical installation from non-electrical solar labor."
    ],
    "sources": [
      {
        "label": "Illinois General Assembly — Illinois Municipal Code, electrical contractors",
        "href": "https://ilga.gov/legislation/ILCS/details?ActID=802&ActName=Illinois+Municipal+Code.&ChapAct=65+ILCS+5%2F&Chapter=MUNICIPALITIES&ChapterID=14&MajorTopic=GOVERNMENT&SeqEnd=183100000&SeqStart=174700000",
        "note": "Municipal authority concerning electrical-contractor registration."
      }
    ]
  },
  "IN": {
    "name": "Indiana",
    "credential": "Local electrician / electrical-contractor credential",
    "mode": "jurisdiction",
    "summary": "Indiana does not license most construction contractors, including electrical contractors, at the state level. The state's business guide directs these trades to local licensing requirements that vary by city and county.",
    "jurisdictionLabel": "City or county",
    "nextSteps": [
      "Identify the city or county licensing authority for the work location.",
      "Check the local journeyman/master experience and exam rules before counting hours.",
      "Keep employer and supervisor verification for each work period."
    ],
    "sources": [
      {
        "label": "Indiana — Business Owner's Guide",
        "href": "https://www.in.gov/core/business_guide.html",
        "note": "Official state guidance explaining that construction trades other than plumbers commonly use local licensing that varies by city and county."
      }
    ]
  },
  "IA": {
    "name": "Iowa",
    "credential": "Class A Journeyman Electrician",
    "mode": "program",
    "summary": "Iowa's Class A Journeyman route is apprenticeship-centered: state law requires successful completion of a U.S. Department of Labor-registered apprenticeship, with Board-recognized post-secondary alternatives for certain graduates.",
    "questions": [
      {
        "id": "registration",
        "label": "Have you completed a U.S. Department of Labor-registered apprenticeship or a Board-recognized equivalent pathway?",
        "requirement": "Iowa's Class A Journeyman route requires completion of a registered apprenticeship, subject to recognized alternative training paths.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Confirm that your apprenticeship or post-secondary program is recognized for the Class A route.",
      "Use your official apprenticeship/OJT record rather than an informal personal hour total.",
      "Keep records showing the solar tasks were electrical work within the program's work processes."
    ],
    "sources": [
      {
        "label": "Iowa DIAL — Electrical Licensing",
        "href": "https://dial.iowa.gov/licenses/building/electrical-licensing",
        "note": "Class A Journeyman apprenticeship and recognized training-program information."
      }
    ]
  },
  "KS": {
    "name": "Kansas",
    "credential": "Local electrician license",
    "mode": "jurisdiction",
    "summary": "Kansas law allows cities and counties to license electricians within their jurisdictions and to use local examinations. A local license can therefore control whether and how work experience is credited.",
    "jurisdictionLabel": "City or county",
    "nextSteps": [
      "Identify the city or county whose electrician license you are pursuing.",
      "Review that jurisdiction's experience, exam and reciprocity rules.",
      "Preserve detailed employer and supervisor records for the local application."
    ],
    "sources": [
      {
        "label": "Kansas Legislature — K.S.A. 12-1527",
        "href": "https://kslegislature.gov/b2025_26/laws/012_000_0000_chapter/012_015_0000_article/012_015_0027_section/012_015_0027_k/",
        "note": "City/county authority to examine and license electricians within the local jurisdiction."
      }
    ]
  },
  "KY": {
    "name": "Kentucky",
    "credential": "Electrician License",
    "mode": "standard",
    "summary": "Kentucky's electrician route uses 8,000 hours of electrical-trade experience. Current state application materials also identify approved apprenticeship classroom training that can substitute for part of the experience requirement.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported electrical-trade experience"
    },
    "notes": [
      {
        "title": "Approved apprenticeship training can affect the experience calculation.",
        "body": "Current Kentucky application materials provide an education substitution route; verify the exact current credit before filing.",
        "type": "info"
      }
    ],
    "nextSteps": [
      "Obtain the experience verification required by the state application.",
      "Keep approved apprenticeship/classroom records if you plan to use an education substitution.",
      "Separate electrical-trade work from general solar construction duties."
    ],
    "sources": [
      {
        "label": "Kentucky Department of Housing, Buildings and Construction — Electrical New Application Checklist",
        "href": "https://dhbc.ky.gov/Documents/Electrical%20New%20Application%20Checklistst%202.4.25.pdf",
        "note": "Current electrician application experience and documentation checklist."
      }
    ]
  },
  "LA": {
    "name": "Louisiana",
    "credential": "Electrical contractor classification / local worker rules",
    "mode": "contractor",
    "summary": "Louisiana's statewide licensing board regulates electrical contracting classifications rather than a single statewide journeyman-electrician hour credential. Worker-level licensing or permitting can depend on the local authority and work arrangement.",
    "jurisdictionLabel": "Parish, city or licensing authority, if applicable",
    "nextSteps": [
      "If your goal is journeyman status, identify the local authority or employer/apprenticeship rule that applies.",
      "If your goal is contractor qualification, review the LSLBC electrical classification requirements instead of using a journeyman-hour threshold.",
      "Keep verifiable records of electrical installation responsibilities."
    ],
    "sources": [
      {
        "label": "Louisiana State Licensing Board for Contractors — Exams and Classifications",
        "href": "https://lslbc.louisiana.gov/exams-classifications/",
        "note": "State electrical contractor classification and scope."
      }
    ]
  },
  "ME": {
    "name": "Maine",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Maine's standard journeyman route requires 8,000 work hours in electrical installations plus 576 hours of approved study, with several education/program alternatives that can change when the examination may be taken.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported electrical-installation experience"
    },
    "questions": [
      {
        "id": "education",
        "label": "Have you completed the required approved electrical study/apprenticeship instruction for your route?",
        "requirement": "Maine's standard journeyman route combines field experience with approved electrical study, subject to alternative pathways.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Keep records showing electrical-installation hours and the license/status under which they were performed.",
      "Retain the full 576-hour education record or approved apprenticeship documentation.",
      "Check whether an alternate school/program route changes the amount or timing of required field experience."
    ],
    "sources": [
      {
        "label": "Maine Office of Professional and Occupational Regulation — Journeyman Electrician",
        "href": "https://www11.maine.gov/pfr/professionallicensing/professions/electricians/licensing/journeyman-electrician-senior-journeyman-electrician",
        "note": "Current journeyman experience and education routes."
      },
      {
        "label": "Maine Legislature — 32 MRSA §1202-B",
        "href": "https://legis.maine.gov/statutes/32/title32sec1202-B.html",
        "note": "Statutory journeyman qualification pathways."
      }
    ]
  },
  "MD": {
    "name": "Maryland",
    "credential": "Journeyperson Electrician",
    "mode": "program",
    "summary": "Maryland has more than one journeyperson route. The approved-apprenticeship waiver route expressly uses at least 576 classroom hours and 8,000 work hours; other applicants can qualify through the state's separate experience/examination framework.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported work experience against the apprenticeship-waiver route"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Did you complete an electrician apprenticeship approved by MATC or the Federal Office of Apprenticeship?",
        "requirement": "The Maryland waiver route requires completion of an approved apprenticeship with at least 576 classroom hours and 8,000 work hours.",
        "severity": "warning"
      }
    ],
    "nextSteps": [
      "Identify whether you are using the approved-apprenticeship waiver or another journeyperson route.",
      "Keep the apprenticeship completion certificate, classroom record and work-hour record if using the waiver.",
      "For the non-waiver route, document work under a Maryland licensed master electrician or other qualifying supervisor."
    ],
    "sources": [
      {
        "label": "Maryland Department of Labor — Licensing Applications",
        "href": "https://www.labor.maryland.gov/license/elec/elechowtoapply.shtml",
        "note": "Approved-apprenticeship journeyperson route."
      },
      {
        "label": "Maryland Department of Labor — License Requirements",
        "href": "https://www.labor.maryland.gov/license/elec/elecreq.shtml",
        "note": "Current journeyperson experience framework and apprenticeship waiver."
      }
    ]
  },
  "MA": {
    "name": "Massachusetts",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Massachusetts requires 8,000 hours of work over at least four years under a licensed Massachusetts Journeyman, together with 600 hours of Board-approved education for the Journeyman Electrician examination route.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported supervised work experience"
    },
    "questions": [
      {
        "id": "supervision",
        "label": "Were the hours completed under a licensed Massachusetts Journeyman?",
        "requirement": "Massachusetts requires 8,000 work hours over at least four years under a licensed Massachusetts Journeyman.",
        "severity": "problem"
      },
      {
        "id": "education",
        "label": "Have you completed 600 hours of Board-approved education?",
        "requirement": "The Journeyman Electrician exam route requires 600 hours of Board-approved education.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Keep Massachusetts employment certification records for each employer.",
      "Confirm that the supervising individual held the required Massachusetts journeyman license.",
      "Retain the complete 600-hour Board-approved education record."
    ],
    "sources": [
      {
        "label": "Massachusetts — Apply for an Individual Electrical or Systems License",
        "href": "https://www.mass.gov/how-to/apply-for-an-individual-electrical-or-systems-license",
        "note": "Current Journeyman Electrician education and work-experience requirements."
      }
    ]
  },
  "MI": {
    "name": "Michigan",
    "credential": "Electrical Journeyman",
    "mode": "standard",
    "summary": "Michigan requires 8,000 hours and four years as an electrical apprentice, with work related to electrical construction or maintenance. Apprentice registration must remain active while working.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported apprentice electrical experience"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Was your Michigan electrical-apprentice registration active during the work period?",
        "requirement": "Michigan requires active apprentice registration and states that an apprentice cannot be on the job site without it.",
        "severity": "problem"
      },
      {
        "id": "supervision",
        "label": "Was the work performed under qualifying licensed supervision?",
        "requirement": "Michigan's journeyman experience must be gained under the supervision required by the state electrical licensing framework.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Verify your apprentice registration history for the entire claimed work period.",
      "Keep employer records showing electrical construction/maintenance duties and licensed supervision.",
      "Retain related technical instruction records required during apprenticeship."
    ],
    "sources": [
      {
        "label": "Michigan LARA — Electrical Examination, Licensing and Registration",
        "href": "https://www.michigan.gov/lara/bureau-list/bcc/sections/licensing-section/exam-lic/electrical-examination-licensing-registration-application-information",
        "note": "Current apprentice and journeyman licensing requirements."
      }
    ]
  },
  "MN": {
    "name": "Minnesota",
    "credential": "Class A Journeyworker Electrician",
    "mode": "standard",
    "summary": "Minnesota measures Class A journeyworker experience in months rather than a simple statewide hour total: 48 months total are required, including at least 24 months wiring for and installing electrical wiring, apparatus and equipment. Other work categories have maximum credit limits.",
    "target": {
      "value": 48,
      "unit": "months",
      "label": "Reported experience months"
    },
    "amountLabel": "How many months of qualifying electrical experience are you checking?",
    "amountHint": "Do not convert hours mechanically. Minnesota evaluates experience by month and by work category.",
    "notes": [
      {
        "title": "Category limits matter.",
        "body": "For Class A journeyworker, Minnesota requires at least 24 months of wiring/installing experience and caps credit from maintenance, line work, controls and other categories.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Break your history into Minnesota's work categories instead of converting all solar time into one total.",
      "Confirm that at least 24 months are actual wiring/installation experience for the Class A journeyworker route.",
      "Preserve registered-unlicensed-worker and employer records for the work periods."
    ],
    "sources": [
      {
        "label": "Minnesota DLI — Experience Requirements for Electrical License",
        "href": "https://dli.mn.gov/workers/electrician-or-electrical-installer/experience-requirements-electrical-license",
        "note": "Current Class A journeyworker experience categories and month limits."
      },
      {
        "label": "Minnesota DLI — Electrical Licensing Basics",
        "href": "https://www.dli.mn.gov/workers/electrician-or-electrical-installer/electrical-licensing-basics",
        "note": "Worker registration and licensing basics."
      }
    ]
  },
  "MS": {
    "name": "Mississippi",
    "credential": "State contractor / local electrician requirements",
    "mode": "contractor",
    "summary": "Mississippi's statewide board licenses contractors and publishes contractor classifications. The checker does not apply one statewide journeyman-worker hour total because individual worker requirements can depend on the local or project context.",
    "jurisdictionLabel": "City, county or licensing authority, if applicable",
    "nextSteps": [
      "Identify whether you are pursuing a local electrician credential or a Mississippi contractor qualification.",
      "Use the applicable authority's experience verification requirements.",
      "Keep records of actual electrical installation work and responsibility level."
    ],
    "sources": [
      {
        "label": "Mississippi State Board of Contractors — Classifications",
        "href": "https://www.msboc.us/classifications/",
        "note": "State contractor classifications and scope."
      }
    ]
  },
  "MO": {
    "name": "Missouri",
    "credential": "Statewide electrical contractor / local license",
    "mode": "contractor",
    "summary": "Missouri has a statewide electrical-contractor license framework, while political subdivisions may still establish local electrical-contractor licenses. This does not create one statewide journeyman-worker hour target for solar employees.",
    "jurisdictionLabel": "City, county or political subdivision",
    "nextSteps": [
      "Determine whether your target credential is a local worker license or a statewide/local contractor license.",
      "If a local journeyman credential applies, use the issuing political subdivision's experience rules.",
      "Keep project, employer and supervisor documentation for any future experience verification."
    ],
    "sources": [
      {
        "label": "Missouri Office of Statewide Electrical Contractors — Local Licensing FAQ",
        "href": "https://pr.mo.gov/electricalcontractors-FAQ-Political%20Subdivisions.asp",
        "note": "Relationship between the statewide contractor license and local licenses."
      },
      {
        "label": "Missouri Revised Statutes §324.925",
        "href": "https://revisor.mo.gov/main/OneSection.aspx?bid=35864&section=324.925",
        "note": "Political-subdivision licensing authority and recognition of statewide contractor licensure."
      }
    ]
  },
  "MT": {
    "name": "Montana",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Montana allows journeyman applicants to qualify through an approved apprenticeship/training route or by documenting 8,000 hours of legally obtained practical experience in electrical wiring, installation and repair.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported practical electrical experience"
    },
    "notes": [
      {
        "title": "Montana has a separate maintenance-experience route.",
        "body": "The journeyman application lists a much larger maintenance-hour threshold, so maintenance-heavy solar O&M should not automatically be counted against the 8,000-hour practical-experience route.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Obtain third-party verification for practical experience claimed outside an approved apprenticeship completion route.",
      "Keep records that show the work was legally obtained electrical experience.",
      "Separate maintenance-only history because Montana treats the maintenance route differently."
    ],
    "sources": [
      {
        "label": "Montana State Electrical Board — Journeyman Application",
        "href": "https://boards.bsd.dli.mt.gov/_docs/ele/journey-ele-app-24.pdf",
        "note": "Current journeyman education/experience routes and verification requirements."
      }
    ]
  },
  "NE": {
    "name": "Nebraska",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Nebraska requires four years and 8,000 hours of verifiable electrical-trade experience for a Journeyman Electrician license. The Board also distinguishes applicants with limited Nebraska in-state experience for reciprocity purposes.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported verifiable electrical-trade experience"
    },
    "nextSteps": [
      "Keep verifiable employer/apprentice records for the full four-year period.",
      "Document how much experience was earned in Nebraska if reciprocity matters to you.",
      "Retain any post-high-school electrical degree records you intend to use for allowed experience credit."
    ],
    "sources": [
      {
        "label": "Nebraska State Electrical Board — Journeyman Electrician",
        "href": "https://electrical.nebraska.gov/journeyman-electrician",
        "note": "Current 8,000-hour requirement and in-state experience note."
      }
    ]
  },
  "NV": {
    "name": "Nevada",
    "credential": "Electrical contractor qualifying individual",
    "mode": "contractor",
    "summary": "Nevada's statewide electrical licensing framework is contractor-based. A trade qualifying individual generally needs four years of experience at journeyman, foreman, supervising-employee or contractor level in the requested classification; this is not a simple apprentice-hour counter.",
    "jurisdictionLabel": "Local jurisdiction, if you are checking a worker-level credential",
    "nextSteps": [
      "If your goal is a local journeyman credential, identify the local authority separately.",
      "If your goal is to become a Nevada contractor qualifier, document four full years of qualifying-level experience within the applicable period.",
      "Preserve certificates of work experience and a detailed resume of project responsibility."
    ],
    "sources": [
      {
        "label": "Nevada State Contractors Board — License Requirements",
        "href": "https://www.nvcontractorsboard.com/licensing/license-requirements/",
        "note": "Experience requirements for contractor qualifying individuals."
      },
      {
        "label": "Nevada State Contractors Board — Contractor License Application",
        "href": "https://www.nvcontractorsboard.com/licensing/contractors-license-application/",
        "note": "Current contractor application framework."
      }
    ]
  },
  "NH": {
    "name": "New Hampshire",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "New Hampshire requires 8,000 hours of apprentice service/practical field experience and at least 600 hours of qualifying electrical education for the journeyman route.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported apprentice/practical experience"
    },
    "questions": [
      {
        "id": "supervision",
        "label": "Was the experience gained as an apprentice to a licensed journeyman or master electrician?",
        "requirement": "New Hampshire's standard route requires practical/field experience as an apprentice to a licensed journeyman or master electrician.",
        "severity": "problem"
      },
      {
        "id": "education",
        "label": "Have you completed at least 600 hours of qualifying electrical education?",
        "requirement": "RSA 319-C:7 currently requires not less than 600 hours of education meeting Board criteria.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Collect employer certifications showing dates, type of work and licensed-electrician verification.",
      "Keep the full electrical-schooling record, including safety instruction.",
      "Confirm any school or military experience credit with the Board before reducing the field-experience total."
    ],
    "sources": [
      {
        "label": "New Hampshire General Court — RSA 319-C:7",
        "href": "https://gc.nh.gov/rsa/html/XXX/319-C/319-C-7.htm",
        "note": "Statutory 8,000-hour and 600-hour education requirements."
      },
      {
        "label": "New Hampshire Electrical Rules — Elec 304",
        "href": "https://gc.nh.gov/rules/state_agencies/elec100-400.html",
        "note": "Journeyman experience verification and education rules."
      }
    ]
  },
  "NJ": {
    "name": "New Jersey",
    "credential": "Qualified Journeyman Electrician",
    "mode": "standard",
    "summary": "New Jersey's qualified journeyman registration framework uses 8,000 hours of practical electrical experience plus 576 classroom hours, with at least 4,000 practical hours obtained within five years of application.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported practical electrical experience"
    },
    "questions": [
      {
        "id": "education",
        "label": "Have you completed at least 576 classroom hours of related instruction?",
        "requirement": "New Jersey's qualified journeyman framework pairs practical experience with 576 classroom hours.",
        "severity": "problem"
      }
    ],
    "notes": [
      {
        "title": "Recent experience matters.",
        "body": "At least 4,000 hours of the practical-experience requirement must fall within the period specified by the current Board rule.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Keep practical-experience records showing actual wiring installation, alteration or repair work.",
      "Track the recency of your practical experience because the rule includes a recent-experience component.",
      "Retain all related classroom-instruction records."
    ],
    "sources": [
      {
        "label": "New Jersey Division of Consumer Affairs — Electrical Application Process Overview",
        "href": "https://www.njconsumeraffairs.gov/Documents/licenseprocess/Electrical-Application-Process-Overview.pdf",
        "note": "Qualified journeyman application framework."
      },
      {
        "label": "New Jersey Board of Examiners of Electrical Contractors — Applications",
        "href": "https://www.njconsumeraffairs.gov/elec/Pages/applications.aspx",
        "note": "Current board application materials."
      }
    ]
  },
  "NM": {
    "name": "New Mexico",
    "credential": "EE-98J Journeyman",
    "mode": "standard",
    "summary": "New Mexico's EE-98J residential and commercial electrical journeyman classification uses an 8,000-hour experience benchmark. The Construction Industries Division publishes this figure for the reciprocal EE-98J classification.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported EE-98J electrical experience"
    },
    "nextSteps": [
      "Confirm that your solar work fits the EE-98J scope rather than another journeyman classification.",
      "Keep employer verification showing electrical installation work and dates.",
      "Use the current CID/PSI application materials to confirm how your in-state or out-of-state experience must be documented."
    ],
    "sources": [
      {
        "label": "New Mexico RLD — Electrical Bureau",
        "href": "https://www.rld.nm.gov/construction-industries/find-a-bureau/bureaus/electrical-bureau/",
        "note": "Current EE-98J reciprocity and 8,000-hour experience information."
      },
      {
        "label": "New Mexico RLD — Rules, Laws and Building Codes",
        "href": "https://www.rld.nm.gov/construction-industries/rules-laws-and-building-codes/",
        "note": "Current Construction Industries rules and licensing references."
      }
    ]
  },
  "NY": {
    "name": "New York",
    "credential": "Local electrician / electrical-contractor license",
    "mode": "jurisdiction",
    "summary": "New York does not use one statewide electrician-license hour requirement. New York State guidance identifies electrical-contractor licensing as a local-government function, so the city or county rules control the credential.",
    "jurisdictionLabel": "City, county or local licensing authority",
    "nextSteps": [
      "Identify the city, county or other local authority for the job location.",
      "Use that local authority's journeyman/master/contractor experience and exam requirements.",
      "Keep work-history records detailed enough to satisfy local verification forms."
    ],
    "sources": [
      {
        "label": "New York State License Center — Business Wizard",
        "href": "https://data.ny.gov/api/views/x8bw-q2g6/rows.pdf?accessType=DOWNLOAD",
        "note": "State licensing resource stating that local government entities license electrical contractors."
      }
    ]
  },
  "NC": {
    "name": "North Carolina",
    "credential": "Electrical contractor qualified-individual experience",
    "mode": "contractor",
    "summary": "North Carolina's statewide Board licenses electrical contractors and qualified individuals rather than using one statewide journeyman-worker license. Experience credit depends on the contractor classification and on whether experience is primary or secondary.",
    "notes": [
      {
        "title": "North Carolina does not credit every kind of experience at 100%.",
        "body": "The Board's rules distinguish primary experience from secondary experience and assign different credit percentages to some apprentice/helper and related work.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Choose the contractor classification you ultimately intend to qualify for; Limited, Intermediate and Unlimited use different experience totals.",
      "Document actual electrical installation experience separately from apprentice/helper time because credit percentages can differ.",
      "Keep references and employer records that can verify the capacity in which the work was performed."
    ],
    "sources": [
      {
        "label": "North Carolina Board of Examiners of Electrical Contractors — Section .0200",
        "href": "https://www.ncbeec.org/section-0200/",
        "note": "Classification-specific experience requirements and primary/secondary experience credit."
      },
      {
        "label": "North Carolina Board — Title 21 NCAC 18B",
        "href": "https://www.ncbeec.org/title-21-ncac-18b/",
        "note": "Current Board rules, including hour-equivalent experience calculations."
      }
    ]
  },
  "ND": {
    "name": "North Dakota",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "North Dakota requires 8,000 hours of practical experience and Board-approved related training for journeyman eligibility. Apprentice registration is required, and the Board states that hours worked while unregistered or not renewed are lost.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported practical experience"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Was your North Dakota apprentice registration active for the claimed work period?",
        "requirement": "The Board states that hours worked while unregistered or not renewed will be lost and will not count toward journeyman licensure.",
        "severity": "problem"
      },
      {
        "id": "education",
        "label": "Have you completed the Board-approved related training required for your journeyman route?",
        "requirement": "North Dakota's published apprenticeship information pairs 8,000 practical hours with 576 hours of recognized training.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Verify that your apprentice registration was active for every period you plan to claim.",
      "Keep the 576-hour Board-approved training record.",
      "Preserve employer and supervising-electrician verification before leaving a job."
    ],
    "sources": [
      {
        "label": "North Dakota State Electrical Board — Apprenticeship Information & Registration",
        "href": "https://www.ndseb.com/?id=59",
        "note": "Registration deadline, lost-hour warning, 576 hours of related training and 8,000 hours of practical experience."
      }
    ]
  },
  "OH": {
    "name": "Ohio",
    "credential": "State electrical contractor / local tradesperson requirements",
    "mode": "contractor",
    "summary": "Ohio's state Construction Industry Licensing Board licenses electrical contractors. Ohio law also preserves local regulation or registration of tradespersons in certain contexts, so this checker does not assign a single statewide journeyman-hour total.",
    "jurisdictionLabel": "Municipality or local authority, if a worker credential is involved",
    "nextSteps": [
      "Identify whether you are pursuing an Ohio contractor license or a local worker credential.",
      "Use the applicable state or local experience rules rather than a generic 8,000-hour assumption.",
      "Keep project-role and supervisor records that can establish your level of responsibility."
    ],
    "sources": [
      {
        "label": "Ohio Revised Code — Chapter 4740",
        "href": "https://codes.ohio.gov/ohio-revised-code/chapter-4740",
        "note": "State electrical-contractor licensing framework and treatment of tradespersons."
      },
      {
        "label": "Ohio Revised Code — §715.27",
        "href": "https://codes.ohio.gov/ohio-revised-code/section-715.27",
        "note": "Municipal authority concerning contractor/tradesperson regulation and registration."
      }
    ]
  },
  "OK": {
    "name": "Oklahoma",
    "credential": "Unlimited Electrical Journeyman",
    "mode": "standard",
    "summary": "Oklahoma requires 8,000 verifiable hours in the electrical construction trade as a registered apprentice under direct supervision for the Unlimited Electrical Journeyman route, including 4,000 hours of commercial/industrial work. Up to 2,000 hours may be satisfied by formal electrical education.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported Unlimited Journeyman experience"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Were you a registered Oklahoma electrical apprentice while earning these hours?",
        "requirement": "Oklahoma's Unlimited Journeyman route requires verifiable experience as a registered apprentice.",
        "severity": "problem"
      },
      {
        "id": "supervision",
        "label": "Were the hours earned under direct supervision of a licensed journeyman or licensed contractor?",
        "requirement": "The published Unlimited Journeyman route requires direct licensed supervision.",
        "severity": "problem"
      }
    ],
    "notes": [
      {
        "title": "Commercial/industrial experience has a minimum.",
        "body": "At least 4,000 of the 8,000 hours for the Unlimited route must be commercial/industrial work.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Verify your apprentice registration for every period claimed.",
      "Break out at least 4,000 commercial/industrial hours for the Unlimited route.",
      "Keep direct-supervision and formal-education records."
    ],
    "sources": [
      {
        "label": "Oklahoma Construction Industries Board — Electrical Journeyman",
        "href": "https://oklahoma.gov/cib/your-industry/electrical/electrical-journeyman.html",
        "note": "Current Unlimited Electrical Journeyman experience and education-credit requirements."
      },
      {
        "label": "Oklahoma CIB — Electrical Apprentice",
        "href": "https://oklahoma.gov/cib/your-industry/electrical/electrical-apprentice.html",
        "note": "Apprentice registration information."
      }
    ]
  },
  "OR": {
    "name": "Oregon",
    "credential": "Limited Renewable Energy Technician (LRT)",
    "mode": "detailed",
    "summary": "Oregon has a renewable-energy-specific LRT pathway tied to completion of an approved apprenticeship.",
    "nextSteps": [],
    "sources": [
      {
        "label": "Oregon BCD — Electrical License Application Instructions",
        "href": "https://www.oregon.gov/bcd/Formslibrary/2570i.pdf",
        "note": "Qualification instructions for Oregon electrical licenses, including LRT."
      },
      {
        "label": "Oregon BOLI — Renewable Energy Technician Apprenticeship",
        "href": "https://www.oregon.gov/boli/apprenticeship/pages/trade-details.aspx?trade=Renewable+Enrgy+Tech",
        "note": "Official apprenticeship program information."
      },
      {
        "label": "Oregon BOLI — Renewable Energy JATC Standards",
        "href": "https://www.oregon.gov/boli/apprenticeship/Standards/1126_0994.0.pdf",
        "note": "4,000-hour term and work-process schedule."
      }
    ]
  },
  "PA": {
    "name": "Pennsylvania",
    "credential": "Municipal electrician / electrical-contractor credential",
    "mode": "jurisdiction",
    "summary": "Pennsylvania does not issue a statewide electrician license for ordinary construction trades. The Commonwealth states that some municipalities establish local licensure or certification requirements for electrical contractors or electricians.",
    "jurisdictionLabel": "Municipality",
    "nextSteps": [
      "Identify the municipality where the construction work occurred or where you intend to be licensed.",
      "Obtain that municipality's experience and examination requirements.",
      "Keep detailed employer/supervisor records because the Commonwealth does not maintain a single statewide electrician experience record."
    ],
    "sources": [
      {
        "label": "Pennsylvania Department of Labor & Industry — Contractor Licensing",
        "href": "https://www.pa.gov/agencies/dli/programs-services/labor-management-relations/bureau-of-occupational-and-industrial-safety/uniform-construction-code-home/contractor-licensing",
        "note": "Commonwealth guidance on municipal electrical licensing and lack of state jurisdiction over those local credentials."
      }
    ]
  },
  "RI": {
    "name": "Rhode Island",
    "credential": "Journeyperson Certificate B",
    "mode": "standard",
    "summary": "Rhode Island requires at least 8,000 hours (four years) of experience as a registered apprentice for the Journeyperson Certificate B route.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported registered-apprentice experience"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Were you registered as an electrical apprentice during the claimed work?",
        "requirement": "Rhode Island's Certificate B rule requires at least 8,000 hours of experience as a registered apprentice.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Keep apprentice-registration records for the full claimed period.",
      "Obtain notarized employer verification describing the type and extent of electrical experience.",
      "Separate hands-on electrical work from non-electrical solar construction."
    ],
    "sources": [
      {
        "label": "Rhode Island Department of State — Board of Examiners of Electricians Rules",
        "href": "https://rules.sos.ri.gov/regulations/part/260-30-15-7",
        "note": "Current journeyperson experience and application rules."
      }
    ]
  },
  "SC": {
    "name": "South Carolina",
    "credential": "Residential Electrician / commercial contractor path",
    "mode": "contractor",
    "summary": "South Carolina has a state Residential Electrician license and a separate commercial contractor framework. The relevant credential depends on the scope of the solar work, so a single statewide journeyman-hour number is not appropriate for every worker.",
    "notes": [
      {
        "title": "Scope changes the licensing path.",
        "body": "Residential and commercial electrical work are handled through different South Carolina licensing structures, so the checker does not combine them into one hour target.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Determine whether your target is the Residential Electrician license or a commercial electrical-contractor qualification.",
      "Use the current experience affidavit/application for that credential.",
      "Keep records that identify residential versus commercial/utility-scale electrical work."
    ],
    "sources": [
      {
        "label": "South Carolina LLR — Residential Electrician License",
        "href": "https://llr.sc.gov/res/reselectric.aspx",
        "note": "Current Residential Electrician license and application framework."
      },
      {
        "label": "South Carolina LLR — Residential Licensure",
        "href": "https://www.llr.sc.gov/res/licensure.aspx",
        "note": "Current residential licensing information."
      }
    ]
  },
  "SD": {
    "name": "South Dakota",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "South Dakota requires four years and 8,000 hours as a licensed apprentice electrician working under the employment and supervision of an electrical contractor before taking the journeyman exam.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported licensed-apprentice experience"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Were you a licensed South Dakota apprentice electrician while earning these hours?",
        "requirement": "South Dakota's journeyman route requires four years/8,000 hours as a licensed apprentice electrician.",
        "severity": "problem"
      },
      {
        "id": "supervision",
        "label": "Were you working under the employment and supervision of an electrical contractor?",
        "requirement": "The state ties journeyman eligibility to apprentice work under an electrical contractor's employment and supervision.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Verify that your apprentice license was active during the claimed work.",
      "Keep employer records showing employment and supervision by the electrical contractor.",
      "Retain work-history documentation before scheduling the journeyman exam."
    ],
    "sources": [
      {
        "label": "South Dakota Electrical Commission — Licensing",
        "href": "https://dlr.sd.gov/electrical/licensing.aspx",
        "note": "Current apprentice-to-journeyman experience requirement."
      }
    ]
  },
  "TN": {
    "name": "Tennessee",
    "credential": "State LLE / local journeyman or master credential",
    "mode": "jurisdiction",
    "summary": "Tennessee regulates electrical work at both state and local levels. The state Limited Licensed Electrician (LLE) applies in specified circumstances, while local jurisdictions may use their own journeyman/master licensing requirements.",
    "jurisdictionLabel": "City, county or permitting jurisdiction",
    "nextSteps": [
      "Identify the local jurisdiction and project scope before choosing the credential path.",
      "If using a local journeyman/master route, apply that jurisdiction's experience rules.",
      "If using the state LLE or contractor route, use the state scope and exam requirements instead of a journeyman-hour assumption."
    ],
    "sources": [
      {
        "label": "Tennessee Board for Licensing Contractors — Limited Licensed Electrician",
        "href": "https://www.tn.gov/commerce/regboards/contractors/license/get/lle.html",
        "note": "State LLE scope and instruction to check local licensing requirements."
      },
      {
        "label": "Tennessee State Fire Marshal — Electrical Permits Exempt Jurisdictions",
        "href": "https://www.tn.gov/commerce/fire/permit/electrical/exempt-jurisdictions.html",
        "note": "Jurisdictions with their own electrical permitting/inspection programs."
      }
    ]
  },
  "TX": {
    "name": "Texas",
    "credential": "Journeyman Electrician",
    "mode": "detailed",
    "summary": "Texas uses verified on-the-job training under a Texas-licensed Master Electrician for the Journeyman Electrician route.",
    "nextSteps": [],
    "sources": [
      {
        "label": "Texas TDLR — Journeyman Electrician License",
        "href": "https://www.tdlr.texas.gov/electricians/apply/individuals/journeyman-electrician.htm",
        "note": "7,000-hour exam-application threshold, 8,000-hour licensure requirement and supervisor verification."
      }
    ]
  },
  "UT": {
    "name": "Utah",
    "credential": "Journeyman Electrician",
    "mode": "program",
    "summary": "Utah has multiple Journeyman Electrician pathways. Current testing guidance allows exam eligibility after a four-year/576-hour apprenticeship education program plus 6,000 hours as a licensed apprentice, or after 16,000 hours of licensed apprentice experience; the final license/application path can impose additional experience documentation.",
    "target": {
      "value": 6000,
      "unit": "hours",
      "label": "Reported licensed-apprentice hours against the in-state exam-eligibility route"
    },
    "questions": [
      {
        "id": "registration",
        "label": "Were you a licensed apprentice electrician while earning the hours?",
        "requirement": "Utah's published journeyman pathways are based on licensed electrical experience.",
        "severity": "problem"
      },
      {
        "id": "education",
        "label": "Have you completed the four-year electrical apprenticeship education program or equivalent required for the 6,000-hour exam route?",
        "requirement": "The 6,000-hour testing-eligibility route is paired with a four-year program containing at least 576 classroom hours.",
        "severity": "warning"
      }
    ],
    "notes": [
      {
        "title": "Utah has an alternate 16,000-hour route.",
        "body": "Workers who do not use the apprenticeship-education route may qualify through a substantially larger licensed-experience pathway.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Confirm whether you are checking Utah in-state exam eligibility, an out-of-state application or another DOPL route.",
      "Keep proof that the work was performed as a licensed apprentice electrician under required supervision.",
      "Retain apprenticeship education records if using the education-plus-experience route."
    ],
    "sources": [
      {
        "label": "Utah DOPL — Electrical Exam Information",
        "href": "https://commerce.utah.gov/dopl/electrical/exam-information/",
        "note": "Current journeyman exam-eligibility pathways."
      },
      {
        "label": "Utah DOPL — Out-of-State Journeyman Applicants",
        "href": "https://commerce.utah.gov/dopl/electrical/apply-for-a-license/journeyman-electrician/out-of-state-not-by-endorsement/",
        "note": "Experience and apprenticeship-education requirements for out-of-state applicants."
      }
    ]
  },
  "VT": {
    "name": "Vermont",
    "credential": "Journeyman Electrician",
    "mode": "program",
    "summary": "Vermont does not publish one fixed hour total in the journeyman statute. Eligibility is based on verified completion of an electrical-wiring apprenticeship through the Vermont Apprenticeship Council, or equivalent training and experience acceptable to the Board, plus examination.",
    "questions": [
      {
        "id": "registration",
        "label": "Have you completed the Vermont Apprenticeship Council electrical-wiring apprenticeship, or received Board acceptance of an equivalent route?",
        "requirement": "Vermont journeyman eligibility is based on completed apprenticeship or equivalent training and experience acceptable to the Board.",
        "severity": "problem"
      }
    ],
    "nextSteps": [
      "Use the Vermont Apprenticeship Council completion record if you followed the registered apprenticeship route.",
      "If relying on equivalent training/experience, obtain a Board determination rather than assuming a self-calculated hour total is enough.",
      "Keep detailed work-process and supervision records for solar electrical experience."
    ],
    "sources": [
      {
        "label": "Vermont Legislature — 26 V.S.A. §903",
        "href": "https://legislature.vermont.gov/statutes/section/26/015/00903",
        "note": "Current statutory journeyman eligibility routes."
      }
    ]
  },
  "VA": {
    "name": "Virginia",
    "credential": "Journeyman Electrician",
    "mode": "program",
    "summary": "Virginia uses several combinations of formal vocational education and practical experience rather than one fixed hour total. The current regulation ranges from one year of practical experience with a related bachelor's degree to eight years with no formal vocational training.",
    "questions": [
      {
        "id": "education",
        "label": "Do you have formal vocational training or a related degree that you intend to use toward the Virginia journeyman route?",
        "requirement": "Virginia reduces the practical-experience period according to specified education levels; without qualifying education, the published route requires a longer practical-experience period.",
        "severity": "warning"
      }
    ],
    "nextSteps": [
      "Identify which Virginia education/experience combination you are using.",
      "Document practical electrical experience in the trade and the exact number of formal vocational-training hours or degree earned.",
      "Do not convert solar employment duration into a qualification without matching the applicable regulatory pathway."
    ],
    "sources": [
      {
        "label": "Virginia Administrative Code — 18VAC50-30-39",
        "href": "https://law.lis.virginia.gov/admincode/title18/agency50/chapter30/section39/",
        "note": "Current education-and-experience combinations for journeyman electrician examination eligibility."
      }
    ]
  },
  "WA": {
    "name": "Washington",
    "credential": "Journey Level (01) Electrician",
    "mode": "detailed",
    "summary": "Washington's current in-state Journey Level (01) route centers on registered apprenticeship, with separate rules for trainee records and other recognized paths.",
    "nextSteps": [],
    "sources": [
      {
        "label": "Washington L&I — Electrical Apprenticeship",
        "href": "https://www.lni.wa.gov/licensing-permits/electrical/electrical-licensing-exams-education/electrical-apprenticeship",
        "note": "Current Journey Level (01) apprenticeship pathway and recognized alternatives."
      },
      {
        "label": "Washington L&I — Electrical Trainee",
        "href": "https://www.lni.wa.gov/licensing-permits/electrical/electrical-licensing-exams-education/electrical-trainee",
        "note": "Experience reporting, supervision and affidavit timing where applicable."
      }
    ]
  },
  "WV": {
    "name": "West Virginia",
    "credential": "Journeyman Electrician",
    "mode": "program",
    "summary": "West Virginia allows a journeyman applicant to qualify through at least one year/2,000 hours of hands-on electrical work, completion of a U.S. Department of Labor registered electrical apprenticeship, or completion of an approved 1,080-hour vocational electrical program, depending on the application route.",
    "target": {
      "value": 2000,
      "unit": "hours",
      "label": "Reported hands-on experience against the experience-only exam route"
    },
    "notes": [
      {
        "title": "West Virginia offers non-hour alternatives.",
        "body": "Completion of an approved registered apprenticeship or qualifying vocational program can establish exam eligibility without using the 2,000-hour experience-only route.",
        "type": "info"
      }
    ],
    "nextSteps": [
      "Identify which of the three published qualification routes you are using.",
      "For the experience route, keep proof of hands-on above-ground structural wiring work performed under the required direction/instruction.",
      "For apprenticeship or vocational routes, retain the completion certificate required by the application."
    ],
    "sources": [
      {
        "label": "West Virginia State Fire Marshal — Electrical Exam Application",
        "href": "https://firemarshal.wv.gov/Divisions/Fire%20Services/Documents/Licensing/ELECTRICAL%20EXAM%20APPLICATION.pdf",
        "note": "Current journeyman examination qualification alternatives."
      },
      {
        "label": "West Virginia State Fire Marshal — Electrician Licensing Rules",
        "href": "https://firemarshal.wv.gov/media/39366/download?inline=",
        "note": "State electrician licensing rules and qualification routes."
      }
    ]
  },
  "WI": {
    "name": "Wisconsin",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Wisconsin's experience route requires at least 48 months and 8,000 hours installing, repairing and maintaining electrical wiring. Approved electrical education can substitute for part of the experience, subject to state limits.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported electrical-wiring experience"
    },
    "notes": [
      {
        "title": "Time duration matters as well as hours.",
        "body": "The standard Wisconsin route requires at least 48 months in addition to the 8,000-hour experience total.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Keep signed experience verification for each work period.",
      "Track both calendar months and hours because the standard route requires both.",
      "Retain transcripts if you intend to claim approved education credit."
    ],
    "sources": [
      {
        "label": "Wisconsin DSPS — Journeyman Electrician Application / Experience Form",
        "href": "https://dsps.wi.gov/Credentialing/Trades/fm3106.pdf",
        "note": "Current 48-month/8,000-hour experience route and education credit."
      }
    ]
  },
  "WY": {
    "name": "Wyoming",
    "credential": "Journeyman Electrician",
    "mode": "standard",
    "summary": "Wyoming requires four years/8,000 hours of electrical-wiring experience plus 576 hours of electrical classroom instruction through a Department of Labor-approved apprenticeship. Experience must include planning, layout and NEC work under qualifying supervision and cannot be concentrated entirely in one installation category.",
    "target": {
      "value": 8000,
      "unit": "hours",
      "label": "Reported electrical-wiring experience"
    },
    "questions": [
      {
        "id": "supervision",
        "label": "Was the work performed under direct supervision of a qualifying electrician for a licensed electrical contractor?",
        "requirement": "Wyoming's published journeyman qualification requires experience under direct supervision for a licensed electrical contractor.",
        "severity": "problem"
      },
      {
        "id": "education",
        "label": "Have you completed 576 hours of electrically related classroom instruction through an approved apprenticeship?",
        "requirement": "Wyoming requires 144 hours per year, or 576 hours over the four-year apprenticeship period.",
        "severity": "problem"
      }
    ],
    "notes": [
      {
        "title": "One work category cannot make up the entire 8,000 hours.",
        "body": "Wyoming states that no more than 75% of the required experience may be in any one of residential, commercial or industrial work.",
        "type": "warning"
      }
    ],
    "nextSteps": [
      "Keep records of residential, commercial and industrial experience separately; Wyoming limits how much can come from one category.",
      "Verify direct supervision by a qualifying electrician for a licensed electrical contractor.",
      "Retain all 576 hours of apprenticeship classroom records."
    ],
    "sources": [
      {
        "label": "Wyoming State Fire Marshal — Electrical Licensing",
        "href": "https://wsfm.wyo.gov/electrical-safety/licensing",
        "note": "Current journeyman exam qualifications, classroom requirement and category limits."
      }
    ]
  }
};

export const DETAILED_STATE_KEYS = new Set<StateKey>(["CA", "TX", "WA", "OR"]);
