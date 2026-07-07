import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

import 'app.dart';
import 'data/db/app_database.dart';
import 'data/settings/settings_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (Platform.isWindows) {
    await windowManager.ensureInitialized();
    const options = WindowOptions(
      size: Size(1440, 900),
      minimumSize: Size(980, 620),
      center: true,
      title: 'Folio',
      titleBarStyle: TitleBarStyle.hidden,
    );
    unawaited(windowManager.waitUntilReadyToShow(options, () async {
      await windowManager.show();
      await windowManager.focus();
    }));
  }

  final db = await AppDatabase.open();
  final settings = await SettingsController.load();

  runApp(FolioApp(db: db, settings: settings));
}
