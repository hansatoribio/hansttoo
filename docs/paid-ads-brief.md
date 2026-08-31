# Hansttoo paid ads brief

This brief keeps the advertiser, website, and appointment location accurate. It does not activate or spend on any campaign.

## Advertiser identity and address

- Advertiser/public brand: **Hans | NYC Tattoo Artist** / **Hansttoo** / **@hansttoo**.
- Business relationship: Hans is an independent/resident artist who takes appointments at Gara Art Studio. He does not own Gara Art Studio.
- Landing page: `https://hansttoo.vercel.app/` (English default).
- Appointment location shown on the website: Gara Art Studio, 240 W 40th St, New York, NY 10018.
- Do not connect Gara Art Studio's Google Business Profile, claim studio ownership, or add a Google Ads location asset without the studio owner's explicit authorization.
- A Search campaign can send traffic to the website without a Google Business Profile or public location asset. Google may separately require Hans's real legal or billing address for payments or advertiser verification. That private account information must match Hans's documents and must not be published as the appointment location.
- If Google asks about the relationship with another business, disclose that Hans is an independent/resident artist taking appointments at Gara Art Studio.

## Recommended Google Search launch

- Goal: confirmed consultation form submissions (`generate_lead`), not clicks.
- Campaign type: Search only. Keep Display Network and Search Partners off for the initial controlled test.
- Location: start with Manhattan and nearby high-intent areas supported by the budget. Use the location option **Presence: people in or regularly in the targeted locations**, not the broader presence-or-interest default.
- Language: English. Keep the Spanish landing page available, but do not mix Spanish ads into the first English ad group.
- Landing URL: homepage with UTM parameters; no duplicate ad-only page is needed.
- Suggested campaign URL template: `?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`. Google auto-tagging may additionally add `gclid`, `gbraid`, or `wbraid`.
- Bidding: begin with a controlled lead-focused setup appropriate to the available conversion history. Do not optimize to page views or button clicks when the confirmed form event is available.

Initial phrase/exact keyword themes:

- `tattoo artist nyc`
- `custom tattoo artist nyc`
- `tattoo artist manhattan`
- `anime tattoo artist nyc`
- `fine line tattoo artist nyc`
- `microrealism tattoo nyc`
- `tattoo near times square`

Initial negative keyword themes:

- free, apprenticeship, course, school, classes, jobs, salary
- supplies, machine, temporary tattoo, removal
- competitor/name searches observed in the live search-term report: `live by the sword`, `igla`, `isol`, `noble art`
- Add competitor names as phrase-match negatives only after verifying the query is a business/artist search, not a style query.

Responsive search ad assets for the controlled test:

- Headlines: `NYC Tattoo Artist`, `Custom Tattoos in Midtown`, `Anime Tattoo Artist NYC`, `Fine Line Tattoo Artist NYC`, `Microrealism Tattoos NYC`, `Tattoo Consultations NYC`, `Tattoo Artist Near Times Sq`, `Real Work by Hans NYC`, `Custom Tattoo Design NYC`, `Anime & Manga Tattoos NYC`, `Fine Line Tattoos Manhattan`, `Midtown Manhattan Tattoo`, `Request Tattoo Availability`, `Small Detailed Tattoos NYC`, `Book Tattoo Consultation`.
- Descriptions: `Send your idea, size and placement. Hans replies personally with fit and availability.`; `Custom anime, microrealism and fine line tattoos in Midtown Manhattan by appointment.`; `View real tattoo work by Hans and request a consultation online. References are optional.`; `Planning a tattoo in NYC? Share the essentials and get clear next steps from Hans.`
- Callouts: `Real Portfolio`, `Midtown Manhattan`, `English & Spanish`, `Custom Designs`, `By Appointment`, `Personal Reply`.
- Structured snippet, Styles: `Anime & Manga`, `Microrealism`, `Fine Line`, `Black & Grey`.
- Sitelinks: `View Real Work` → `/#portfolio`; `Meet Hans` → `/#about`; `Request Consultation` → `/#booking`; `Midtown Location` → `/#location`.

