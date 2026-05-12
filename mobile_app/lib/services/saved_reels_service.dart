import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class SavedReelsService {
  static const String _key = 'saved_reels';

  static Future<List<Map<String, dynamic>>> getSavedReels() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_key);
    if (data == null) return [];
    
    final List<dynamic> decoded = jsonDecode(data);
    return decoded.cast<Map<String, dynamic>>();
  }

  static Future<void> saveReel(Map<String, dynamic> reel) async {
    final prefs = await SharedPreferences.getInstance();
    final reels = await getSavedReels();
    
    if (reels.any((r) => r['id'] == reel['id'])) return;
    
    reels.insert(0, reel);
    await prefs.setString(_key, jsonEncode(reels));
  }

  static Future<void> removeReel(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final reels = await getSavedReels();
    
    reels.removeWhere((r) => r['id'] == id);
    await prefs.setString(_key, jsonEncode(reels));
  }

  static Future<bool> isSaved(String id) async {
    final reels = await getSavedReels();
    return reels.any((r) => r['id'] == id);
  }
}
