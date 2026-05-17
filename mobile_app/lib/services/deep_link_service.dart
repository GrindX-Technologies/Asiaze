import 'dart:async';
import 'package:flutter/material.dart';
import 'package:app_links/app_links.dart';
import '../main.dart';
import '../screens/home/article_detail_screen.dart';
import 'api_service.dart';

class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._internal();
  factory DeepLinkService() => _instance;
  DeepLinkService._internal();

  late AppLinks _appLinks;
  StreamSubscription<Uri>? _linkSubscription;

  Future<void> initialize() async {
    _appLinks = AppLinks();

    // Handle links when app is in cold state (terminated)
    try {
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        debugPrint('Cold start deep link: $initialUri');
        _handleDeepLink(initialUri);
      }
    } catch (e) {
      debugPrint('Failed to get initial deep link: $e');
    }

    // Handle links when app is in background or foreground
    _linkSubscription = _appLinks.uriLinkStream.listen((Uri? uri) {
      if (uri != null) {
        debugPrint('Stream deep link: $uri');
        _handleDeepLink(uri);
      }
    }, onError: (err) {
      debugPrint('Deep link stream error: $err');
    });
  }

  void _handleDeepLink(Uri uri) async {
    final path = uri.path;
    debugPrint('Handling deep link path: $path');

    if (path.startsWith('/article/')) {
      final newsId = path.split('/article/').last;
      if (newsId.isNotEmpty) {
        _navigateToNews(newsId);
      }
    } else if (path.startsWith('/stories/')) {
       _navigateToHome();
    } else if (path.startsWith('/reel/')) {
       _navigateToHome();
    }
  }

  void _navigateToNews(String newsId) async {
    try {
      final article = await ApiService.getNewsById(newsId);
      final context = navigatorKey.currentContext;
      if (context != null && context.mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ArticleDetailScreen(article: article),
          ),
        );
      }
    } catch (e) {
      debugPrint('Failed to fetch article for deep link: $e');
      _navigateToHome();
    }
  }

  void _navigateToHome() {
    final context = navigatorKey.currentContext;
    if (context != null && context.mounted) {
      Navigator.popUntil(context, (route) => route.isFirst);
    }
  }

  void dispose() {
    _linkSubscription?.cancel();
  }
}
