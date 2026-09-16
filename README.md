# Nudge

A static progressive web app (PWA) that can be hosted directly on Vercel.

## Deploy to Vercel

1. Push this folder to a GitHub, GitLab, or Bitbucket repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Leave the framework preset as **Other** and the build command/output directory empty.
4. Select **Deploy**.

Vercel serves `index.html` and the assets in this repository directly. `vercel.json` ensures the service worker is always refreshed, so new deployments reach installed users.

Alternatively, deploy from the Vercel CLI:

```sh
npx vercel
```
