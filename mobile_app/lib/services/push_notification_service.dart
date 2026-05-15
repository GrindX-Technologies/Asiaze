import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'api_service.dart';

class PushNotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // Request permission for iOS
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

  static void _handleMessageClick(RemoteMessage message) async {
    debugPrint("Notification clicked with data: ${message.data}");
    
    // For now, if clicked, check if there's an actionLink
    if (message.data.containsKey('actionLink')) {
      final actionLink = message.data['actionLink'] as String;
      if (actionLink.isNotEmpty) {
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
    }
  }
}
