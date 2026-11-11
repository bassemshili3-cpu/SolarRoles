# Method note

*Accompanies [What solar maintenance jobs ask for](/data/solar-operations-maintenance-workforce)*

## What we built and checked

We built an archive of U.S. solar job postings captured between 2020 and 2026 and kept 4,525 distinct posting texts. From them, our classification rules identified 387 operations and maintenance postings. In each one, we measured seven skill areas, travel and physical demands, and the status of the electrician licence.

Every licence sentence in those postings was extracted and classified, text by text, in two independent automated coding passes. The skill-area detectors were checked in two rounds of independent automated coding, and the author reviewed selected cases in four rounds. These checks improved the results along the way: 19 misclassified postings were removed, company presentations and keyword lists are now set aside more reliably, and the licence classification corrected a first rule-based count of required licences from 44 groups to 36.

## Data

- **Source.** Solar job postings preserved in public web archives and in our own collection, dated by the date they were captured, which can differ from the date an employer or data provider reports. 2026 is partial, through October 10.
- **Grouping.** Postings are grouped by near-identical text. The unit of analysis is a group of near-identical posting texts, an approximation of openings; hires and filled positions are outside its scope. The same text posted for several locations is sometimes kept as separate groups: the 387 O&M groups correspond to about 223 employer and job-title combinations.
- **Coverage.** The archive holds part of the postings published, and its composition changes over time as employers enter or leave it.
- **Tools.** Postings and their texts are kept in a SQLite catalogue and read with SQL queries. All classification, detection and counting is done by Python scripts applying explicit, documented rules; the scripts and their intermediate files are kept.

## Processing

- **Text cleaning.** Before detection, company presentations, benefits, legal text and recruiters' keyword lists are set aside, so that mentions come from the part of the description that concerns the job.
- **O&M classification.** Rules on the job title and duties classify a posting as maintenance, service, operations or monitoring (167, 179, 22 and 19 groups). Installers, factory jobs and commissioning crews are excluded.
- **The seven skill areas.** Electrical work or knowledge (wiring, electrical testing, schematics, the National Electrical Code, an electrician licence or a PV certification); safety procedures (OSHA training, NFPA 70E, arc flash, lockout/tagout, protective equipment, written safety rules); digital tools and software (computers, office software, tablets and field apps, maintenance or customer software, monitoring systems and SCADA); inverters; mechanical systems (trackers, racking, motors, gearboxes, hydraulics, torque, mechanical repair); batteries and storage; high and medium voltage (switchgear, transformers, substations). A mention can be a duty, a requirement or a preferred qualification. The areas overlap. Their shares are direct detection results.
- **Electrician licence.** Every sentence mentioning a licence was extracted from the 387 groups, with a broader search than the detection rules so as to catch missed mentions, and each distinct text was classified as required, a plus, depending on the state, an equivalent accepted, unstated, or not an electrician licence. "Required" means the posting makes the licence a condition of the job, including a licence of the state or city where the job is. The wider search brought in 15 groups the rules had missed, and this text-by-text classification replaced a first rule-based one that counted 44 groups as requiring a licence (36 after classification).
- **Travel and physical demands.** Travel, lifting, work at height and driver's licence are estimates: detected mentions corrected for the precision of the detection, measured on verified samples. These corrections rest on small samples.

## Checks

- **Automated checks.** Samples were re-coded by independent automated coding passes, blind to the detection results; disagreements between passes were settled by reading the posting.
  - O&M classification: precision 87% on an independent sample, weighted for how it was drawn (38 of 47 sampled O&M postings correct unweighted, 81%, 95% interval 68% to 90%), before 19 misclassified postings were removed (12 factory jobs, 6 installation foremen, 1 IT role). Precision after that correction has not been measured independently.
  - Seven skill areas: 48 sampled postings read in full (one per employer and title, at most two per employer), then 140 further detections (20 per area) checked for false positives. Precision 0.94 to 1.00 across the seven areas, recall 0.79 to 1.00. Mechanical systems has the lowest recall (0.79).
  - Electrician licence: the two passes agreed on 72 of 75 distinct licence texts; the three disagreements were settled by reading.
- **Targeted human reading by the author.** Four rounds of selected cases: difficult or influential cases, threshold cases and controls.
  - Rounds 1 to 3 (47 distinct postings) checked an earlier set of task categories, since replaced. They led to two corrections of the text cleaning that still apply: company text without a heading, and recruiters' keyword lists.
  - Round 4, with decision rules fixed before reading: 12 licence texts read without seeing the automated classification, 10 matched; the two others ("Must have a Chicago or Chicago suburb Journeyman's License", "Valid Electrical license in the state of MA") were read as depending on the place, whereas the classification counts a licence required in the state or city of the job as required. As the rule required, the whole "required" class was re-read: 12 of its 36 groups name the state or city of the job. The required share is reported with this definition (9.3%), and without these 12 groups (6.2%).
  - Round 4 also covered 10 postings detected at exactly four skill areas, with the triggering sentence of each area shown to the reader: 36 of 40 areas confirmed, 1 unsure. Two postings had an area the shown sentence did not support; on the full text, one of them still falls below four (its storage sentences describe the company). Because this reading focused on possible false detections at the threshold, it is reported as an observation; under the rule fixed beforehand, the 61.5% is kept as the automatic result.
