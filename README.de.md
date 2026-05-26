<a href="https://styrahem.se"><img src="docs/styrahem-logo.svg" alt="StyraHem" width="80" align="right"></a>

# Sonoff Zigbee für Homey

Homey-App, die Unterstützung für Sonoff Zigbee-Geräte hinzufügt.

Entwickelt von [StyraHem](https://styrahem.se) — schwedische Smart-Home- und IoT-Spezialisten.

- **App Store:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Testversion:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Interaktive Treiberübersicht:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Sprachen:** [English](README.md) · [DA](README.da.md) · **DE** · [ES](README.es.md) · [FR](README.fr.md) · [IT](README.it.md) · [KO](README.ko.md) · [NL](README.nl.md) · [NO](README.no.md) · [PL](README.pl.md) · [RU](README.ru.md) · [SV](README.sv.md)

Dieses Repo dient für Issues und Dokumentation. Aktive Entwicklung erfolgt in einem internen Repo; wir verfolgen Issues hier und übernehmen genehmigte Änderungen upstream. PRs werden nicht direkt akzeptiert — bitte öffnen Sie zuerst ein Issue.

Wenn die App dir Zeit spart, kannst du die Entwicklung hier unterstützen:
- [Spendier einen Kaffee](https://buymeacoffee.com/styrahem)
- [Auf GitHub sponsern](https://github.com/sponsors/hakana)

## Unterstützte Geräte

| Symbol | Treiber | Name | Klasse | Hersteller / productId | Status |
|---|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Schalter BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Schalter DUO (2-Kanal) | `socket` | `SONOFF` / `MINI-ZB2GS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Schalter DUO-L (2-Kanal, ohne Neutralleiter) | `socket` | `SONOFF` / `MINI-ZB2GS-L` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Rollladen MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | RF-Taster | `button` | — / — | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Steckdose S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Taste SNZB-01 | `button` | `eWeLink` / `WB01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Taste SNZB-01M | `button` | `SONOFF` / `SNZB-01M` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Taste SNZB-01P | `button` | `eWeLink` / `SNZB-01P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Thermometer SNZB-02 | `sensor` | `eWeLink` / `TH01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Thermometer SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Thermometer SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Thermometer SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Thermometer SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Thermometer SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Bewegungssensor SNZB-03 | `sensor` | `eWeLink` / `MS01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Bewegungssensor SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Tür-/Fenstersensor SNZB-04 | `sensor` | `eWeLink` / `DS01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Tür-/Fenstersensor SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Überschwemmungs-/Regensensor SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Präsenzsensor SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Wasserventil SWV | `other` | `SONOFF` / `SWV` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | TRVZB-Thermostat | `thermostat` | `SONOFF` / `TRVZB` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Vorhang ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Wandschalter ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Schalter ZBMicro | `socket` | `SONOFF` / `ZBMicro` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Schalter ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Schalter ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Schalter ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| —  | `MINI-ZBDIM` | Smart Mini-Dimmer | `light` | `SONOFF` / `MINI-ZBDIM` | ![Demnächst](https://img.shields.io/badge/-Demn%C3%A4chst-orange) |

_30 Treiber · generiert aus `driver.compose.json`-Metadaten._
