import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/translation_service.dart';

import '../home/home_screen.dart';

class PreferencesScreen extends StatefulWidget {
  const PreferencesScreen({super.key});

  @override
  State<PreferencesScreen> createState() => _PreferencesScreenState();
}

class _PreferencesScreenState extends State<PreferencesScreen> {
  String _selectedLanguage = 'HIN'; // Default to match design
  final Set<String> _selectedCategories = {'Politics', 'Entertainment'};

  final List<String> _baseCategories = [
    'Politics', 'Sports', 'Business', 'Tech', 
    'Lifestyle', 'Finance', 'Health', 'Entertainment'
  ];

  // Translated values
  String _titleText = 'Choose Your Language';
  String _subtitleText = 'Select Your Interests';
  String _buttonText = 'Continue';
  List<String> _displayCategories = [];
  bool _isTranslating = false;

  @override
  void initState() {
    super.initState();
    _displayCategories = List.from(_baseCategories);
    _applyTranslation(_selectedLanguage);
  }

  Future<void> _applyTranslation(String langCode) async {
    setState(() {
      _isTranslating = true;
    });

    try {
      final tTitle = await TranslationService.translateText('Choose Your Language', langCode);
      final tSubtitle = await TranslationService.translateText('Select Your Interests', langCode);
      final tButton = await TranslationService.translateText('Continue', langCode);
      final tCategories = await TranslationService.translateList(_baseCategories, langCode);

      if (mounted) {
        setState(() {
          _titleText = tTitle;
          _subtitleText = tSubtitle;
          _buttonText = tButton;
          _displayCategories = tCategories;
          _isTranslating = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isTranslating = false;
        });
      }
    }
  }

  void _handleLanguageChange(String lang) {
    if (_selectedLanguage == lang) return;
    setState(() {
      _selectedLanguage = lang;
    });
    _applyTranslation(lang);
  }

  Future<void> _handleContinue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selectedLanguage', _selectedLanguage);
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomeScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false, // No back button
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                _titleText,
                style: GoogleFonts.lexendDeca(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 24),
              // Language Chips
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildLanguageChip('EN'),
                  const SizedBox(width: 16),
                  _buildLanguageChip('HIN'),
                  const SizedBox(width: 16),
                  _buildLanguageChip('BEN'),
                ],
              ),
              const SizedBox(height: 40),
              Text(
                _subtitleText,
                style: GoogleFonts.roboto(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 24),
              // Categories Grid
              _isTranslating 
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: CircularProgressIndicator(color: Color(0xFFDC143C)),
                  )
                : GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 2.5,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: _displayCategories.length,
                    itemBuilder: (context, index) {
                      final baseCategory = _baseCategories[index];
                      final displayCategory = _displayCategories[index];
                      final isSelected = _selectedCategories.contains(baseCategory);
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        if (isSelected) {
                          _selectedCategories.remove(baseCategory);
                        } else {
                          _selectedCategories.add(baseCategory);
                        }
                      });
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFFDC143C) : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? const Color(0xFFDC143C) : const Color(0xFFE2E8F0),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(12),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (isSelected) ...[
                            const Icon(Icons.radio_button_checked, color: Colors.white, size: 16),
                            const SizedBox(width: 8),
                          ],
                          Flexible(
                            child: Text(
                              displayCategory,
                              style: GoogleFonts.roboto(
                                color: isSelected ? Colors.white : Colors.black,
                                fontSize: 16,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 48),
              // Continue Button
              SizedBox(
                width: 250,
                child: ElevatedButton(
                  onPressed: _handleContinue,
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
                    _buttonText,
                    style: GoogleFonts.roboto(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageChip(String lang) {
    final isSelected = _selectedLanguage == lang;
    return GestureDetector(
      onTap: () {
        _handleLanguageChange(lang);
      },
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isSelected ? const Color(0xFFDC143C) : Colors.white,
          border: Border.all(
            color: isSelected ? const Color(0xFFDC143C) : Colors.black,
            width: 1.5,
          ),
        ),
        child: Center(
          child: Text(
            lang,
            style: GoogleFonts.roboto(
              color: isSelected ? Colors.white : Colors.black,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}
