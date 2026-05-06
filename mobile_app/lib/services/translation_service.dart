import 'package:translator/translator.dart';

class TranslationService {
  static final _translator = GoogleTranslator();

  /// Translates [text] into the language matching [langCode] ('EN', 'HIN', 'BEN').
  static Future<String> translateText(String text, String langCode) async {
    if (langCode == 'EN' || text.isEmpty) return text;
    
    String toLang = 'en';
    if (langCode == 'HIN') {
      toLang = 'hi';
    } else if (langCode == 'BEN') {
      toLang = 'bn';
    }

    try {
      var translation = await _translator.translate(text, to: toLang);
      return translation.text;
    } catch (e) {
      // Fallback to original text on failure
      return text;
    }
  }

  /// Helper to translate a list of strings
  static Future<List<String>> translateList(List<String> items, String langCode) async {
    if (langCode == 'EN' || items.isEmpty) return items;
    
    List<String> translated = [];
    for (String item in items) {
      String t = await translateText(item, langCode);
      translated.add(t);
    }
    return translated;
  }
}
