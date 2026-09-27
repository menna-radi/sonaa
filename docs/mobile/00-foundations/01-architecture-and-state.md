# 00 · Architecture & state management

## 1. Layering (per feature)

```
lib/layouts/<role>/<feature>/
  data/
    datasources/   <feature>_remote_data_source.dart   ← Dio calls only, returns models/raw maps
    models/        *_model.dart                        ← fromJson/toJson, tolerant parsing
    repositories/  *_repository_impl.dart              ← maps models → entities, wraps errors
  domain/
    entities/      plain immutable classes (Equatable)
    repositories/  abstract contracts
    usecases/      one action each (optional for thin features)
  presentation/
    cubit/         <feature>_cubit.dart + <feature>_state.dart
    screens/ widgets/
```

Rules:
1. **Widgets never call Dio.** Screen → Cubit → Repository/UseCase → DataSource.
2. **Parsing is tolerant, not inventive.** Accept known key aliases (`locationLat|lat|latitude`), default missing
   numbers to `0`/`null`, **never fabricate business data** (fake coordinates, fake ratings, fake "15 min").
3. **Entities are immutable** and compared by value (`Equatable`), so `BlocBuilder` only rebuilds on real change.
4. Shared cross-feature logic lives in `lib/core/` (`tasks/task_status.dart`, `chat/chat_wire.dart`,
   `notifications/notification_router.dart`, …) — never duplicate status/route mapping in a screen.

## 2. Cubit rules

| Rule | Why |
|---|---|
| One cubit owns one surface's state (list, detail, form). | Clear ownership, no double fetching. |
| App-wide surfaces (home, chat inbox, notifications, map) are **lazy singletons** in DI and provided with `BlocProvider.value(value: sl<X>())`. | Leaving/returning a tab must not close/recreate them ("Cannot emit after close"). |
| Screen-scoped flows (wizard, detail, sheets) use `BlocProvider(create: …)`. | Disposed with the screen. |
| State is a single immutable class with `copyWith` (+ `clearX` flags for nullable fields). | Predictable diffs; nulls can be set explicitly. |
| Every async method guards: `if (isClosed) return;` after each `await`. | No emits after dispose. |
| **Generation guard** for reloads: `final gen = ++_generation; … if (gen != _generation) return;` | A slow old response never overwrites a newer one. |
| **Session/account epoch guard**: store `_sessionEpoch` at start; drop results if it changed. | Logout/role switch must not let a previous account's data land. |
| Commands (accept, send, cancel) set an in-flight flag; ignore duplicate taps. | One POST per user intent. |
| Errors are stored as **translation keys** (`'errors.connection'`), not English strings. | UI translates. |

### State shape template

```dart
class XState extends Equatable {
  final List<Item> items;
  final bool isLoading;          // first load (shimmer)
  final bool isRefreshing;       // pull-to-refresh (keep content)
  final bool isLoadingMore;      // pagination footer
  final bool hasMore;
  final String? errorKey;        // translation key; null = no error
  // copyWith(... bool clearError = false)
}
```

Derived values (badges, counts, filtered lists) are **getters on state**, not stored fields
(e.g. `int get totalUnread => conversations.fold(0, (s, c) => s + c.unreadCount);`).

## 3. Dependency injection

- Register in `lib/core/di/dependency_injection.dart`.
- Data sources, repositories, services: `registerLazySingleton`.
- Cross-screen cubits: `registerLazySingleton`; screen cubits: `registerFactory`.
- Tests: `sl.registerSingleton<Contract>(Fake())` after `sl.unregister` (see `test/cubits/app_settings_cubit_test.dart`).

## 4. Account boundaries (logout, login, role switch)

On any boundary:
1. Bump `TaskEventBus` epoch and every cubit's `_sessionEpoch`.
2. `SocketService.resetForNewAccount()` then reconnect with the new token.
3. Clear per-account caches (chat cache keys, earnings cache, notification badge).
4. Singleton cubits reset to `initial()` and reload lazily when their tab is opened.

`lib/core/utils/post_auth_bootstrap.dart` is the single place that warms up singletons after login.

## 5. Checklist for a new feature

- [ ] Remote data source uses `ApiEndpoints` constants and passes the acting role when the endpoint is role-scoped.
- [ ] Model parsing covers every alias the backend returns and has a unit test with a real payload.
- [ ] Cubit has generation + epoch guards and an in-flight guard for commands.
- [ ] States: loading, content, empty, error (+ retry), refreshing, loading-more.
- [ ] No hardcoded user-facing strings; ar/en/he keys added.
- [ ] Caching decision documented (see caching guide).
- [ ] Realtime/refresh source documented (socket event, event bus, lifecycle).
