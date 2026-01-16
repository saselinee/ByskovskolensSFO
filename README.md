# Byskovskolens SFO – Webapplikation

Dette projekt er udviklet som en del af det afsluttende eksamensprojekt på Datamatikeruddannelsen.  
Formålet med projektet er at designe og udvikle en moderne, interaktiv og vedligeholdelsesvenlig hjemmeside til **Byskovskolens SFO**, som både fungerer som offentlig informationsside for forældre og børn samt som administrationsmodul for personalet.

---

## Projektets funktionalitet

Applikationen består af to hoveddele:

### Offentlig del
- Forside med dynamiske nyheder
- Om os-side med information om SFO’en
- Medarbejderside, der viser aktive medarbejdere
- Responsivt layout, der kan bruges på både computer og mobil

### Administrationsdel
- Login-beskyttet adgang for medarbejdere (admin)
- Oprettelse, redigering og sletning af nyheder (CRUD)
- Rollebaseret adgangskontrol (admin og superadmin)
- Superadmin kan oprette og deaktivere admin-brugere
- Session-baseret login

---

## Teknologi-stack

Projektet er udviklet med følgende teknologier:

- **Node.js + Express** – backend og routing
- **EJS** – server-side rendering af views
- **MongoDB** – database til brugere og nyheder
- **Mongoose (ODM)** – datamodellering og validering
- **express-session** – session-baseret login
- **bcrypt** – hashing af adgangskoder
- **Jest + Supertest** – automatiserede tests

---

## Installation og opsætning

### 1. Klon projektet
```bash
git clone https://github.com/saselinee/ByskovskolensSFO.git
cd ByskovskolensSFO

npm install


Start serveren
node server.js



Herefter kan applikationen tilgås i browseren på:
http://localhost:3000

Test

Projektet indeholder automatiserede tests for både positive og negative scenarier.

Kør tests
npm test

