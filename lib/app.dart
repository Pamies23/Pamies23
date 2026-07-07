import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme/app_theme.dart';
import 'data/db/app_database.dart';
import 'data/repositories/chat_repository.dart';
import 'data/repositories/document_repository.dart';
import 'data/repositories/folder_repository.dart';
import 'data/repositories/highlight_repository.dart';
import 'data/settings/settings_controller.dart';
import 'state/library_controller.dart';
import 'ui/screens/library_screen.dart';
import 'ui/widgets/window_title_bar.dart';

class FolioApp extends StatelessWidget {
  const FolioApp({super.key, required this.db, required this.settings});

  final AppDatabase db;
  final SettingsController settings;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AppDatabase>.value(value: db),
        Provider<DocumentRepository>(
          create: (_) => DocumentRepository(db),
        ),
        Provider<ChatRepository>(
          create: (_) => ChatRepository(db),
        ),
        Provider<HighlightRepository>(
          create: (_) => HighlightRepository(db),
        ),
        Provider<FolderRepository>(
          create: (_) => FolderRepository(db),
        ),
        ChangeNotifierProvider<SettingsController>.value(value: settings),
        ChangeNotifierProvider<LibraryController>(
          create: (context) => LibraryController(
            context.read<DocumentRepository>(),
            context.read<FolderRepository>(),
          ),
        ),
      ],
      child: Consumer<SettingsController>(
        builder: (context, settings, _) {
          return MaterialApp(
            title: 'Folio',
            debugShowCheckedModeBanner: false,
            theme: buildTheme(Brightness.light),
            darkTheme: buildTheme(Brightness.dark),
            themeMode: settings.themeMode,
            home: const LibraryScreen(),
            builder: (context, child) {
              if (!WindowTitleBar.isSupported) return child!;
              // Barra de título propia en Windows, sobre todas las rutas.
              return Column(
                children: [
                  const WindowTitleBar(),
                  Expanded(child: child!),
                ],
              );
            },
          );
        },
      ),
    );
  }
}
