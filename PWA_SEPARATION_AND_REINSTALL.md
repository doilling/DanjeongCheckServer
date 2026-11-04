# 단정체크·TRS 출석체크 PWA 분리 설치 안내

## 적용된 단정체크 값

| 항목 | 값 |
|---|---|
| Manifest | `/danjeong/manifest.webmanifest` |
| App ID | `/danjeong/danjeong-check-app` |
| 시작 주소 | `/danjeong/` |
| 앱 범위 | `/danjeong/` |
| 서비스 워커 | `/danjeong/sw.js` |
| 서비스 워커 범위 | `/danjeong/` |
| 192 아이콘 | `/danjeong/icon-192.png` |
| 512 아이콘 | `/danjeong/icon-512.png` |

단정체크 서비스 워커는 `/danjeong/` 밖의 요청을 처리하지 않으며,
`/danjeong/api/` 요청은 캐시에 저장하거나 오프라인 응답으로 대체하지 않습니다.

기존 `/danjeong/service-worker.js`는 이미 설치된 5.0.7 사용자를
새 `/danjeong/sw.js`로 안전하게 전환하기 위한 호환 파일입니다.
새 화면은 `/danjeong/sw.js`만 등록합니다.

## Caddy

기존 설정을 변경하지 않아도 됩니다.

```caddyfile
reverse_proxy /study/* 127.0.0.1:8765
reverse_proxy /danjeong/* 127.0.0.1:8787
```

`handle_path`로 변경하지 마세요. 단정체크 서버가 `/danjeong/` 경로를 직접 처리합니다.

## Root scope 서비스 워커 확인

단정체크 소스는 `/sw.js`를 등록하지 않습니다. 하지만 이전 설정이나 다른 프로그램이
같은 Origin의 `/` 범위 서비스 워커를 등록한 적이 있다면 수동으로 확인해야 합니다.

1. Chrome에서 `https://presentoo.duckdns.org/danjeong/`을 엽니다.
2. `F12` → **Application** → **Service Workers**로 이동합니다.
3. Scope와 Script URL을 확인합니다.
4. 정상 단정체크 항목은 다음과 같습니다.
   - Scope: `https://presentoo.duckdns.org/danjeong/`
   - Script: `https://presentoo.duckdns.org/danjeong/sw.js`
5. Scope가 `https://presentoo.duckdns.org/`인 항목은 Script URL을 먼저 확인합니다.
   `/study/`나 홈페이지가 실제로 사용하는 워커가 아닌, 과거의 잘못된 등록임이 확실할 때만
   **Unregister**를 누릅니다.

진단용 콘솔 명령:

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.table(registrations.map(registration => ({
    scope: registration.scope,
    script: registration.active?.scriptURL
      || registration.waiting?.scriptURL
      || registration.installing?.scriptURL
      || ''
  })));
});
```

잘못된 root(`/`) 등록임을 Script URL로 확인한 뒤에만 사용하는 제거 명령:

```javascript
navigator.serviceWorker.getRegistrations().then(async registrations => {
  for (const registration of registrations) {
    if (new URL(registration.scope).pathname === '/') {
      console.log('Unregister root service worker:', registration.scope);
      await registration.unregister();
    }
  }
  location.reload();
});
```

주의: root 서비스 워커를 자동으로 삭제하도록 단정체크 코드에 넣지 않았습니다.
같은 Origin의 홈페이지나 다른 앱이 사용하는 정상 워커를 실수로 제거하지 않기 위해서입니다.

## 기존 설치 앱 제거 및 재설치

1. 열려 있는 단정체크와 TRS 출석체크 앱 창을 모두 닫습니다.
2. `chrome://apps` 또는 설치된 앱의 메뉴에서 기존 단정체크·잘못 연결된 앱을 제거합니다.
3. 제거 화면에 사이트 데이터 삭제 선택지가 나오면 로그인 정보를 유지하려는 경우 체크하지 않습니다.
4. 위 절차로 잘못된 root scope 서비스 워커가 있는지 확인하고, 잘못된 항목만 Unregister합니다.
5. Chrome을 완전히 종료했다가 다시 실행합니다.
6. 먼저 단정체크 주소를 열어 설치합니다.
   - `https://presentoo.duckdns.org/danjeong/`
7. TRS 프로그램에도 다음과 같은 고유 Manifest가 적용된 것을 확인한 후 출석체크를 설치합니다.
   - ID: `/study/trs-attendance-app`
   - start_url: `/study/`
   - scope: `/study/`
   - 서비스 워커 scope: `/study/`
8. 출석체크 주소를 열어 별도로 설치합니다.
   - `https://presentoo.duckdns.org/study/`

TRS 프로그램에 고유 ID와 `/study/` 범위 설정이 아직 반영되지 않았다면,
단정체크만 수정한 상태에서는 두 앱 분리 설치가 완전히 보장되지 않습니다.

## 최종 확인

- Chrome DevTools → Application → Manifest의 단정체크 App ID가
  `/danjeong/danjeong-check-app`인지 확인
- 단정체크 앱 실행 시 `/danjeong/`이 열리는지 확인
- 출석체크 앱 실행 시 `/study/`가 열리는지 확인
- Service Workers에서 `/danjeong/`과 `/study/`가 서로 다른 등록인지 확인
- `/` scope의 불필요한 서비스 워커가 없는지 확인
- 두 앱의 이름과 아이콘이 서로 다른지 확인
- 한 앱을 제거해도 다른 앱이 유지되는지 확인
- 기존 로그인·학생·교사·지도 데이터가 유지되는지 확인
