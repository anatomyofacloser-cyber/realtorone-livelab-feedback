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
5. At the top, pick **setupSummary** in the function dropdown and click **▶ Run**. Google asks for permission: **Review permissions → your account → Advanced → Go to (project) → Allow**. This creates the *Responses* and *Summary* tabs.
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

## Where the data goes
- **Responses** tab: one row per submission (lab, name, email, WhatsApp, Q1–Q6, consent, whether the email was sent).
- **Summary** tab: per lab, the response count, average rating, average confidence, Yes / Tell me more / Not now counts, and emails sent.
- Q6 = **Yes** or **Tell me more** → instant alert email to SALES_EMAIL with the lead's details.
- Duplicate protection: the button can only be pressed once, the page remembers the submission on that phone, and the script ignores a repeat from the same email for the same lab within 10 minutes.

## Email limits (Google MailApp)
- Free Gmail account: **about 100 emails/day** (each submission = 1 email, +1 for a sales alert).
- Google Workspace account: **about 1,500/day**.
- If a webinar might get more than ~80 submissions, deploy the script from a Workspace account. Everyone can still download the PDF on the thank-you page anyway.
- Remaining quota: open the `/exec` URL (`mailQuotaLeft`).
