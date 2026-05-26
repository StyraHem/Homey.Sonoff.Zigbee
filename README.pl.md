<a href="https://styrahem.se"><img src="docs/styrahem-logo.svg" alt="StyraHem" width="80" align="right"></a>

# Sonoff Zigbee dla Homey

Aplikacja Homey dodająca obsługę urządzeń Sonoff Zigbee.

Stworzone przez [StyraHem](https://styrahem.se) — szwedzcy eksperci od smart home i IoT.

- **Sklep z aplikacjami:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Wersja testowa:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Interaktywny przegląd sterowników:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Języki:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · [ES](README.es.md) · [FR](README.fr.md) · [IT](README.it.md) · [KO](README.ko.md) · [NL](README.nl.md) · [NO](README.no.md) · **PL** · [RU](README.ru.md) · [SV](README.sv.md)

To repozytorium służy do zgłaszania issue i dokumentacji. Aktywny rozwój odbywa się w wewnętrznym repo; monitorujemy issue tutaj i wprowadzamy zatwierdzone zmiany. PR-y nie są akceptowane bezpośrednio — proszę najpierw otworzyć issue.

Jeśli aplikacja oszczędza Ci czas, możesz wesprzeć rozwój tutaj:
- [Postaw kawę](https://buymeacoffee.com/styrahem)
- [Sponsoruj na GitHub](https://github.com/sponsors/hakana)

## Obsługiwane urządzenia

| Ikona | Sterownik | Nazwa | Klasa | Producent / productId | Status |
|---|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Przełącznik BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Przełącznik DUO (2-kanałowy) | `socket` | `SONOFF` / `MINI-ZB2GS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Przełącznik DUO-L (2-kanałowy, bez przewodu neutralnego) | `socket` | `SONOFF` / `MINI-ZB2GS-L` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Roleta MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | Przycisk RF | `button` | — / — | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Gniazdko S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Przycisk SNZB-01 | `button` | `eWeLink` / `WB01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Przycisk SNZB-01M | `button` | `SONOFF` / `SNZB-01M` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Przycisk SNZB-01P | `button` | `eWeLink` / `SNZB-01P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Termometr SNZB-02 | `sensor` | `eWeLink` / `TH01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Termometr SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Termometr SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Termometr SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Termometr SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Termometr SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Czujnik ruchu SNZB-03 | `sensor` | `eWeLink` / `MS01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Czujnik ruchu SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Czujnik drzwi/okien SNZB-04 | `sensor` | `eWeLink` / `DS01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Czujnik drzwi/okien SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Czujnik powodzi/deszczu SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Czujnik Obecności SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Zawór wodny SWV | `other` | `SONOFF` / `SWV` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | Termostat TRVZB | `thermostat` | `SONOFF` / `TRVZB` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Kurtyna ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Włącznik ścienny ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Przełącznik ZBMicro | `socket` | `SONOFF` / `ZBMicro` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Przełącznik ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Przełącznik ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Przełącznik ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| —  | `MINI-ZBDIM` | Inteligentny mini-ściemniacz | `light` | `SONOFF` / `MINI-ZBDIM` | ![Wkrótce](https://img.shields.io/badge/-Wkrótce-orange) |

_30 sterowników · wygenerowano z metadanych `driver.compose.json`._
