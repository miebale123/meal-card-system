# KSHSmanagement

School services for the meal card (cafeteria), dormitory, and clinic. Staff sign in and scan students' QR cards. One Expo app runs on phones and in the browser, backed by a small Node.js server. See [docs/architecture.md](docs/architecture.md) for why every service lives in this one repository.

| Folder | Contents |
| --- | --- |
| `backend/` | Node.js API (Express and SQLite) |
| `mobile/` | Expo app for phones and the web |
| `docs/` | Design notes |

## Requirements

- Node.js 22.13 or newer
- Expo Go (SDK 57) on the phone, on the same Wi-Fi as the computer running the backend

## Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```ini
JWT_SECRET=<random string of at least 32 characters>
# Optional
PORT=3000
CORS_ORIGIN=http://localhost:8081
```

- Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `CORS_ORIGIN` is a comma-separated list of the web addresses allowed to call the API from a browser. The default is Expo's web address.

Start the server with `npm start`.

### Staff accounts

Each account belongs to one service and only opens that service's page after signing in:

```bash
npm run add-staff -- meal_card_admin meals
npm run add-staff -- dorm_admin dorm
npm run add-staff -- clinic_admin clinic
```

- The script asks for a password of at least 8 characters.
- Passwords are stored hashed and can't be looked up later. To set a new one, run the command again with the same username.
- A device gets 5 wrong passwords every 15 minutes.
- A sign-in lasts 7 days.

### Students

```bash
npm run add-student -- <student-id> "<full name>"
```

The script prints where it saved the student's QR code image, in `backend/qr-codes/`.

## App (phone and web)

```bash
cd mobile
npm install
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to this computer's Wi-Fi address and the backend port, for example `http://192.168.1.69:3000`. Find the address with `ipconfig`.

- **Phone:** run `npx expo start` and scan the QR code with Expo Go.
- **Web:** run `npm run web`, or press `w` in the Expo terminal, to open http://localhost:8081.

After editing `mobile/.env`, restart Expo with `npx expo start -c`.

In the browser:

- A sign-in lasts until the tab is closed.
- The camera only works on `localhost` or over HTTPS.
- Chrome on Windows downloads the QR decoder from the internet the first time it scans.

Before committing app changes, run `npx expo lint` and `npx tsc --noEmit` in `mobile/`.

## Troubleshooting

- **"Can't reach the server" on the phone:** the computer's Wi-Fi address has probably changed. Update `EXPO_PUBLIC_API_URL` in `mobile/.env` and restart Expo with `npx expo start -c`.
- **PowerShell refuses to run `npm` or `npx`:** use `npm.cmd` and `npx.cmd`, or a Git Bash terminal.

## Never commit

`backend/.env`, `backend/meal-card.db`, and `backend/qr-codes/` hold the secret and students' QR tokens. `backend/.gitignore` already excludes them.
