# RealtorOne Live Lab feedback: setup (about 5 minutes)

**Form link for Lab #05:** https://anatomyofacloser-cyber.github.io/realtorone-livelab-feedback/05/

## Co-host chat message (paste this in the webinar chat in the last 3 minutes)
```
🎁 Get the free "15 Objections Every Dubai Realtor Faces" ebook: rate today's Lab in 30 sec 👇
https://anatomyofacloser-cyber.github.io/realtorone-livelab-feedback/05/
```

## One-time setup (you do this once)
1. Open https://sheets.new and name the sheet **RealtorOne Live Lab Feedback**.
2. In the sheet, click **Extensions → Apps Script**.
3. Delete everything in the editor, paste the full contents of **apps-script/Code.gs**, and click **Save** 💾.
4. On line 6, replace `PUT_YOUR_SALES_EMAIL_HERE` with the email that should get the "Yes / Tell me more" lead alerts. Click **Save** again.
5. At the top, pick **setup** in the function dropdown and click **▶ Run**. Google asks for permission: **Review permissions → your account → Advanced → Go to (project) → Allow**. This creates the *Responses*, *Summary* and *Dashboard* tabs.
6. *(Optional)* Pick **testEmail** and click **▶ Run**. You should get a branded test email.
7. Click **Deploy → New deployment**, then the ⚙ gear → **Web app**:
   - Description: `Live Lab feedback`
   - Execute as: **Me**
   - Who has access: **Anyone**
   
   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
8. **Send me that URL.** I'll put it in `labs.json` and redeploy the page. Until then, the form still gives attendees the PDF but **does not save responses or send emails**.

To check it's working, open the `/exec` URL in a browser. It should show `{"ok":true,...}`.

> If you ever change Code.gs: **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**. The URL stays the same.

## Every week: add a new Lab
**Easiest:** just send me the topic, subtitle, date and the PDF. I'll add it and give you the new link, QR and slide.

**Do it yourself (in the GitHub repo):**
1. Upload the PDF into the `pdfs/` folder (and optionally a cover image into `assets/`).
2. In `labs.json`, copy the `"05"` block, change the key and the `number` (e.g. `"06"`), title, short, subtitle, date, `reward_pdf`, `reward_title` and `reward_cover` (optionally `q2`, the "What did you get" options). Set `"latest": "06"`.
3. Copy the folder `05/` to `06/` and change `05` to `06` inside `06/index.html`. The new link is `…/realtorone-livelab-feedback/06/`.
4. GitHub Pages updates in about 1 minute.

## Your private admin = the Google Sheet
Attendees only ever see the form and the thank-you page. There is **no admin view on the public site**, and the web-app URL only returns a health check. Only people you share the Sheet with can see the data.

- **Responses** tab: every person's full answers, one row per submission (time, lab, name, email, WhatsApp, Q1–Q6, consent, ebook email sent, sales alert).
- **Dashboard** tab: type or pick a lab number in the gold cell **B2** (e.g. `Lab 05`) and everything updates:
  - response count, average rating, average confidence, ebook emails sent, consented quotes
  - rating distribution (1–5 ★)
  - Q2 "what they got" counts, with a bar chart
  - Q6 routing (Yes / Tell me more / Not now), with a donut chart
  - 🔥 **Hot leads**: everyone who said Yes or Tell me more, with name, email, WhatsApp, rating, confidence and blocker, newest first
  - 💬 **Latest consented quotes**, for the Past Live Lab card
- **Summary** tab: one row per lab, to compare labs week by week.
- Q6 = **Yes** or **Tell me more** → also an instant alert email to SALES_EMAIL.
- Duplicate protection: the button can only be pressed once, the page remembers the submission on that phone, and the script ignores a repeat from the same email for the same lab within 10 minutes.
- If the Dashboard ever looks broken (e.g. after deleting tabs), run **setup** again. It rebuilds the Summary and Dashboard without touching Responses.

## Email limits (Google MailApp)
- Free Gmail account: **about 100 emails/day** (each submission = 1 email, +1 for a sales alert).
- Google Workspace account: **about 1,500/day**.
- If a webinar might get more than ~80 submissions, deploy the script from a Workspace account. Everyone can still download the PDF on the thank-you page anyway.
- Remaining quota: open the `/exec` URL (`mailQuotaLeft`).
