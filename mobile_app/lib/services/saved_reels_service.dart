import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

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
    
    // Sync to backend
    try {
      if (reel['isAd'] == true) {
        await ApiService.toggleSaveAd(reel['id'] ?? reel['_id'] ?? '');
      } else {
        await ApiService.toggleSaveReel(reel['id'] ?? reel['_id'] ?? '');
      }
    } catch (e) {
      debugPrint("Failed to sync save reel to backend: $e");
    }
  }

  static Future<void> removeReel(String id, {bool isAd = false}) async {
    final prefs = await SharedPreferences.getInstance();
    final reels = await getSavedReels();
    
    reels.removeWhere((r) => r['id'] == id);
    await prefs.setString(_key, jsonEncode(reels));
    
    // Sync to backend
    try {
      if (isAd) {
        await ApiService.toggleSaveAd(id);
      } else {
        await ApiService.toggleSaveReel(id);
      }
    } catch (e) {
      debugPrint("Failed to sync remove reel to backend: $e");
    }
  }

  static Future<bool> isSaved(String id) async {
    final reels = await getSavedReels();
    return reels.any((r) => r['id'] == id);
  }
}
