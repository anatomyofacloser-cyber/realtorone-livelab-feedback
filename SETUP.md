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

## Private admin web page (password-protected)
**Admin URL:** https://anatomyofacloser-cyber.github.io/realtorone-livelab-feedback/admin.html

The page itself holds **no data**. After you sign in, it loads the responses straight from your Google Sheet through the Apps Script, so the public repo never contains anyone's details. New labs appear automatically. Your session lasts 6 hours and only lives in that browser tab (sign out or close the tab to end it). After 5 wrong passwords, sign-in is blocked for 15 minutes.

### A. Update the script (needed once for the admin page; repeat whenever I send a new Code.gs)
1. Open your Sheet → **Extensions → Apps Script**.
2. Select everything in `Code.gs` (Ctrl/Cmd + A), delete it, paste the new **apps-script/Code.gs**, and click **Save** 💾.
3. Put your sales email back on the `SALES_EMAIL` line if it was reset, and click **Save**.
4. Click **Deploy → Manage deployments**, select your **Web app** deployment, click the ✏ **Edit** pencil, set **Version: New version**, then click **Deploy**. The URL stays the same, so nothing changes on the form.

### B. Set your admin username and password (once)
1. In Apps Script, near the top of `Code.gs`, fill in the two lines:
   ```
   const SET_ADMIN_USER = 'guru';
   const SET_ADMIN_PASS = 'a-strong-password-here';
   ```
   (the password must be at least 8 characters). Click **Save**.
2. In the function dropdown at the top, choose **setAdminPassword** and click **▶ Run**. Accept permissions if asked. The log says "Admin login saved…".
3. **Clear both values** back to `''` (empty) and click **Save**. Only a SHA-256 hash is kept, in Project Settings → Script properties.
4. You don't need a new deployment for a password change. To change the password later, repeat steps 1–3.

### C. Use it
Open the admin URL and sign in. You'll see:
- a lab picker (**All labs** or one lab)
- cards for responses, average rating, average confidence, ebooks sent and hot leads
- the rating distribution, Q2 "what they got" bars and the Q6 donut
- **Hot leads**, with tap-to-email and tap-to-WhatsApp links
- consented quotes and a labs overview
- the full responses table, with search and **CSV export**

Anyone with the admin password can see the data, so don't share it. Rows deleted from the Sheet disappear from the admin page after **Refresh**.
