# Выпуск Windows и macOS

## Автоматический способ

1. Создайте пустой репозиторий GitHub.
2. Распакуйте `Expert-Drilling-AI-Desktop-Source.zip` в корень репозитория.
3. Загрузите файлы в ветку `main`.
4. Откройте **Actions → Desktop installers → Run workflow**.
5. После завершения скачайте артефакты: Windows NSIS `.exe`, Windows Portable `.zip`, macOS Apple Silicon `.dmg`, macOS Intel `.dmg` и браузерный Offline ZIP.

Контрольные сборки создаются без коммерческой подписи. Для производственного распространения необходимо добавить сертификат Windows code signing и Apple Developer ID, затем включить нотариализацию macOS.

Перед каждой нативной сборкой автоматически выполняются проверка 24 формул, сборка автономного интерфейса и контроль SHA-256 файлов пакета.