Truthful message direction:

- Custom Anime, Microrealism & Fine Line Tattoos
- Independent NYC Tattoo Artist
- Appointments at Gara Art Studio in Midtown Manhattan
- Send your idea, approximate size, and placement to request availability

Do not use “studio owner,” “private studio,” “best tattoo artist,” guaranteed availability, or unsupported pain/hygiene claims.

## Recommended Meta launch

- Meta ads do **not** send people to the website. Their destination is **Instagram Direct for @hansttoo**, with the **Send Message** call to action.
- Build the campaign in Meta Ads Manager using the current lead/messaging flow available to the account, choose Instagram as the messaging destination, and verify the preview opens the real @hansttoo Direct conversation before publishing.
- Use real portfolio media only, preferably vertical 9:16 work Hans confirms is his.
- Start with one campaign, one local ad set, and no more than two meaningfully different creatives so a small budget is not fragmented.
- Use a short welcome flow that asks only for the qualifying essentials: tattoo idea/style, approximate size, placement, and whether the person can attend an appointment in Midtown Manhattan. Hans can then request references naturally in the conversation.
- Measure messaging conversations started, qualified conversations, booked appointments, and deposits. Do not optimize or report this campaign using website page views, website Pixel `Lead`, or website form submissions.
- The website's Meta Pixel may remain available for consented website analytics or a separately approved future retargeting test, but it is not the conversion source for the Instagram Direct campaign.

Current-campaign correction prepared on 2026-08-31:

- The active 9-second creative produced 2 attributed conversations from $29.52 spend, with $14.76 per attributed conversation. Meta reported this cost as 4,820% above similar ad sets.
- The video averaged 2 seconds of watch time, with an 18% initial hook rate and only 4.28% reaching 9 seconds. The first creative therefore needs replacement; copy or audience changes alone will not repair retention.
- The ad-set draft uses strict audience controls, retains the local 15-mile radius around 240 W 40th St, and sets age to **18–45**. It remains unpublished until final approval.
- Next creative should show the strongest finished tattoo in the first frame, use a clear `NYC — YOUR NEXT TATTOO?` hook, show 2–3 close details, and end with `DM YOUR IDEA · MIDTOWN MANHATTAN`. Avoid logo-only or slow-intro frames.
- Suggested primary text: `NYC — ready for a custom tattoo? Anime, microrealism and fine line work by Hans in Midtown Manhattan. Send your idea for availability.`
- Keep the first quick-reply question qualifying: `What tattoo idea or style do you want?` Then ask size, placement, and whether the person can attend in Midtown.

## Conversion and lead-quality measurement

For Google Search, the website now stores only allow-listed attribution fields with a submitted lead: source, medium, campaign, content, search term, landing path, and supported click identifiers. Full referrer URLs and arbitrary query parameters are not stored. The admin panel shows readable campaign context while hiding raw click-ID values. Meta Direct leads remain inside Instagram and must be qualified and counted from the messaging workflow; they will not automatically appear in the website admin panel.

Primary operational metrics:

1. Google: confirmed website consultation requests and qualified requests.
2. Meta: Instagram messaging conversations started and qualified conversations.
3. Booked appointments and deposits, separated by Google/web form versus Meta/Instagram Direct.
4. Cost per qualified consultation and cost per booking/deposit for each channel.

## Still required before activation

- The Google Ads account already imports the primary GA4 `generate_lead` action and the live site loads GA4 measurement ID `G-262SJYL139` through the existing Google stack. The remaining requirement is a real end-to-end test proving that one successful consultation submission produces exactly one GA4 event and one imported Google Ads conversion.
- A real Google Ads account owned and verified by Hans, with billing and advertiser verification completed through Google's official interface.
- Final daily budget and geographic targeting decision.
- Tag Assistant test proving exactly one Google lead conversion per confirmed form submission.
- Meta Ads preview proving the call to action opens Instagram Direct for the real @hansttoo account, plus a test conversation confirming the welcome questions and inbox routing.
- Hans's approval of the creative, copy, privacy behavior, and campaign settings before any spend begins.
