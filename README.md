## Commands

Run the development server:
```bash
npm run dev
```

Delete Cache: 
```bash
rm -rf .next
```

Clean Build:
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```


Tutorial Time Stamp: 4:50:00 Jul 14 2025

 
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


Cookies for NextJS 13.4+
```js
const session = await account.createEmailPasswordSession(email, password);
const cookieStore = await cookies(); // Required for Next.js 13.4+
cookieStore.set("appwrite-session", session.secret, {
  path: "/",
  httpOnly: true,
  sameSite: "strict",
  secure: true,
});
```