- **What the checks changed.** The classification check led to the removal of 19 misclassified postings. The human readings led to better handling of company presentations without a heading and of recruiters' keyword lists, which had inflated some counts. The licence classification corrected the first rule-based count, from 44 required groups to 36, and the wider search added 15 groups the rules had missed.
- **Reproducibility.** Every figure is calculated by script from the archived postings, and each can be traced to its population and intermediate files.

## Limits

- **Postings describe what employers ask for.** The work actually done can differ from what a posting mentions.
- **The trend describes our archive.** The rise of the O&M share is an evolution within our archive. About half of it (net 3.4 of 6.4 points) reflects which employers the archive contains in each period: employers absent in 2020-22 (some of them already active earlier) add 6.0 points, employers absent in 2024-26 remove 2.6. The other 2.9 points come from employers present in both periods, including postings whose employer could not be identified, pooled as one. Reading it as a national rise in hiring or as a shortage would go beyond what the archive shows.
- **Classifier recall.** The classifier misses some O&M postings. Their number could not be estimated reliably enough to correct the shares, so the shares describe the postings identified.
- **Repeated postings.** Some large employers post near-identical templates in many locations. Counting the first posting per employer and normalized job title (a sensitivity test: postings sharing an employer and a title can still differ), 52.5% of O&M postings mention at least four of the seven skill areas (61.5% on all groups), and 9.4% require an electrician licence (9.3%).
- **Licence definition.** A licence can be required, a plus, or state-dependent within the same set of postings. 12 of the 36 "required" groups name the state or city of the job.

## Figures used in the report

| Figure | What it measures | Population |
|---|---|---|
| 13,254 | Archived posting observations in the solar series | all observations |
| 4,525 | Distinct posting texts after grouping near-duplicates | all solar postings |
| 387 | Postings classified as operations and maintenance (O&M) | posting-text groups |
| 167 maintenance, 179 service, 22 operations, 19 monitoring | O&M classes | O&M groups |
| 80 | Identified employers posting O&M roles | O&M groups with an identified employer |
| about 223 | Employer and normalized job-title combinations | O&M groups |
| 87% | Precision of the O&M classification, weighted, before 19 corrections | independent sample |
| 81%, 95% interval 68% to 90% | Same, unweighted (38 of 47) | sampled postings classified O&M |
| 5.8% (102 of 1,751) | O&M share of solar posting texts, 2020-22 | solar posting texts, dated by capture |
| 2.8% (16 of 565) | O&M share in 2023, the year left out of the comparison | same |
| 12.2% (269 of 2,209) | O&M share of solar posting texts, 2024-26 | same |
| 6.4 points; entry +6.0, exit -2.6, net 3.4, common employers 2.9 | Shift-share decomposition of the change between 2020-22 and 2024-26 | same |
| 7.4% to 11.1% | O&M share without the three largest O&M advertisers | same |
| 5.8% to 11.0% | O&M share, complete years 2021-22 vs 2024-25 | same |
| 84% (326) | Electrical work or knowledge, automatic detection | 387 O&M groups |
| 68% (264) | Safety procedures, automatic detection | same |
| 63% (245) | Digital tools and software, automatic detection | same |
| 56% (216) | Inverters, automatic detection | same |
| 44% (169) | Mechanical systems, automatic detection | same |
| 43% (166) | Batteries and storage, automatic detection | same |
| 26% (99) | High and medium voltage, automatic detection | same |
| 61.5% (238 of 387) | At least four of the seven skill areas detected | same |
| 52.5% | Same, one posting per employer and normalized title | about 223 combinations |
| three in four (75.7%, 293) | At least three of the seven skill areas | 387 O&M groups |
| 70% vs 22%; 41% vs 11% | Mechanical systems; high or medium voltage: maintenance vs service | 167 maintenance, 179 service groups |
| 69% vs 53%; 55% vs 30% | Digital tools; batteries: service vs maintenance | same |
| 38% (148) | Groups asking for an electrician licence in any form | 387 O&M groups |
| 9.3% (36), 95% interval 6.8% to 12.6% | Licence a condition of the job, including 12 groups naming the job's state or city | same |
| 6.2% (24) | Same, without the 12 groups naming the job's state or city | same |
| 72; 36; 4 | Licence a plus; depending on the state; equivalent accepted or unstated | same |
| 9.4%; 10.2%; 10.6% | Required share: one posting per employer and title; maintenance; service | as stated |
| 64%, 48%, 69%, 40% | Travel, lifting, driver's licence, work at height: estimates corrected for detection precision | 387 O&M groups |

## External source

- Interstate Renewable Energy Council (IREC), National Solar Jobs Census (2024 data), [irecusa.org/census-workforce-development](https://irecusa.org/census-workforce-development/): operations and maintenance was the only solar sector where hiring difficulty increased in 2024, with 23% of O&M employers finding it very difficult to find qualified workers; across all sectors, the reason employers cite most often is a lack of experience, training or technical skills. Accessed November 2026. This context comes from IREC’s survey of employers.

## Correction

- 11 November 2026: the driver's licence estimate was revised from 43% to 69%. The detection rule did not read typographic apostrophes ("Driver’s License"); no other figure changed.
