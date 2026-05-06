import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../widgets/regular_news_card.dart';
import '../home/article_detail_screen.dart';

import '../notifications/notifications_screen.dart';
import '../../services/api_service.dart';
import '../../services/translation_service.dart';

class SearchExploreScreen extends StatefulWidget {
  const SearchExploreScreen({super.key});

  @override
  State<SearchExploreScreen> createState() => _SearchExploreScreenState();
}

class _SearchExploreScreenState extends State<SearchExploreScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _activeTab = 'My State';
  bool _isSearching = false;
  bool _isLoading = true;
  String _langCode = 'EN';

  final List<String> _tabs = [
    'My State',
    'Sports',
    'Business',
    'Technology',
    'Politics',
  ];

  List<dynamic> _exploreData = [];

  String _tNoResults = 'No results found';
  String _tSearchNews = 'Search news...';

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _langCode = prefs.getString('selectedLanguage') ?? 'EN';
    });

    if (_langCode != 'EN') {
      _tNoResults = await TranslationService.translateText('No results found', _langCode);
      _tSearchNews = await TranslationService.translateText('Search news...', _langCode);
      
      List<String> translatedTabs = [];
      for (String tab in _tabs) {
        translatedTabs.add(await TranslationService.translateText(tab, _langCode));
      }
      _tabs.clear();
      _tabs.addAll(translatedTabs);
      _activeTab = _tabs[0];
    }
    
    await _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final data = await ApiService.getNews();
      
      List<dynamic> mappedData = [];
      for (var item in data) {
        String title = item['title'] ?? 'No Title';
        String excerpt = item['summary'] ?? item['content'] ?? 'No Description';
        String content = item['content'] ?? '';
        
        if (_langCode != 'EN') {
          title = await TranslationService.translateText(title, _langCode);
          excerpt = await TranslationService.translateText(excerpt, _langCode);
          content = await TranslationService.translateText(content, _langCode);
        }
        
        mappedData.add({
          'id': item['_id']?.toString() ?? '',
          'title': title,
          'excerpt': excerpt,
          'meta': '${_formatDate(item['createdAt'])} | ${item['source'] ?? 'ASIAZE'}',
          'coverImage': item['coverImage'],
          'content': content,
        });
      }
      
      if (!mounted) return;
      setState(() {
        _exploreData = mappedData;
      });
    } catch (e) {
      debugPrint('Failed to load explore data: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'Recently';
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inDays > 0) return '${diff.inDays} days ago';
      if (diff.inHours > 0) return '${diff.inHours} hours ago';
      if (diff.inMinutes > 0) return '${diff.inMinutes} minutes ago';
      return 'Just now';
    } catch (e) {
      return 'Recently';
    }
  }

  @override
  Widget build(BuildContext context) {
    // If user is searching, we switch to search results view
    if (_isSearching) {
      return _buildSearchResultsView();
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false, // We'll rely on bottom nav for general nav
        title: _buildSearchBar(),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(40),
          child: Column(
            children: [
              const Divider(height: 1, color: Color(0xFFE2E8F0)),
              SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _tabs.length,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemBuilder: (context, index) {
                    final tab = _tabs[index];
                    final isActive = tab == _activeTab;
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _activeTab = tab;
                        });
                        _fetchData();
                      },
                      child: Container(
                        padding: const EdgeInsets.only(right: 20),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              tab,
                              style: GoogleFonts.lexendDeca(
                                fontSize: 14,
                                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                                color: isActive ? const Color(0xFFDC143C) : Colors.black,
                              ),
                            ),
                            if (isActive)
                              Container(
                                margin: const EdgeInsets.only(top: 4),
                                height: 2,
                                width: 20,
                                color: const Color(0xFFDC143C),
                              )
                            else
                              const SizedBox(height: 6),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFDC143C)))
          : _exploreData.isEmpty 
              ? SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: SizedBox(
                    height: MediaQuery.of(context).size.height * 0.7,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.feed_outlined, size: 64, color: Colors.grey.shade400),
                          const SizedBox(height: 16),
                          Text(
                            _tNoResults,
                            style: GoogleFonts.roboto(
                              fontSize: 16,
                              color: const Color(0xFF979797),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              : RefreshIndicator(
                  color: const Color(0xFFDC143C),
                  backgroundColor: Colors.white,
                  onRefresh: _fetchData,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 8, bottom: 24),
                    itemCount: _exploreData.length,
                    itemBuilder: (context, index) {
                      return RegularNewsCard(
                        article: _exploreData[index],
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ArticleDetailScreen(article: _exploreData[index]),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildSearchResultsView() {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {
            setState(() {
              _isSearching = false;
              _searchController.clear();
            });
          },
        ),
        title: _buildSearchBar(),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Color(0xFFDC143C)),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const NotificationsScreen()),
              );
            },
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: Color(0xFFE2E8F0)),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Placeholder for empty state illustration
            Container(
              width: 150,
              height: 150,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFFFF0F2),
              ),
              child: const Icon(Icons.search_off, size: 80, color: Color(0xFFDC143C)),
            ),
            const SizedBox(height: 24),
            Text(
              _tNoResults,
              style: GoogleFonts.roboto(
                fontSize: 16,
                color: const Color(0xFF979797),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: _isSearching ? "User's search query" : _tSearchNews,
          hintStyle: GoogleFonts.lexendDeca(
            color: const Color(0xFF94A3B8),
            fontSize: 13,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        ),
        onSubmitted: (value) {
          if (value.trim().isNotEmpty) {
            setState(() {
              _isSearching = true;
            });
          }
        },
      ),
    );
  }
}
