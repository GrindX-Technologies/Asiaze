import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mime/mime.dart';

class ApiService {
  static const String baseUrl = 'https://asiaze.cloud/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<String> getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    String? deviceId = prefs.getString('deviceId');
    if (deviceId == null) {
      deviceId = '${DateTime.now().millisecondsSinceEpoch}_${1000 + (DateTime.now().microsecond % 9000)}';
      await prefs.setString('deviceId', deviceId);
    }
    return deviceId;
  }

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    try {
      await updateDeviceToken(''); // Clear FCM token on backend before removing auth token
    } catch (e) {
      debugPrint('Failed to clear device token on logout: $e');
    }
    await prefs.remove('token');
    await prefs.remove('userState');
    await prefs.remove('selectedCategories');
    await prefs.remove('likedArticles');
    await prefs.remove('likedReels');
    await prefs.remove('saved_articles');
    await prefs.remove('saved_reels');
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await setToken(data['token']);
      final prefs = await SharedPreferences.getInstance();
      if (data['state'] != null) {
        await prefs.setString('userState', data['state']);
      }
      if (data['preferredCategories'] != null) {
        await prefs.setStringList('selectedCategories', List<String>.from(data['preferredCategories']));
      }
      
      // Sync user activity (saved/liked items)
      await syncUserActivity();
      
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Login failed');
    }
  }

  static Future<Map<String, dynamic>> googleLogin(String idToken, String name, String email, String avatar, String googleId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'idToken': idToken,
        'name': name,
        'email': email,
        'avatar': avatar,
        'googleId': googleId
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await setToken(data['token']);
      final prefs = await SharedPreferences.getInstance();
      if (data['state'] != null) {
        await prefs.setString('userState', data['state']);
      }
      if (data['preferredCategories'] != null) {
        await prefs.setStringList('selectedCategories', List<String>.from(data['preferredCategories']));
      }
      
      // Sync user activity (saved/liked items)
      await syncUserActivity();
      
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Google Login failed');
    }
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password, String state, {String? referralCode}) async {
    final body = {'name': name, 'email': email, 'password': password, 'state': state};
    if (referralCode != null && referralCode.isNotEmpty) {
      body['referredByCode'] = referralCode;
    }

    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await setToken(data['token']);
      
      // Save state to local preferences for Local News tab
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('userState', state);
      
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Registration failed');
    }
  }

  static Future<void> syncUserActivity() async {
    try {
      final profile = await getProfile();
      final prefs = await SharedPreferences.getInstance();

      // Sync liked articles
      if (profile['likedNews'] != null) {
        List<String> likedNews = (profile['likedNews'] as List).map((e) => e.toString()).toList();
        await prefs.setStringList('likedArticles', likedNews);
      }

      // Sync liked reels
      if (profile['likedReels'] != null) {
        List<String> likedReels = (profile['likedReels'] as List).map((e) => e.toString()).toList();
        await prefs.setStringList('likedReels', likedReels);
      }

      // Sync saved articles
      if (profile['savedNews'] != null) {
        List<Map<String, dynamic>> savedArticles = (profile['savedNews'] as List).map((item) {
          return {
            'id': item['_id']?.toString() ?? '',
            'title': item['title'] ?? 'No Title',
            'excerpt': item['summary'] ?? item['content'] ?? 'No Description',
            'meta': '${item['createdAt'] != null ? DateTime.parse(item['createdAt']).toLocal().toString().split(' ')[0] : ''} | ${item['source'] ?? 'ASIAZE'}',
            'coverImage': item['coverImage'],
            'content': item['content'] ?? '',
          };
        }).toList();
        await prefs.setString('saved_articles', jsonEncode(savedArticles));
      }

      // Sync saved reels
      if (profile['savedReels'] != null) {
        List<Map<String, dynamic>> savedReels = (profile['savedReels'] as List).map((item) {
          return {
            'id': item['_id']?.toString() ?? '',
            'videoUrl': item['videoUrl'],
            'thumbnailUrl': item['thumbnailUrl'],
            'title': item['title'],
            'description': item['description'],
            'likes': item['likes'] ?? 0,
            'comments': item['comments'] ?? 0,
            'shares': item['shares'] ?? 0,
          };
        }).toList();
        await prefs.setString('saved_reels', jsonEncode(savedReels));
      }
    } catch (e) {
      debugPrint("Failed to sync user activity: $e");
    }
  }
  static Future<Map<String, dynamic>> getProfile() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load profile');
    }
  }

  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/auth/profile'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update profile');
    }
  }

  static Future<void> updateDeviceToken(String fcmToken) async {
    final token = await getToken();
    if (token == null) return;
    
    final response = await http.put(
      Uri.parse('$baseUrl/users/fcm-token'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      },
      body: jsonEncode({'token': fcmToken}),
    );
    
    if (response.statusCode != 200) {
      debugPrint('Failed to update device token: ${response.body}');
    }
  }

  static Future<String> uploadAvatar(List<int> imageBytes, String filename) async {
    final token = await getToken();
    var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/upload'));
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    final mimeTypeData = lookupMimeType(filename, headerBytes: imageBytes)?.split('/');
    final contentType = mimeTypeData != null && mimeTypeData.length == 2 
      ? MediaType(mimeTypeData[0], mimeTypeData[1])
      : MediaType('image', 'jpeg');

    request.files.add(
      http.MultipartFile.fromBytes(
        'file',
        imageBytes,
        filename: filename,
        contentType: contentType,
      ),
    );

    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return baseUrl.replaceAll('/api', '') + data['url']; // Construct full URL
    } else {
      throw Exception('Failed to upload image: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getRewards() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/users/rewards'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load rewards');
    }
  }

  static Future<Map<String, dynamic>> redeemCoupon(String couponId) async {
    final token = await getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/coupons/$couponId/redeem'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final body = jsonDecode(response.body);
      throw Exception(body['message'] ?? 'Failed to redeem coupon');
    }
  }

  static Future<List<dynamic>> getActiveCoupons() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/coupons/active'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load coupons');
    }
  }

  static Future<List<dynamic>> getCategories() async {
    final response = await http.get(
      Uri.parse('$baseUrl/categories?status=active'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load categories');
    }
  }

  static Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('language') ?? 'EN';
  }

  static Future<void> setLanguage(String lang) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', lang);
  }

  static Future<List<dynamic>> getSettings() async {
    final response = await http.get(Uri.parse('$baseUrl/settings'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load settings');
    }
  }

  static Future<List<dynamic>> getAds({String? type, bool? isActive}) async {
    List<String> queryParams = [];
    if (type != null) queryParams.add('type=$type');
    if (isActive != null) queryParams.add('isActive=$isActive');
    
    final queryStr = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';
    final response = await http.get(Uri.parse('$baseUrl/ads$queryStr'));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load ads');
    }
  }

  static Future<List<dynamic>> getNews({String? state, String? category, bool? isBreaking}) async {
    final token = await getToken();
    
    List<String> queryParams = ['status=published'];
    if (state != null && state.isNotEmpty) {
      queryParams.add('state=${Uri.encodeComponent(state)}');
    }
    if (category != null && category.isNotEmpty) {
      queryParams.add('category=${Uri.encodeComponent(category)}');
    }
    if (isBreaking != null) {
      queryParams.add('isBreaking=$isBreaking');
    }

    String url = '$baseUrl/news';
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }
    
    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load news');
    }
  }

  static Future<Map<String, dynamic>> getNewsById(String newsId) async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/news/$newsId'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load article');
    }
  }

  static Future<Map<String, dynamic>> toggleLikeNews(String newsId, bool isLiked) async {
    final token = await getToken();
    final action = isLiked ? 'like' : 'unlike';
    final response = await http.put(
      Uri.parse('$baseUrl/news/$newsId/like'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
      body: jsonEncode({'action': action}),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to toggle like');
    }
  }

  static Future<List<dynamic>> getBreakingNews() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/news?status=published&isBreaking=true'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load breaking news');
    }
  }

  static Future<List<dynamic>> getReels() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/reels'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load reels');
    }
  }

  static Future<Map<String, dynamic>> recordReelView(String reelId, String deviceId) async {
    final token = await getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/reels/$reelId/view'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
      body: jsonEncode({'deviceId': deviceId}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to record reel view');
    }
  }

  static Future<Map<String, dynamic>> toggleLikeAd(String adId, bool isLiked) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/ads/$adId/like'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to toggle like on ad');
    }
  }

  static Future<Map<String, dynamic>> toggleSaveAd(String adId) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/auth/save/ads/$adId'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to toggle save ad');
    }
  }

  static Future<Map<String, dynamic>> toggleLikeReel(String reelId, bool isLiked) async {
    final token = await getToken();
    final action = isLiked ? 'like' : 'unlike';
    final response = await http.put(
      Uri.parse('$baseUrl/reels/$reelId/like'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
      body: jsonEncode({'action': action}),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to toggle like');
    }
  }

  static Future<Map<String, dynamic>> toggleLikeStory(String storyId) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/stories/$storyId/like'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to toggle story like');
    }
  }

  static Future<Map<String, dynamic>> recordStoryView(String storyId, String deviceId) async {
    final token = await getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/stories/$storyId/view'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
      body: jsonEncode({'deviceId': deviceId}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to record story view');
    }
  }

  static Future<Map<String, dynamic>> toggleSaveNews(String newsId) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/auth/save/news/$newsId'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to toggle save news');
    }
  }

  static Future<Map<String, dynamic>> toggleSaveReel(String reelId) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/auth/save/reels/$reelId'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to toggle save reel');
    }
  }

  static Future<List<dynamic>> getStories() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/stories?status=published'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load stories');
    }
  }
}
