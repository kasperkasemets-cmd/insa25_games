# INSA25 ühine mängude repo

See kaust on INSA25 mängude kogumik: ühine **dashboard** ja iga õpilase oma mäng eraldi kaustas. Backend puudub — kõik on staatiline HTML, CSS ja JavaScript.

## Mis on dashboard?

Fail `index.html` näitab kõigi mängijate kaarte. Kaardile klõpsates avaneb vastava õpilase mäng aadressil `games/<slug>/` (tavaliselt `index.html` selles kaustas).

Õpilaste nimed ja värvitoonid on kirjas failis `assets/js/players.js` muutujas `window.INSA25_PLAYERS`. Dashboardi loogika on `assets/js/dashboard.js`, välimus `assets/css/dashboard.css`.

## Õpilased ja kaustad

| Slug | Nimi |
|------|------|
| `martin` | Martin |
| `elinor` | Elinor |
| `christopher` | Christopher |
| `laura` | Laura |
| `kasper` | Kasper |
| `trevor` | Trevor |
| `martti` | Martti |
| `krete` | Krete |
| `keitlin` | Keitlin |
| `anto` | Anto |
| `kati` | Kati |
| `tristan` | Tristan |
| `vanessa` | Vanessa |
| `artem` | Artem |
| `margus` | Margus (näidismäng, DEMO) |

Slug on väiketähtedega eesnimi. `games/margus/` sisaldab valmis näidismängu; ülejäänud kaustades on kohatäide, mida õpilane asendab oma projektiga.

## Kuidas oma mängu lisada?

1. Leia oma kaust `games/<sinu-slug>/` (vt tabelit ülal).
2. Tööta **peamiselt** seal: oma `index.html`, stiilid ja skriptid võid hoida samas kaustas või alamkaustades.
3. Ära muuda `index.html` ega `assets/js/players.js` ilma kokkuleppeta — nii väheneb merge-konfliktide oht klassis.

Kui lisad uue faili, hoia lingid **suhtelistena** (nt `./style.css`, mitte absoluutne tee juurest), et leht töötaks nii kohalikult kui ka GitHub Pages’il alamteel (nt `.../ita25games/INSA25/`).

Tagasi dashboardile: lingi `../../index.html` (kui oled `games/<slug>/` kaustas).

## Kohalik avamine ja server

Skriptid on tavapärased (mitte ES moodulid), et lehte saaks avada ka **topeltklõpsuga** `INSA25/index.html` brauseris.

Soovitatav on siiski kasutada **lihtsat staatilist serverit** repo juurest või `INSA25` kaustast, nt:

```bash
cd INSA25
python -m http.server 8080
```

Seejärel ava brauseris `http://localhost:8080/`.

## Struktuur

| Asukoht | Roll |
|--------|------|
| `index.html` | Ühine avaleht |
| `assets/css/dashboard.css` | Dashboardi stiilid |
| `assets/js/players.js` | Õpilaste andmed |
| `assets/js/dashboard.js` | Kaartide joonistamine, taust, hiirefektid |
| `games/<slug>/` | Iga õpilase mängu sisu |
