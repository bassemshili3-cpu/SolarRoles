# Method note

*Accompanies [Who keeps solar running?](/data/solar-operations-maintenance-workforce)*

## Data

- **Source.** Solar job postings preserved in public web archives and in our own collection, dated by the date they were captured, not by the date an employer or data provider reports.
- **Grouping.** Postings are grouped by near-identical text. The unit of analysis is a group of near-identical posting texts: it is not a hire, a filled position or a count of jobs on the market. The same text posted for several locations is not always merged: the 387 O&M groups correspond to about 223 employer and job-title combinations.
- **Coverage.** The archive does not cover all postings. Its composition changes over time as employers enter or leave it.

## Processing

- **Classification and detection.** Python scripts classify postings as operations and maintenance (O&M) with explicit rules, then detect mentions of tasks, knowledge and working conditions in the job description. Company presentations, benefits, legal text and recruiters' keyword lists are excluded.
- **The 7 categories.** Diagnosis and repair; electrical work or knowledge (including an electrician licence); inverters; inspection; specific safety rules; preventive maintenance; documentation such as work orders or maintenance software.
- **Monitoring software.** It is not counted, because its detection was not reliable enough.
- **Estimated shares.** For conditions and qualifications (travel, lifting, heights, driver's licence, electrician licence), for inverters, and for repair, the share is an estimate: detected mentions corrected for the precision of the detection, measured on verified samples. These corrections rest on small samples. Other shares are direct detection results. Every share is labelled as such in the draft.

## Checks

- **Automated checks.** Samples of postings were independently re-coded, blind, by automated coding procedures. This was used to measure the precision of the classification and of the detection, and to look for O&M postings the classifier missed (their share could not be estimated reliably; see Limits). Disagreements between automated codings were resolved through an additional automated review of the posting.
- **Targeted human reading by the author.** Three rounds, 47 distinct postings in all (one posting read in two rounds), chosen among difficult or influential cases, postings at the threshold of the 7-category figure, and a few controls. The reader did not see the codes assigned by the automated checks. In the first round, the sentences found by the detection were highlighted; in the second, nothing was highlighted; in the third, the sentences found for each detected category were shown, and the reader judged whether each category really concerned the person hired.
  - **What it led to.** Two detection rules were corrected: company text without a heading, and recruiters' keyword lists. Estimates built on the automated re-coding of the 7 categories, which over-counted some categories, were not used.
  - **The figure kept.** The 7-category figure is the automated detection result, presented as such. The third round checked 15 postings around the threshold (10 detected at exactly four categories, 5 above, 15 employers), with a decision rule fixed before reading: all 15 were confirmed. Over the second and third rounds, all 20 postings read that were detected at four or more were confirmed, and 4 of the 9 read that were detected below four in fact had four or more. In the third round the reader saw the detected sentences, which may favour confirmation. This supports the figure but does not measure it.
  - **Its limits.** This reading covers a targeted selection, not all postings. It does not validate every estimate.
- **Reproducibility.** Internal figures are calculated by script. A registry links them to their populations and records external sources; checks compare the source draft with that registry.

## Limits

- **Postings are not jobs.** A mention is not proof that a task is or is not done.
- **The trend describes our archive.** The rise of the O&M share is an evolution within our archive. About half of it (net 3.4 of 6.4 points) reflects which employers the archive contains in each period: employers absent in 2020-22 (not necessarily new after 2023) add 6.0 points, employers absent in 2024-26 remove 2.6. It is not evidence of a national rise in hiring or of a shortage.
- **Classifier recall.** The classifier misses some O&M postings. Their number could not be estimated reliably enough to correct the shares, so the shares describe the postings identified.
- **Repeated postings and sources.** Some large employers post near-identical templates in many locations. Counting the first posting per employer and normalized job title (a sensitivity test: postings sharing an employer and a title are not necessarily the same template), 63% of O&M postings mention at least four of the seven categories (71.1% on all postings); without the largest such employer, 69%; on the main archive series alone, 72%. Travel is mentioned in 61-66% of postings under these readings, troubleshooting or repair in 90-93% (detection before precision correction). The gap between SERVICE and MAINTENANCE postings in mentions of lifting or heights holds in each reading (71-75% against 37-51%); it describes postings in our archive, as classified automatically.
- **Electrician licence.** It can be required, a plus, or state-dependent within the same set of postings. The draft therefore describes it qualitatively, beyond the estimated share that mentions it.

## Figures used in the draft

| Figure | What it measures | Population |
|---|---|---|
| 13,254 | Archived posting observations in the solar series | all observations |
| 4,525 | Distinct posting texts after grouping near-duplicates | all solar postings |
| 387 | Postings classified as operations and maintenance (O&M) | posting-text groups |
| 87% | Precision of the O&M classification, estimated on an independent sample, before 19 corrections | sample of 83 postings, weighted |
| 64% mention travel | Postings mentioning travel: estimate from automated detection corrected for its measured precision | O&M postings (387 posting-text groups) |
| 48% mention lifting | Postings mentioning lifting: estimate as above | O&M postings (387 posting-text groups) |
| 40% mention work at heights | Postings mentioning work at heights: estimate as above | O&M postings (387 posting-text groups) |
| 43% require or mention a driver's licence | Postings requiring or mentioning a driver's licence: estimate as above | O&M postings (387 posting-text groups) |
| by our estimate, it appears in 30% of the postings | Postings mentioning an electrician's licence: estimate as above | O&M postings (387 posting-text groups) |
| About 90% of the O&M postings | Postings mentioning troubleshooting, diagnosis or corrective repair: estimate as above | O&M postings (387 posting-text groups) |
| 46% mention inverters | Postings mentioning inverters: estimate as above | O&M postings (387 posting-text groups) |
| 73% of MAINTENANCE postings mention travel | MAINTENANCE postings mentioning travel (automated detection) | MAINTENANCE postings (167) |
| Travel appears in 62% | SERVICE postings mentioning travel (automated detection) | SERVICE postings (179) |
| 75% of SERVICE postings mention lifting or heights | SERVICE postings mentioning lifting or heights (automated detection) | SERVICE postings (179) |
| against 43% of MAINTENANCE postings | MAINTENANCE postings mentioning lifting or heights (automated detection) | MAINTENANCE postings (167) |
| 167 MAINTENANCE and 179 SERVICE | Postings in the MAINTENANCE and SERVICE classes | O&M postings (387 posting-text groups) |
| 80 | Identified employers posting O&M roles | O&M postings (387 posting-text groups), identified employers |
| about 20% of the identified postings | Share of identified O&M postings from the three largest employers | O&M postings with an identified employer |
| 5.8% | O&M share of solar posting texts, 2020-22 | solar posting texts, 2020-22, dated by archive capture |
| 12.2% | O&M share of solar posting texts, 2024-26 | solar posting texts, 2024-26, dated by archive capture |
| add 6.0 points | Contribution of employers absent from the archive in 2020-22 (gross entry term of a shift-share decomposition) | solar posting texts, 2020-22 vs 2024-26 |
| remove 2.6 | Contribution of employers absent from the archive in 2024-26 (gross exit term) | same |
| a net of about 3.4 points | Net contribution of employer turnover in the archive (entries + exits) | same |
| The other 2.9 points come from employers present in both periods | Contribution of employers present in both periods (change within them + shifts in their weight; postings with an unidentified employer pooled as one) | same |
| of the 6.4-point change | Change in the O&M share between the two periods, in percentage points | same |
| 3.3% to 9.4% | O&M share among the 17 employers with at least 3 postings in both periods | their posting-text groups |
| 2.8% to 3.6% | Same, without Enphase, Recurrent Energy and PosiGen | the 14 other employers |
| Among the 17 employers with at least three postings in both periods | Identified employers with at least 3 postings in both 2020-22 and 2024-26 | identified employers |
| about seven in ten postings (71.1%) | Postings mentioning at least 4 of the 7 categories of tasks and knowledge: automated detection, 275 of 387. The 66–75% Wilson interval assumes independent observations; it does not measure classification, coverage or detection errors | O&M postings (387 posting-text groups) |
| 95% mention electrical work or knowledge | MAINTENANCE postings mentioning electrical work or knowledge (automated detection) | MAINTENANCE postings (167) |
| electrical skills in 82% | SERVICE postings mentioning electrical work or knowledge (automated detection) | SERVICE postings (179) |
| 19 postings | Postings removed from the O&M group after review (12 factory jobs, 6 installation foremen, 1 IT role) | initial O&M group |
| about 223 employer and normalized job-title groups | Groups formed from employer and normalized title; the first posting in each group is retained, even where texts within a group differ | O&M posting groups, including intermediaries and records with unknown employers |
| about six in ten when counting one posting per employer and normalized job title (62.8%) | Same 7-category measure, counting one posting per employer and normalized job title (the first listed). A sensitivity test: postings sharing an employer and a title are not necessarily the same template | about 223 employer and normalized job-title combinations |
| the share went from 4.3% to 12.7% | O&M share among the same 17 employers, each employer given the same weight (9 up, 1 down, 7 stable) | the 17 employers |
| fell to 2.8% in 2023 | O&M share of solar posting texts in 2023, the year left out of the comparison (16 of 565) | solar posting texts, 2023, dated by archive capture |
| 81% unweighted, 95% interval 68% to 90% | Precision of the O&M classification on the same sample without weighting (38 of 47 correct), with its 95% interval | sample of 47 postings classified O&M |
| 1,312 GW of generation and about 749 GW of storage | external source | Berkeley Lab, Queued Up: 2026 Edition (transmission interconnection queues, end of 2025) |
| some 2,061 GW in all | external source | sum of the two components published by Berkeley Lab (not stated as such on the page) |
| 773 GW | external source | Berkeley Lab, Queued Up: 2026 Edition (end of 2025) |
| 8,200 projects | external source | Berkeley Lab, Queued Up: 2026 Edition (end of 2025) |
| down 19% | external source | Berkeley Lab, Queued Up: 2026 Edition (end of 2025) |
| 13% | external source | Berkeley Lab, Queued Up: 2026 Edition (end of 2025) |
| over five years | external source | Berkeley Lab, Queued Up: 2026 Edition (end of 2025) |
| 21,833 | external source | IREC, National Solar Jobs Census (2024 data), irecusa.org |

External sources were checked against the pages linked below. Secondary capacity figures (installations, capacity additions) and historical job comparisons were left out of the draft because published versions differ.

## External sources

- [Lawrence Berkeley National Laboratory, Queued Up: 2026 Edition](https://eta.lbl.gov/publications/queued-2026-edition-characteristics).
- [Interstate Renewable Energy Council, National Solar Jobs Census: Solar Job Trends](https://irecusa.org/census-solar-job-trends/).
