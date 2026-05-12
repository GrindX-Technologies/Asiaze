import 'dart:convert';
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

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
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
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Login failed');
    }
  }

  static Future<Map<String, dynamic>> googleLogin(String name, String email, String avatar, String googleId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
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

  static Future<List<dynamic>> getNews({String? state, String? category}) async {
    final token = await getToken();
    
    List<String> queryParams = [];
    if (state != null && state.isNotEmpty) {
      queryParams.add('state=${Uri.encodeComponent(state)}');
    }
    if (category != null && category.isNotEmpty) {
      queryParams.add('category=${Uri.encodeComponent(category)}');
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
