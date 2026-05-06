import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'onboarding_screen.dart';

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
    
    // Replace with onboarding screen
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const OnboardingScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFDC143C), // Crimson Red background
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'asiaze',
              style: GoogleFonts.lexendDeca(
                fontSize: 54,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                letterSpacing: -1.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Your World, Simplified',
              style: GoogleFonts.lexendDeca(
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: Colors.white,
                letterSpacing: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
