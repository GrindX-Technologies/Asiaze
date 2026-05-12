import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class SavedArticlesService {
  static const String _key = 'saved_articles';

  static Future<List<Map<String, dynamic>>> getSavedArticles() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_key);
    if (data == null) return [];
    
    final List<dynamic> decoded = jsonDecode(data);
    return decoded.cast<Map<String, dynamic>>();
  }

  static Future<void> saveArticle(Map<String, dynamic> article) async {
    final prefs = await SharedPreferences.getInstance();
    final articles = await getSavedArticles();
    
    // Check if already saved
    if (articles.any((a) => a['id'] == article['id'])) return;
    
    articles.insert(0, article); // Add to top
    await prefs.setString(_key, jsonEncode(articles));
    
    // Sync to backend
    try {
      await ApiService.toggleSaveNews(article['id'] ?? article['_id'] ?? '');
    } catch (e) {
      debugPrint("Failed to sync save article to backend: $e");
    }
  }

  static Future<void> removeArticle(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final articles = await getSavedArticles();
    
    articles.removeWhere((a) => a['id'] == id);
    await prefs.setString(_key, jsonEncode(articles));
    
    // Sync to backend
    try {
      await ApiService.toggleSaveNews(id);
    } catch (e) {
      debugPrint("Failed to sync remove article to backend: $e");
    }
  }

  static Future<bool> isSaved(String id) async {
    final articles = await getSavedArticles();
    return articles.any((a) => a['id'] == id);
  }
}
