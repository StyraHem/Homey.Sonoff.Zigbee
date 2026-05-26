<a href="https://styrahem.se"><img src="docs/styrahem-logo.svg" alt="StyraHem" width="80" align="right"></a>

# Sonoff Zigbee para Homey

Aplicación Homey que añade soporte para dispositivos Sonoff Zigbee.

Creado por [StyraHem](https://styrahem.se) — especialistas suecos en domótica e IoT.

- **App Store:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Versión de prueba:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Visión general interactiva de drivers:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Idiomas:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · **ES** · [FR](README.fr.md) · [IT](README.it.md) · [KO](README.ko.md) · [NL](README.nl.md) · [NO](README.no.md) · [PL](README.pl.md) · [RU](README.ru.md) · [SV](README.sv.md)

Este repositorio se mantiene para issues y documentación. El desarrollo activo ocurre en un repo interno; monitorizamos issues aquí y aplicamos los cambios aprobados aguas arriba. No se aceptan PRs directamente — abre primero una issue.

Si la app te ahorra tiempo, puedes apoyar el desarrollo aquí:
- [Invítame un café](https://buymeacoffee.com/styrahem)
- [Patrocinar en GitHub](https://github.com/sponsors/hakana)

## Dispositivos compatibles

| Icono | Driver | Nombre | Clase | Fabricante / productId | Estado |
|---|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Interruptor BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` | ![Prueba](https://img.shields.io/badge/-Prueba-yellow) |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Interruptor DUO (2 canales) | `socket` | `SONOFF` / `MINI-ZB2GS` | ![Prueba](https://img.shields.io/badge/-Prueba-yellow) |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Interruptor DUO-L (2 canales, sin neutro) | `socket` | `SONOFF` / `MINI-ZB2GS-L` | ![Prueba](https://img.shields.io/badge/-Prueba-yellow) |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Persiana MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` | ![Prueba](https://img.shields.io/badge/-Prueba-yellow) |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | Botón RF | `button` | — / — | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Enchufe S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Botón SNZB-01 | `button` | `eWeLink` / `WB01` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Botón SNZB-01M | `button` | `SONOFF` / `SNZB-01M` | ![Prueba](https://img.shields.io/badge/-Prueba-yellow) |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Botón SNZB-01P | `button` | `eWeLink` / `SNZB-01P` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Termómetro SNZB-02 | `sensor` | `eWeLink` / `TH01` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Termómetro SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Termómetro SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Termómetro SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Termómetro SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Termómetro SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Sensor de movimiento SNZB-03 | `sensor` | `eWeLink` / `MS01` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Sensor de movimiento SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Sensor de puerta/ventana SNZB-04 | `sensor` | `eWeLink` / `DS01` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Sensor de puerta/ventana SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Sensor de inundación/lluvia SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Sensor de Presencia SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Válvula de agua SWV | `other` | `SONOFF` / `SWV` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | Termostato TRVZB | `thermostat` | `SONOFF` / `TRVZB` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Cortina ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Interruptor de pared ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` | ![Prueba](https://img.shields.io/badge/-Prueba-yellow) |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Interruptor ZBMicro | `socket` | `SONOFF` / `ZBMicro` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Interruptor ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Interruptor ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Interruptor ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` | ![Activo](https://img.shields.io/badge/-Activo-brightgreen) |
| —  | `MINI-ZBDIM` | Mini regulador inteligente | `light` | `SONOFF` / `MINI-ZBDIM` | ![Próximamente](https://img.shields.io/badge/-Próximamente-orange) |

_30 drivers · generado a partir de los metadatos de `driver.compose.json`._
