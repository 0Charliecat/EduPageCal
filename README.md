# EduPageCal

> A **better** Calendar then the standard Edupage one

![BackgroundEraser_image 4.png](https://res.craft.do/user/full/c5a06d16-e546-e9e6-71fb-facd27438315/doc/BF914E37-F3E4-4D99-81A3-69187FDE7028/CE814300-69A2-4285-B9B7-1EBC84CE793D_2/BackgroundEraser_image%204.png)

## Configuration

1. Create `.keychain.json` file inside directory of this code and use `example.keychain.json` as your guide.
2. Type in Terminal `npm i` and then `node .`
3. Web server should be on port `4352`

Its recommended to have this on computer (or something which can run nodejs) that is always on, like Raspberry Pi or a Server and have a forwarded port `4352` if you can't forward port, use `cloudflared` or `ngrok`. If you want to use `Replit` **DONT PASTE YOUR PASSWORD IN CLEAR TEXT,** use secrets tab and change `keychain` variable in `index.js` to replit env.

Some calendars may not be happy with http iCal. Ignore that, they should have a button to Continue.

## TO-DO!

- [ ] Whole day school events, like: holidays or any others
- [ ] More languages, (Now only in 🇬🇧)

   If you have an Idea to add, make an issue

