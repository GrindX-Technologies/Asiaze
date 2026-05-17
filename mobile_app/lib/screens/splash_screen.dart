import 'package:flutter/material.dart';
import 'onboarding_screen.dart';
import 'home/home_screen.dart';
import '../services/api_service.dart';
import '../services/push_notification_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    // PRD says auto redirect after 2-3 seconds
    await Future.delayed(const Duration(seconds: 3));
    if (!mounted) return;
    
    final token = await ApiService.getToken();
    if (!mounted) return;

    if (token != null && token.isNotEmpty) {
      try {
        await ApiService.syncUserActivity();
        PushNotificationService.initialize();
      } catch (e) {
        debugPrint("Error syncing user activity on startup: \$e");
      }
      if (!mounted) return;
      
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const OnboardingScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFDC143C), // Crimson Red background
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/logo.png',
              width: 250, // Increased size to match the horizontal logo proportions
              fit: BoxFit.contain,
            ),
          ],
        ),
      ),
    );
  }
}
