import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../main.dart';
import '../screens/home/article_detail_screen.dart';
import '../screens/home/home_screen.dart';
import 'api_service.dart';

class PushNotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // Check if user disabled notifications in settings
    final prefs = await SharedPreferences.getInstance();
    final notificationsEnabled = prefs.getBool('notificationsEnabled') ?? true;
    
    if (!notificationsEnabled) {
      debugPrint('Push notifications are disabled in settings, skipping initialization');
      return;
    }

    // Request permission
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted permission');
      
      // Get FCM token
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        debugPrint('FCM Token: $token');
        await ApiService.updateDeviceToken(token);
      }

      // Listen for token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) async {
        await ApiService.updateDeviceToken(newToken);
      });

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message whilst in the foreground!');
        debugPrint('Message data: ${message.data}');

        if (message.notification != null) {
          debugPrint('Message also contained a notification: ${message.notification}');
          // Could show a local notification or snackbar here if desired
        }
      });

      // Handle background/terminated message opens
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        _handleMessageClick(message);
      });

      // Handle if app was opened from terminated state
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        // Need a slight delay for context to be ready if called from main/splash
        Future.delayed(const Duration(milliseconds: 500), () {
          _handleMessageClick(initialMessage);
        });
      }
    } else {
      debugPrint('User declined or has not accepted permission');
    }
  }

  static Future<bool> toggleNotifications(bool enable) async {
    try {
      if (enable) {
        NotificationSettings settings = await _firebaseMessaging.requestPermission(
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
        );

        if (settings.authorizationStatus == AuthorizationStatus.authorized) {
          String? token = await _firebaseMessaging.getToken();
          if (token != null) {
            await ApiService.updateDeviceToken(token);
          }
          return true;
        }
        return false;
      } else {
        await _firebaseMessaging.deleteToken();
        await ApiService.updateDeviceToken(''); // Clear token in backend
        return true; // successfully disabled
      }
    } catch (e) {
      debugPrint('Error toggling notifications: $e');
      return false;
    }
  }

  static void _handleMessageClick(RemoteMessage message) async {
    debugPrint("Notification clicked with data: ${message.data}");
    
    // Log conversion metric locally
    debugPrint("Push notification opened. Message ID: ${message.messageId}");
    
    if (message.data.containsKey('actionLink')) {
      final actionLink = message.data['actionLink'] as String;
      if (actionLink.isNotEmpty) {
        if (actionLink.startsWith('/news/')) {
          // Internal deep link to an article
          final newsId = actionLink.replaceFirst('/news/', '');
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
            debugPrint('Failed to load article from push notification: $e');
            _navigateToHome();
          }
        } else {
          // External link
          String finalUrl = actionLink;
          if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://$finalUrl';
          }
          final uri = Uri.parse(finalUrl);
          try {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } catch (e) {
            debugPrint('Could not launch $actionLink: $e');
          }
        }
        return; // Exit early if actionLink was processed
      }
    }
    
    // Default action: Go to home screen if no actionLink or empty actionLink
    _navigateToHome();
  }

  static void _navigateToHome() {
    final context = navigatorKey.currentContext;
    if (context != null && context.mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const HomeScreen()),
        (route) => false,
      );
    }
  }
}
