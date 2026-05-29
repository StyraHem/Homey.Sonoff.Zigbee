<a href="https://styrahem.se"><img src="docs/styrahem-logo.png" alt="StyraHem" width="100" align="right"></a>

# Sonoff Zigbee для Homey

Приложение Homey, добавляющее поддержку устройств Sonoff Zigbee.

Создано [StyraHem](https://styrahem.se) — шведские специалисты по умному дому и IoT.

- **App Store:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **Тестовая версия:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **Интерактивный обзор драйверов:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**Языки:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · [ES](README.es.md) · [FR](README.fr.md) · [IT](README.it.md) · [KO](README.ko.md) · [NL](README.nl.md) · [NO](README.no.md) · [PL](README.pl.md) · **RU** · [SV](README.sv.md)

Этот репозиторий используется для issue и документации. Активная разработка ведётся во внутреннем репозитории; мы отслеживаем issue здесь и переносим одобрённые изменения вверх по течению. PR напрямую не принимаются — пожалуйста, сначала откройте issue.

Если приложение экономит ваше время, вы можете поддержать разработку здесь:
- [Купить кофе](https://buymeacoffee.com/styrahem)
- [Спонсировать на GitHub](https://github.com/sponsors/hakana)

## Поддерживаемые устройства

| Иконка | Драйвер | Название | Класс | Производитель / productId | Статус |
|---|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | Выключатель BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` | ![Тест](https://img.shields.io/badge/-Тест-yellow) |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | Выключатель DUO (2-канальный) | `socket` | `SONOFF` / `MINI-ZB2GS` | ![Тест](https://img.shields.io/badge/-Тест-yellow) |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | Выключатель DUO-L (2-канальный, без нейтрали) | `socket` | `SONOFF` / `MINI-ZB2GS-L` | ![Тест](https://img.shields.io/badge/-Тест-yellow) |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | Рольставни MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` | ![Тест](https://img.shields.io/badge/-Тест-yellow) |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | RF-кнопка | `button` | — / — | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | Розетка S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | Кнопка SNZB-01 | `button` | `eWeLink` / `WB01` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | Кнопка SNZB-01M | `button` | `SONOFF` / `SNZB-01M` | ![Тест](https://img.shields.io/badge/-Тест-yellow) |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | Кнопка SNZB-01P | `button` | `eWeLink` / `SNZB-01P` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | Термометр SNZB-02 | `sensor` | `eWeLink` / `TH01` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | Термометр SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | Термометр SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | Термометр SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | Термометр SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | Термометр SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | Датчик движения SNZB-03 | `sensor` | `eWeLink` / `MS01` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | Датчик движения SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | Датчик двери/окна SNZB-04 | `sensor` | `eWeLink` / `DS01` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | Датчик двери/окна SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | Датчик дождя и наводнения СНЗБ-05П | `sensor` | `SONOFF` / `SNZB-05P` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | Датчик присутствия SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | Водяной клапан SWV | `other` | `SONOFF` / `SWV` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | Термостат ТРВЗБ | `thermostat` | `SONOFF` / `TRVZB` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | Штора ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | Настенный выключатель ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` | ![Тест](https://img.shields.io/badge/-Тест-yellow) |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | Переключатель ZBMicro | `socket` | `SONOFF` / `ZBMicro` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | Выключатель ZBMINI-L | `socket` | `SONOFF` / `ZBMINI-L` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | Переключатель ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | Переключатель ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` | ![В релизе](https://img.shields.io/badge/-В%20релизе-brightgreen) |
| —  | `MINI-ZBDIM` | Умный мини-диммер | `light` | `SONOFF` / `MINI-ZBDIM` | ![Скоро](https://img.shields.io/badge/-Скоро-orange) |

_30 драйверов · сгенерировано из метаданных `driver.compose.json`._
