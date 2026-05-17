import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../auth/login_screen.dart';
import '../home/home_screen.dart';
import '../setup/preferences_screen.dart';
import 'privacy_policy_screen.dart';
import 'terms_screen.dart';
import 'about_us_screen.dart';
import '../../services/api_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../services/push_notification_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _selectedLang = 'EN';
  bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Check actual system permission
    final settings = await FirebaseMessaging.instance.getNotificationSettings();
    final hasSystemPermission = settings.authorizationStatus == AuthorizationStatus.authorized;
    
    // Default to true, but if system permission is explicitly denied, force it to false
    bool savedEnabled = prefs.getBool('notificationsEnabled') ?? true;
    if (!hasSystemPermission && settings.authorizationStatus == AuthorizationStatus.denied && savedEnabled) {
      savedEnabled = false;
      await prefs.setBool('notificationsEnabled', false);
    }
    
    if (mounted) {
      setState(() {
        _selectedLang = prefs.getString('selectedLanguage') ?? 'EN';
        _notificationsEnabled = savedEnabled;
      });
    }
  }

  Future<void> _toggleNotifications(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _notificationsEnabled = value;
    });

    final success = await PushNotificationService.toggleNotifications(value);
    
    if (value && !success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notification permission denied. Please enable in device settings.')),
        );
      }
      setState(() {
        _notificationsEnabled = false;
      });
      await prefs.setBool('notificationsEnabled', false);
    } else {
      await prefs.setBool('notificationsEnabled', value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Settings',
          style: GoogleFonts.lexendDeca(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: Color(0xFFE2E8F0)),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 8),
            // Language
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  const Icon(Icons.translate, color: Colors.black),
                  const SizedBox(width: 16),
                  Text(
                    'Language',
                    style: GoogleFonts.roboto(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.black,
                    ),
                  ),
                  const Spacer(),
                  _buildLangChip('EN'),
                  const SizedBox(width: 8),
                  _buildLangChip('HIN'),
                  const SizedBox(width: 8),
                  _buildLangChip('BEN'),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            
            // Category Preferences
            _buildSettingItem(
              icon: Icons.format_list_bulleted,
              title: 'Category Preferences',
              trailing: const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF)),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const PreferencesScreen(isFromSettings: true),
                  ),
                );
              },
            ),
            
            // Notifications
            _buildSettingItem(
              icon: Icons.notifications,
              title: 'Notifications',
              trailing: Switch(
                value: _notificationsEnabled,
                activeThumbColor: const Color(0xFFDC143C),
                onChanged: (val) {
                  _toggleNotifications(val);
                },
              ),
              onTap: () {
                _toggleNotifications(!_notificationsEnabled);
              },
            ),
            
            // Privacy Policy
            _buildSettingItem(
              icon: Icons.description,
              title: 'Privacy Policy',
              trailing: const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF)),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const PrivacyPolicyScreen()),
                );
              },
            ),
            
            // Terms & Conditions
            _buildSettingItem(
              icon: Icons.description,
              title: 'Terms & Conditions',
              trailing: const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF)),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const TermsScreen()),
                );
              },
            ),
            
            // About Us
            _buildSettingItem(
              icon: Icons.info_outline,
              title: 'About Us',
              trailing: const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF)),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AboutUsScreen()),
                );
              },
            ),
            
            const SizedBox(height: 40),
            // Logout Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    await ApiService.logout();
                    if (!context.mounted) return;
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC143C),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Logout',
                    style: GoogleFonts.lexendDeca(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildLangChip(String lang) {
    final isSelected = _selectedLang == lang;
    return GestureDetector(
      onTap: () async {
        setState(() {
          _selectedLang = lang;
        });
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('selectedLanguage', lang);
        
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Language updated! Returning to Home to apply changes.')),
        );
        
        // Navigate back to home to refresh app state with new language
        Future.delayed(const Duration(seconds: 1), () {
          if (!mounted) return;
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
            (route) => false,
          );
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFDC143C) : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          lang,
          style: GoogleFonts.roboto(
            color: isSelected ? Colors.white : Colors.black,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    required Widget trailing,
    required VoidCallback onTap,
  }) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                Icon(icon, color: Colors.black),
                const SizedBox(width: 16),
                Text(
                  title,
                  style: GoogleFonts.roboto(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                  ),
                ),
                const Spacer(),
                trailing,
              ],
            ),
          ),
        ),
        const Divider(height: 1, color: Color(0xFFE2E8F0)),
      ],
    );
  }
}
