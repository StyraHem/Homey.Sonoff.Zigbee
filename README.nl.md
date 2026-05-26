# Sonoff Zigbee voor Homey

Homey-app die ondersteuning toevoegt voor Sonoff Zigbee-apparaten.

- **App Store:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Testversie:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Interactief driver-overzicht:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Talen:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · [ES](README.es.md) · [FR](README.fr.md) · [IT](README.it.md) · [KO](README.ko.md) · **NL** · [NO](README.no.md) · [PL](README.pl.md) · [RU](README.ru.md) · [SV](README.sv.md)

Deze repository wordt onderhouden voor issues en documentatie. Actieve ontwikkeling gebeurt in een interne repo; we volgen issues hier en nemen goedgekeurde wijzigingen mee. PR's worden niet rechtstreeks geaccepteerd — open eerst een issue.

Als de app je tijd bespaart, kun je de ontwikkeling hier steunen:
- [Trakteer op koffie](https://buymeacoffee.com/styrahem)
- [Sponsor op GitHub](https://github.com/sponsors/hakana)

## Ondersteunde apparaten

| Pictogram | Driver | Naam | Klasse | Fabrikant / productId |
|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Schakelaar BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Schakelaar DUO (2-kanaals) | `socket` | `SONOFF` / `MINI-ZB2GS` |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Schakelaar DUO-L (2-kanaals, geen nul) | `socket` | `SONOFF` / `MINI-ZB2GS-L` |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Rolluik MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | RF-knop | `button` | — / — |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Stopcontact S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Knop SNZB-01 | `button` | `eWeLink` / `WB01` |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Knop SNZB-01M | `button` | `SONOFF` / `SNZB-01M` |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Knop SNZB-01P | `button` | `eWeLink` / `SNZB-01P` |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Thermometer SNZB-02 | `sensor` | `eWeLink` / `TH01` |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Thermometer SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Thermometer SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Thermometer SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Thermometer SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Thermometer SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Bewegingssensor SNZB-03 | `sensor` | `eWeLink` / `MS01` |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Bewegingssensor SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Deur-/raam sensor SNZB-04 | `sensor` | `eWeLink` / `DS01` |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Deur-/raam sensor SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Overstromings-/regensensor SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Aanwezigheidssensor SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Waterklep SWV | `other` | `SONOFF` / `SWV` |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | TRVZB thermostaat | `thermostat` | `SONOFF` / `TRVZB` |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Gordijn ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Wandschakelaar ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Schakelaar ZBMicro | `socket` | `SONOFF` / `ZBMicro` |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Schakelaar ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Schakelaar ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Schakelaar ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` |

_29 drivers · gegenereerd uit `driver.compose.json`-metadata._
