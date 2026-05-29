<a href="https://styrahem.se"><img src="docs/styrahem-logo.png" alt="StyraHem" width="100" align="right"></a>

# Sonoff Zigbee per Homey

App Homey che aggiunge il supporto ai dispositivi Sonoff Zigbee.

Realizzato da [StyraHem](https://styrahem.se) — specialisti svedesi di smart home e IoT.

- **App Store:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Versione di prova:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Panoramica interattiva dei driver:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Lingue:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · [ES](README.es.md) · [FR](README.fr.md) · **IT** · [KO](README.ko.md) · [NL](README.nl.md) · [NO](README.no.md) · [PL](README.pl.md) · [RU](README.ru.md) · [SV](README.sv.md)

Questo repository è mantenuto per issue e documentazione. Lo sviluppo attivo avviene in un repo interno; monitoriamo le issue qui e riportiamo le modifiche approvate a monte. Le PR non sono accettate direttamente — aprire prima una issue.

Se l'app ti fa risparmiare tempo, puoi supportare lo sviluppo qui:
- [Offrimi un caffè](https://buymeacoffee.com/styrahem)
- [Sponsorizza su GitHub](https://github.com/sponsors/hakana)

## Dispositivi supportati

| Icona | Driver | Nome | Classe | Produttore / productId | Stato |
|---|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Interruttore BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Interruttore DUO (2 canali) | `socket` | `SONOFF` / `MINI-ZB2GS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Interruttore DUO-L (2 canali, senza neutro) | `socket` | `SONOFF` / `MINI-ZB2GS-L` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Tapparella MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | Pulsante RF | `button` | — / — | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Presa S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Pulsante SNZB-01 | `button` | `eWeLink` / `WB01` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Pulsante SNZB-01M | `button` | `SONOFF` / `SNZB-01M` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Pulsante SNZB-01P | `button` | `eWeLink` / `SNZB-01P` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Termometro SNZB-02 | `sensor` | `eWeLink` / `TH01` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Termometro SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Termometro SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Termometro SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Termometro SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Termometro SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Sensore di movimento SNZB-03 | `sensor` | `eWeLink` / `MS01` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Sensore di movimento SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Sensore porta/finestra SNZB-04 | `sensor` | `eWeLink` / `DS01` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Sensore porta/finestra SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Sensore di allagamento/pioggia SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Sensore di Presenza SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Valvola dell'acqua SWV | `other` | `SONOFF` / `SWV` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | Termostato TRVZB | `thermostat` | `SONOFF` / `TRVZB` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Tenda ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Interruttore a parete ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Interruttore ZBMicro | `socket` | `SONOFF` / `ZBMicro` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Interruttore ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Interruttore ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Interruttore ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` | ![Attivo](https://img.shields.io/badge/-Attivo-brightgreen) |
| —  | `MINI-ZBDIM` | Mini dimmer intelligente | `light` | `SONOFF` / `MINI-ZBDIM` | ![In arrivo](https://img.shields.io/badge/-In%20arrivo-orange) |

_30 driver · generato dai metadati di `driver.compose.json`._
