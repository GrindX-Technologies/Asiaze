import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../widgets/regular_news_card.dart';
import '../home/article_detail_screen.dart';
import '../../services/api_service.dart';
import '../../services/translation_service.dart';

class SearchExploreScreen extends StatefulWidget {
  const SearchExploreScreen({super.key});

  @override
  State<SearchExploreScreen> createState() => _SearchExploreScreenState();
}

class _SearchExploreScreenState extends State<SearchExploreScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
  String _activeTab = 'All News';
  bool _isLoading = true;
  String _langCode = 'EN';
  String? _userState;
  String _searchQuery = '';

  List<String> _tabs = ['All News', 'My State'];
  final Map<String, String> _categoryNameToId = {};
  Map<String, String> _translatedToEnglishTabs = {};

  List<dynamic> _allData = [];
  List<dynamic> _exploreData = [];

  String _tNoResults = 'No results found';
  String _tSearchNews = 'Search news...';

  @override
  void initState() {
    super.initState();
    _initData();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _initData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _langCode = prefs.getString('selectedLanguage') ?? 'EN';
      _userState = prefs.getString('userState');
    });

    try {
      final categories = await ApiService.getCategories();
      List<String> dynamicTabs = [];
      for (var cat in categories) {
        String name = cat['name'];
        _categoryNameToId[name] = cat['_id'];
        dynamicTabs.add(name);
      }
      _tabs = ['All News', 'My State', ...dynamicTabs];
    } catch (e) {
      debugPrint('Failed to load categories: $e');
    }

    Map<String, String> translatedToEnglish = {};
    for (String tab in _tabs) {
      translatedToEnglish[tab] = tab;
    }

    if (_langCode != 'EN') {
      _tNoResults = await TranslationService.translateText('No results found', _langCode);
      _tSearchNews = await TranslationService.translateText('Search news...', _langCode);
      
      List<String> translatedTabs = [];
      for (String tab in _tabs) {
        String translated = await TranslationService.translateText(tab, _langCode);
        translatedTabs.add(translated);
        translatedToEnglish[translated] = tab;
      }
      _tabs = translatedTabs;
      _activeTab = _tabs[0];
    } else {
      _activeTab = _tabs[0];
    }
    
    _translatedToEnglishTabs = translatedToEnglish;
    await _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
    });
    try {
      String apiQueryState = '';
      String apiQueryCategory = '';
      String englishTab = _translatedToEnglishTabs[_activeTab] ?? _activeTab;

      if (englishTab == 'My State' || englishTab == 'Local') {
        if (_userState != null) {
          apiQueryState = _userState!;
        }
      } else if (englishTab != 'All News') {
        if (_categoryNameToId.containsKey(englishTab)) {
          apiQueryCategory = _categoryNameToId[englishTab]!;
        }
      }

      final data = await ApiService.getNews(
        state: apiQueryState.isNotEmpty ? apiQueryState : null,
        category: apiQueryCategory.isNotEmpty ? apiQueryCategory : null,
      );
      
      List<dynamic> mappedData = [];
      for (var item in data) {
        if (item['status'] == 'draft') continue;

        String title = item['title'] ?? 'No Title';
        String excerpt = item['summary'] ?? item['content'] ?? 'No Description';
        String content = item['content'] ?? '';
        String categoryName = '';
        if (item['category'] != null && item['category'] is Map) {
          categoryName = item['category']['name'] ?? '';
        }
        
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
          'categoryName': categoryName,
        });
      }
      
      if (!mounted) return;
      setState(() {
        _allData = mappedData;
      });
      _filterData();
    } catch (e) {
      debugPrint('Failed to load explore data: $e');
      if (mounted) {
        setState(() {
          _allData = [];
          _exploreData = [];
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    
    // Show loading state while debouncing/searching as requested
    setState(() {
      _isLoading = true;
    });
    
    _debounce = Timer(const Duration(milliseconds: 300), () {
      setState(() {
        _searchQuery = query.trim().toLowerCase();
      });
      _filterData();
    });
  }

  void _filterData() {
    if (_searchQuery.isEmpty) {
      setState(() {
        _exploreData = List.from(_allData);
        _isLoading = false;
      });
      return;
    }

    final filtered = _allData.where((article) {
      final title = (article['title'] ?? '').toLowerCase();
      final excerpt = (article['excerpt'] ?? '').toLowerCase();
      final content = (article['content'] ?? '').toLowerCase();
      
      return title.contains(_searchQuery) || 
             excerpt.contains(_searchQuery) || 
             content.contains(_searchQuery);
    }).toList();

    setState(() {
      _exploreData = filtered;
      _isLoading = false;
    });
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
                          Container(
                            width: 120,
                            height: 120,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFFFFF0F2),
                            ),
                            child: const Icon(Icons.search_off, size: 60, color: Color(0xFFDC143C)),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            _searchQuery.isEmpty ? "No articles found" : "$_tNoResults \"$_searchQuery\"",
                            style: GoogleFonts.roboto(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF333333),
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 32),
                            child: Text(
                              _searchQuery.isEmpty 
                                  ? "Try switching to another category from the top menu or pull down to refresh."
                                  : "Try checking for typos, using different keywords, or switching to another category.",
                              style: GoogleFonts.roboto(
                                fontSize: 14,
                                color: const Color(0xFF979797),
                              ),
                              textAlign: TextAlign.center,
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
          hintText: _tSearchNews,
          prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
          suffixIcon: _searchController.text.isNotEmpty 
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Color(0xFF94A3B8), size: 20),
                  onPressed: () {
                    _searchController.clear();
                    _onSearchChanged('');
                  },
                )
              : null,
          hintStyle: GoogleFonts.lexendDeca(
            color: const Color(0xFF94A3B8),
            fontSize: 13,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 10),
        ),
        onChanged: _onSearchChanged,
      ),
    );
  }
}
