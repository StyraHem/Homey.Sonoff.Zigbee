<a href="https://styrahem.se"><img src="docs/styrahem-logo.png" alt="StyraHem" width="100" align="right"></a>

# Sonoff Zigbee for Homey

Homey app that adds support for Sonoff Zigbee devices.

Made by [StyraHem](https://styrahem.se) — Swedish smart home and IoT specialists.

- **App Store:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Test version:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Interactive driver overview:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Languages:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · [ES](README.es.md) · [FR](README.fr.md) · [IT](README.it.md) · [KO](README.ko.md) · [NL](README.nl.md) · [NO](README.no.md) · [PL](README.pl.md) · [RU](README.ru.md) · [SV](README.sv.md)

This repository is kept for issues and documentation. Active development happens in an internal repo; we monitor issues here and pull approved changes upstream. PRs are not accepted directly — please open an issue first.

If this app saves you time, you can support development here:
- [Buy Me a Coffee](https://buymeacoffee.com/styrahem)
- [Sponsor on GitHub](https://github.com/sponsors/hakana)

## Supported devices

| Icon | Driver | Name | Class | Manufacturer / productId | Status |
|---|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Switch BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Switch DUO (2-channel) | `socket` | `SONOFF` / `MINI-ZB2GS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Switch DUO-L (2-channel, no neutral) | `socket` | `SONOFF` / `MINI-ZB2GS-L` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Roller shutter MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | RF-button | `button` | — / — | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Wall Plug S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Button SNZB-01 | `button` | `eWeLink` / `WB01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Button SNZB-01M | `button` | `SONOFF` / `SNZB-01M` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Button SNZB-01P | `button` | `eWeLink` / `SNZB-01P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Thermometer SNZB-02 | `sensor` | `eWeLink` / `TH01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Thermometer SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Thermometer SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Thermometer SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Termometer SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Thermometer SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Motion Sensor SNZB-03 | `sensor` | `eWeLink` / `MS01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Motion Sensor SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Door/window Sensor SNZB-04 | `sensor` | `eWeLink` / `DS01` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Door/window Sensor SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Flood/rain Sensor SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Presence Sensor SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Water Valve SWV | `other` | `SONOFF` / `SWV` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | Termostat TRVZB | `thermostat` | `SONOFF` / `TRVZB` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Curtain ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Wall switch ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Switch ZBMicro | `socket` | `SONOFF` / `ZBMicro` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Switch ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Switch ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Switch ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` | ![Live](https://img.shields.io/badge/-Live-brightgreen) |
| —  | `MINI-ZBDIM` | Smart Mini Dimmer | `light` | `SONOFF` / `MINI-ZBDIM` | ![Coming soon](https://img.shields.io/badge/-Coming%20soon-orange) |

_30 drivers · generated from `driver.compose.json` metadata._
