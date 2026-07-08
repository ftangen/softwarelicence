# Software & License Tracker — Spesifikasjon

Internt verktøy for å holde oversikt over programvareversjoner, lisenser og
EOL (End-of-Life) / EOS (End-of-Support) datoer på tvers av kundemiljøer.
Skal utvikles lokalt, deployes på en VM i et lukket (air-gapped) miljø.

## 1. Formål

Gi IT/sikkerhetsteamet én samlet oversikt over hvilken programvare som
kjører hos hvilke kunder, når den mister support, og status på lisenser —
med spesielt fokus på konvergerte IT/OT-miljøer (SCADA, ICS).

## 2. Navigasjon

Venstre sidebar, tre likestilte hovedpunkter:

- **Dashboard** — samlet oversikt/statistikk over alle registrerte assets
- **Customers** — liste over kunder med miljøtype og asset-status
- **Software** — samlet liste over all registrert programvare på tvers av kunder

## 3. Skjermer

### 3.1 Dashboard

- Toolbar: søk (kunde/software), filter på kunde, filter på status, "New entry"-knapp
- 4 statistikk-kort: Total registered / Critical (EOL < 30 dager) / Approaching (< 90 dager) / OK
- Datatabell med kolonner: Customer, Software, Version, EOL date, EOS date,
  License type, Status (pill-badge: grønn OK / gul Approaching / rød Critical)

### 3.2 Customers

- Kort-grid, ett kort per kunde
- Per kort: kundenavn, miljøtype-badge(r) — **IT og OT kan vises sammen**
  (multi-select, ikke enten/eller, siden miljøer ofte er konvergerte),
  antall prosjekter, antall registrerte assets, antall kritiske/nærmer-seg
- "New customer"-knapp øverst til høyre + eget "add new customer"-kort i grid'en
- New customer-modal: Customer name, Environment type (multi-select: IT, OT), Notes

### 3.3 Software

- Gruppert liste over programvare på tvers av kunder/prosjekter — én rad
  per programvarenavn, utvidbar for å vise kunde, prosjektnummer,
  prosjektnavn, versjon, EOL-dato og status per registrering
- Statusbadge på selve raden viser verste status i gruppen (f.eks.
  "2 critical")
- Søk dekker: software, kundenavn, prosjektnummer, prosjektnavn, versjon

### 3.4 "Add new entry"-modal (fra Dashboard)

Felter:
- Customer (dropdown, med "+ Add new customer" som alternativ nederst)
- Project (dropdown avhengig av valgt Customer, med "+ Add new project"
  som alternativ nederst — inkluderer prosjektnummer og prosjektnavn)
- Software name (tekst)
- Version (tekst)
- EOL date (datovelger)
- EOS date (datovelger)
- License type (dropdown: Perpetual, Subscription, Volume, Support)
- Notes (fritekst)

### 3.5 "Add new project" (inline i "Add new entry"-modalen)

Når "+ Add new project" velges i Project-dropdownen, åpnes et inline-panel
(ikke egen modal) rett under, med:
- Project number (tekst, 5 siffer, valideres — hjelpetekst: "Project number
  must be 5 digits.")
- Project name (tekst)

Panelet vises kun mens "+ Add new project" er valgt; resten av "Add new
entry"-skjemaet forblir synlig og uendret under.

## 4. Visuell stil

- Flat design, lys modus, ingen gradienter/skygger
- Blå som eneste aksentfarge for primærhandlinger
- Rød/gul/grønn reservert kun for status (kritisk/nærmer seg/OK)
- Enterprise SaaS-estetikk, god luft, sans-serif

## 5. Datamodell (foreløpig utkast — bekreftes av Fredrik)

En kunde kan ha **flere prosjekter**. Software-registreringer henger på
prosjektet, ikke direkte på kunden — det er slik det allerede fungerer i
praksis (f.eks. Melkøya-prosjekt 50697).

```
Customer
- id
- name
- environment_types: string[]   // ["IT"], ["OT"], eller ["IT", "OT"]
- notes

Project
- id
- customer_id (FK → Customer)
- project_number: string        // 5 siffer, f.eks. "50697"
- project_name
- notes

SoftwareEntry
- id
- project_id (FK → Project)
- software_name
- version
- eol_date
- eos_date
- license_type: enum (Perpetual, Subscription, Volume, Support)
- status: derived (Critical / Approaching / OK) basert på eol_date/eos_date
- notes
```

**Konsekvens for skjermer:**
- "Add new entry"-modalen må utvides med et Project-valg (avhengig av
  valgt Customer), i tillegg til "+ Add new project"-mulighet på samme
  måte som "+ Add new customer".
- Customer-kort på Customers-siden bør vise antall prosjekter, ikke bare
  antall assets direkte.
- Søk på Software-siden dekker: software, kundenavn, prosjektnummer,
  prosjektnavn, versjon.

Åpne punkter som avklares senere:
- Skal EOL/EOS-datoer hentes automatisk (f.eks. via endoflife.date API) eller
  registreres manuelt?
- Skal det være varsling (e-post/Teams) når noe nærmer seg EOL?
- Trenger Customer/Project flere felt (teknisk kontakt, hvilken
  IEC 62443-sone/nivå)?
- Skal prosjektnummer valideres som eksakt 5 siffer i skjemaet?

## 6. Teknisk stack

**Kontekst:** Utvikles på Fredriks maskin, kjøres på VM i lukket nett uten
internett-tilgang. Pakker/avhengigheter må kunne overføres og fungere uten
at VM-en har nettilgang.

- **Backend:** Node.js + Express
- **Database:** SQLite — filbasert, ingen egen DB-server å drifte
  - Unngå native moduler som `better-sqlite3` med mindre dev-maskin og
    VM matcher nøyaktig i OS/arkitektur/Node-versjon
  - Foretrekk `sql.js` (WASM) eller `node:sqlite` (innebygd, sjekk
    Node-versjon) for å slippe kompileringsproblemer på air-gapped VM
- **Prosesshåndtering:** PM2
- **Overføring til VM:**
  ```
  npm install --production
  npm prune --production
  # zip hele mappen inkl. node_modules
  # kopier til VM, unzip, pm2 start
  ```

## 7. Status

Mockups for Dashboard, Customers, Software, Add-entry (med inline Add
new project) og Add-customer-modaler er laget og godkjent i konsept.
Datamodell og varslingslogikk avklares fortløpende.
