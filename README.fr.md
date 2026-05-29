<a href="https://styrahem.se"><img src="docs/styrahem-logo.png" alt="StyraHem" width="100" align="right"></a>

# Sonoff Zigbee pour Homey

Application Homey qui ajoute la prise en charge des appareils Sonoff Zigbee.

Créé par [StyraHem](https://styrahem.se) — spécialistes suédois de la domotique et de l'IoT.

- **App Store:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Version test:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Aperçu interactif des drivers:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Langues:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · [ES](README.es.md) · **FR** · [IT](README.it.md) · [KO](README.ko.md) · [NL](README.nl.md) · [NO](README.no.md) · [PL](README.pl.md) · [RU](README.ru.md) · [SV](README.sv.md)

Ce dépôt est conservé pour les issues et la documentation. Le développement actif se fait dans un dépôt interne ; nous suivons les issues ici et appliquons les modifications approuvées en amont. Les PR ne sont pas acceptées directement — veuillez ouvrir une issue d'abord.

Si l'application vous fait gagner du temps, vous pouvez soutenir le développement ici :
- [Offrez-moi un café](https://buymeacoffee.com/styrahem)
- [Sponsoriser sur GitHub](https://github.com/sponsors/hakana)

## Appareils pris en charge

| Icône | Driver | Nom | Classe | Fabricant / productId | Statut |
|---|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Interrupteur BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Interrupteur DUO (2 canaux) | `socket` | `SONOFF` / `MINI-ZB2GS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Interrupteur DUO-L (2 canaux, sans neutre) | `socket` | `SONOFF` / `MINI-ZB2GS-L` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Volet roulant MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | Bouton RF | `button` | — / — | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Prise murale S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Bouton SNZB-01 | `button` | `eWeLink` / `WB01` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Bouton SNZB-01M | `button` | `SONOFF` / `SNZB-01M` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Bouton SNZB-01P | `button` | `eWeLink` / `SNZB-01P` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Thermomètre SNZB-02 | `sensor` | `eWeLink` / `TH01` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Thermomètre SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Thermomètre SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Thermomètre SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Thermomètre SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Thermomètre SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Capteur de mouvement SNZB-03 | `sensor` | `eWeLink` / `MS01` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Capteur de mouvement SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Capteur de porte/fenêtre SNZB-04 | `sensor` | `eWeLink` / `DS01` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Capteur de porte/fenêtre SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Capteur d’inondation/pluie SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Capteur de Présence SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Vanne d’eau SWV | `other` | `SONOFF` / `SWV` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | Thermostat TRVZB | `thermostat` | `SONOFF` / `TRVZB` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Rideau ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Interrupteur mural ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` | ![Test](https://img.shields.io/badge/-Test-yellow) |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Commutateur ZBMicro | `socket` | `SONOFF` / `ZBMicro` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Switch ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Switch ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Switch ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` | ![Actif](https://img.shields.io/badge/-Actif-brightgreen) |
| —  | `MINI-ZBDIM` | Mini-variateur intelligent | `light` | `SONOFF` / `MINI-ZBDIM` | ![Bientôt](https://img.shields.io/badge/-Bientôt-orange) |

_30 drivers · généré à partir des métadonnées de `driver.compose.json`._
