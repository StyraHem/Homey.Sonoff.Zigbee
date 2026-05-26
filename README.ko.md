# Homey용 Sonoff Zigbee

Sonoff Zigbee 장치를 지원하는 Homey 앱입니다.

- **앱 스토어:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/
- **테스트 버전:** https://homey.app/en-us/app/se.styrahem.sonoff.zigbee/Sonoff/test/
- **대화형 드라이버 개요:** https://styrahem.github.io/Homey.Sonoff.Zigbee/

**언어:** [English](README.md) · [DA](README.da.md) · [DE](README.de.md) · [ES](README.es.md) · [FR](README.fr.md) · [IT](README.it.md) · **KO** · [NL](README.nl.md) · [NO](README.no.md) · [PL](README.pl.md) · [RU](README.ru.md) · [SV](README.sv.md)

이 저장소는 이슈 및 문서를 위해 유지됩니다. 활발한 개발은 내부 저장소에서 이루어지며, 여기에서 이슈를 모니터링하고 승인된 변경 사항을 적용합니다. PR은 직접 받지 않습니다 — 먼저 이슈를 열어 주세요.

이 앱이 시간을 절약해 준다면 여기에서 개발을 후원할 수 있습니다:
- [커피 한 잔 사주기](https://buymeacoffee.com/styrahem)
- [GitHub에서 후원](https://github.com/sponsors/hakana)

## 지원되는 장치

| 아이콘 | 드라이버 | 이름 | 클래스 | 제조사 / productId |
|---|---|---|---|---|
| <img src="docs/icons/BASICZBR3.svg" width="48"> | `BASICZBR3` | 스위치 BASICZBR3 | `socket` | `SONOFF` / `BASICZBR3` |
| <img src="docs/icons/MINI-ZB2GS.svg" width="48"> | `MINI-ZB2GS` | 스위치 DUO (2채널) | `socket` | `SONOFF` / `MINI-ZB2GS` |
| <img src="docs/icons/MINI-ZB2GS-L.svg" width="48"> | `MINI-ZB2GS-L` | 스위치 DUO-L (2채널, 중성선 없음) | `socket` | `SONOFF` / `MINI-ZB2GS-L` |
| <img src="docs/icons/MINI-ZBRBS.svg" width="48"> | `MINI-ZBRBS` | 롤러 셔터 MINI-ZBRBS | `windowcoverings` | `SONOFF` / `MINI-ZBRBS` |
| <img src="docs/icons/RF.svg" width="48"> | `RF` | RF 버튼 | `button` | — / — |
| <img src="docs/icons/S60ZBTPF.svg" width="48"> | `S60ZBTPF` | 벽면 플러그 S60ZBTPF | `socket` | `SONOFF` / `S60ZBTPF`, `S60ZBTPG` |
| <img src="docs/icons/SNZB-01.svg" width="48"> | `SNZB-01` | 버튼 SNZB-01 | `button` | `eWeLink` / `WB01` |
| <img src="docs/icons/SNZB-01M.svg" width="48"> | `SNZB-01M` | 버튼 SNZB-01M | `button` | `SONOFF` / `SNZB-01M` |
| <img src="docs/icons/SNZB-01P.svg" width="48"> | `SNZB-01P` | 버튼 SNZB-01P | `button` | `eWeLink` / `SNZB-01P` |
| <img src="docs/icons/SNZB-02.svg" width="48"> | `SNZB-02` | 온도계 SNZB-02 | `sensor` | `eWeLink` / `TH01` |
| <img src="docs/icons/SNZB-02D.svg" width="48"> | `SNZB-02D` | 온도계 SNZB-02D | `sensor` | `SONOFF` / `SNZB-02D` |
| <img src="docs/icons/SNZB-02DR2.svg" width="48"> | `SNZB-02DR2` | 온도계 SNZB-02DR2 | `sensor` | `SONOFF` / `SNZB-02DR2` |
| <img src="docs/icons/SNZB-02LD.svg" width="48"> | `SNZB-02LD` | 온도계 SNZB-02LD | `sensor` | `SONOFF` / `SNZB-02LD` |
| <img src="docs/icons/SNZB-02P.svg" width="48"> | `SNZB-02P` | 온도계 SNZB-02P | `sensor` | `eWeLink` / `SNZB-02P` |
| <img src="docs/icons/SNZB-02WD.svg" width="48"> | `SNZB-02WD` | 온도계 SNZB-02WD | `sensor` | `SONOFF` / `SNZB-02WD` |
| <img src="docs/icons/SNZB-03.svg" width="48"> | `SNZB-03` | 모션 센서 SNZB-03 | `sensor` | `eWeLink` / `MS01` |
| <img src="docs/icons/SNZB-03P.svg" width="48"> | `SNZB-03P` | 모션 센서 SNZB-03P | `sensor` | `eWeLink` / `SNZB-03P` |
| <img src="docs/icons/SNZB-04.svg" width="48"> | `SNZB-04` | 문/창문 센서 SNZB-04 | `sensor` | `eWeLink` / `DS01` |
| <img src="docs/icons/SNZB-04P.svg" width="48"> | `SNZB-04P` | 문/창문 센서 SNZB-04P | `sensor` | `eWeLink` / `SNZB-04P` |
| <img src="docs/icons/SNZB-05P.svg" width="48"> | `SNZB-05P` | 홍수/비 센서 SNZB-05P | `sensor` | `SONOFF` / `SNZB-05P` |
| <img src="docs/icons/SNZB-06P.svg" width="48"> | `SNZB-06P` | 존재 센서 SNZB-06P | `sensor` | `SONOFF` / `SNZB-06P` |
| <img src="docs/icons/SWV.svg" width="48"> | `SWV` | 워터 밸브 SWV | `other` | `SONOFF` / `SWV` |
| <img src="docs/icons/TRVZB.svg" width="48"> | `TRVZB` | TRVZB 온도 조절기 | `thermostat` | `SONOFF` / `TRVZB` |
| <img src="docs/icons/ZBCurtain.svg" width="48"> | `ZBCurtain` | 커튼 ZBCurtain | `curtain` | `SONOFF` / `ZBCurtain` |
| <img src="docs/icons/ZBM5.svg" width="48"> | `ZBM5` | 벽 스위치 ZBM5 | `socket` | `SONOFF` / `ZBM5-1C-120`, `ZBM5-1C-80/86`, `ZBM5-2C-120`, `ZBM5-2C-80/86`, `ZBM5-3C-120`, `ZBM5-3C-80/86` |
| <img src="docs/icons/ZBMicro.svg" width="48"> | `ZBMicro` | ZBMicro 전환 | `socket` | `SONOFF` / `ZBMicro` |
| <img src="docs/icons/ZBMINIL.svg" width="48"> | `ZBMINIL` | ZBMINI-L 스위치 | `socket` | `SONOFF` / `ZBMINI-L` |
| <img src="docs/icons/ZBMINIL2.svg" width="48"> | `ZBMINIL2` | 스위치 ZBMINI-L2 | `socket` | `SONOFF` / `ZBMINIL2` |
| <img src="docs/icons/ZBMINIR2.svg" width="48"> | `ZBMINIR2` | 스위치 ZBMINI-R2 | `socket` | `SONOFF` / `ZBMINIR2` |

_29 드라이버 · `driver.compose.json` 메타데이터에서 생성됨._
