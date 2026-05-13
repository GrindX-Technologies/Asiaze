import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../widgets/news_card.dart';
import '../../widgets/breaking_news_ticker.dart';
import '../explore/search_explore_screen.dart';
import 'article_detail_screen.dart';
import 'reels_screen.dart';
import '../profile/profile_screen.dart';
import '../stories/stories_screen.dart';
import '../../services/api_service.dart';
import '../../services/translation_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentNavIndex = 1; // 1 = Home (based on PRD/Figma)
  bool _isLoading = true;
  bool _isRefreshing = false;

  late final AnimationController _spinController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat();

  List<String> _tabs = [
    'My Feed',
    'Stories',
    'Reels',
  ];
  List<String> _selectedCategories = ['Politics', 'Entertainment'];
  final Map<String, String> _categoryNameToId = {};

  String _activeTab = 'My Feed';

  List<dynamic> _feedData = [];
  String _langCode = 'EN';
  String? _userState;
  
  // Translated UI Strings
  String _tLoadNewFeed = 'Load New Feed';
  String _tNoArticles = 'No articles available right now';
  String _tAllCaughtUp = 'You\'re all caught up!';
  String _tCheckBackLater = 'Check back later for more news.';
  
  String _tLocal = 'Local';
  String _tStories = 'Stories';
  String _tReels = 'Reels';

  @override
  void initState() {
    super.initState();
    _initData();
  }

  @override
  void dispose() {
    _spinController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _initData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _langCode = prefs.getString('selectedLanguage') ?? 'EN';
      _userState = prefs.getString('userState');
      _selectedCategories = prefs.getStringList('selectedCategories') ?? ['Politics', 'Entertainment'];
    });

    // Fetch dynamic categories
    List<String> priorityCategories = [];
    List<String> otherCategories = [];
    try {
      final categories = await ApiService.getCategories();
      for (var cat in categories) {
        String name = cat['name'];
        _categoryNameToId[name] = cat['_id'];
        if (_selectedCategories.contains(name)) {
          priorityCategories.add(name);
        } else {
          otherCategories.add(name);
        }
      }
    } catch (e) {
      debugPrint('Failed to load categories: $e');
    }

    _tabs = [
      'My Feed',
      'Stories',
      'Reels',
      ...priorityCategories,
      ...otherCategories
    ];

    // Translate UI strings if needed
    Map<String, String> translatedToEnglish = {};
    if (_langCode != 'EN') {
      _tLoadNewFeed = await TranslationService.translateText('Load New Feed', _langCode);
      _tNoArticles = await TranslationService.translateText('No articles available right now', _langCode);
      _tAllCaughtUp = await TranslationService.translateText('You\'re all caught up!', _langCode);
      _tCheckBackLater = await TranslationService.translateText('Check back later for more news.', _langCode);
      _tLocal = await TranslationService.translateText('Local', _langCode);
      _tStories = await TranslationService.translateText('Stories', _langCode);
      _tReels = await TranslationService.translateText('Reels', _langCode);
      
      // Translate tabs
      List<String> translatedTabs = [];
      for (String tab in _tabs) {
        String tTab = await TranslationService.translateText(tab, _langCode);
        translatedTabs.add(tTab);
        translatedToEnglish[tTab] = tab;
      }
      _tabs.clear();
      _tabs.addAll(translatedTabs);
      _activeTab = _tabs[0];
    } else {
      for (String tab in _tabs) {
        translatedToEnglish[tab] = tab;
      }
    }
    
    if (_userState != null && _userState!.isNotEmpty && !_tabs.contains(_tLocal)) {
      _tabs.insert(0, _tLocal);
      translatedToEnglish[_tLocal] = 'Local';
      _activeTab = _tLocal;
    }
    
    // Save mapping for later use
    _translatedToEnglishTabs = translatedToEnglish;
    
    await _fetchFeed();
  }

  Map<String, String> _translatedToEnglishTabs = {};

  Future<void> _fetchFeed() async {
    setState(() {
      _isLoading = true;
    });
    try {
      String apiQueryState = '';
      String apiQueryCategory = '';
      String englishTab = _translatedToEnglishTabs[_activeTab] ?? _activeTab;

      if (_userState != null && englishTab == 'Local') {
        apiQueryState = _userState!;
      } else if (englishTab != 'My Feed' && englishTab != 'Stories' && englishTab != 'Reels') {
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
      
      if (englishTab == 'My Feed') {
        mappedData.sort((a, b) {
          bool aIsSelected = _selectedCategories.contains(a['categoryName']);
          bool bIsSelected = _selectedCategories.contains(b['categoryName']);
          if (aIsSelected && !bIsSelected) return -1;
          if (!aIsSelected && bIsSelected) return 1;
          return 0; // Keep original date sort if both match or both don't match
        });
      }
      
      if (!mounted) return;
      setState(() {
        _feedData = mappedData;
      });
    } catch (e) {
      debugPrint('Failed to load feed: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
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
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(
              'Exit App',
              style: GoogleFonts.lexendDeca(fontWeight: FontWeight.bold),
            ),
            content: Text(
              'Are you sure you want to close the app?',
              style: GoogleFonts.roboto(),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text('No', style: GoogleFonts.roboto(color: Colors.black)),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text('Yes', style: GoogleFonts.roboto(color: const Color(0xFFDC143C))),
              ),
            ],
          ),
        );
        if (shouldPop ?? false) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: _buildAppBar(),
        body: Column(
          children: [
            // Vertical Swipeable Feed
            Expanded(
              child: Stack(
                alignment: Alignment.topCenter,
                children: [
                  RefreshIndicator(
                    color: const Color(0xFFDC143C),
                    backgroundColor: Colors.white,
                    displacement: 64,
                    onRefresh: () async {
                      setState(() => _isRefreshing = true);
                      try {
                        // Actually fetch new data on swipe down
                        await _fetchFeed();
                        if (mounted) {
                          _pageController.animateToPage(
                            0,
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        }
                      } finally {
                        if (mounted) {
                          setState(() => _isRefreshing = false);
                        }
                      }
                    },
                    child: _buildFeed(),
                  ),
                  // "Load New Feed" Pill (Shows only during pull-to-refresh)
                  if (_isRefreshing && _feedData.isNotEmpty)
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Material(
                          color: Colors.transparent,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF333333),
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withAlpha(26),
                                  blurRadius: 6,
                                  offset: const Offset(0, 4),
                                )
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                RotationTransition(
                                  turns: _spinController,
                                  child: const Icon(Icons.refresh, color: Colors.white, size: 18),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  _tLoadNewFeed,
                                  style: GoogleFonts.roboto(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: _buildBottomNav(),
      ),
    );
  }

  Widget _buildFeed() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFDC143C)),
      );
    }

    if (_feedData.isEmpty) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.7, // Take up most of the screen
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.feed_outlined, size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 16),
                Text(
                  _tNoArticles,
                  style: GoogleFonts.lexendDeca(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return PageView.builder(
      controller: _pageController,
      scrollDirection: Axis.vertical,
      itemCount: _feedData.length + 1, // +1 for "end of feed"
      itemBuilder: (context, index) {
        if (index == _feedData.length) {
          // End of feed screen
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle_outline, size: 64, color: Colors.green.shade400),
                const SizedBox(height: 16),
                Text(
                  _tAllCaughtUp,
                  style: GoogleFonts.lexendDeca(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _tCheckBackLater,
                  style: GoogleFonts.lexendDeca(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          );
        }

        return Center(
          child: NewsCard(
            article: _feedData[index],
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ArticleDetailScreen(
                    article: _feedData[index],
                    feedList: _feedData,
                    initialIndex: index,
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      title: SizedBox(
        height: 36, // Fixed height to constrain the image appropriately
        child: Image.asset(
          'assets/images/asiaze_logo_header.png',
          fit: BoxFit.contain,
        ),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(76), // 40 for tabs + 36 for ticker
        child: Column(
          children: [
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
                      _fetchFeed(); // Add this to reload feed based on tab
                      
                      if (tab == _tReels) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ReelsScreen()),
                        ).then((_) {
                          setState(() {
                            _activeTab = _tabs[0]; // Reset to initial tab
                          });
                          _fetchFeed();
                        });
                      } else if (tab == _tStories) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const StoriesScreen()),
                        ).then((_) {
                          setState(() {
                            _activeTab = _tabs[0];
                          });
                          _fetchFeed();
                        });
                      }
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
            BreakingNewsTicker(feedList: _feedData),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: BottomNavigationBar(
        currentIndex: _currentNavIndex,
        onTap: (index) {
          setState(() {
            _currentNavIndex = index;
          });
          
          if (index == 0) {
            // Navigate to Search/Explore
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SearchExploreScreen()),
            ).then((_) {
              // Reset to Home index when returning
              setState(() {
                _currentNavIndex = 1;
              });
            });
          } else if (index == 2) {
            // Navigate to Profile
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ProfileScreen()),
            ).then((_) {
              setState(() {
                _currentNavIndex = 1;
              });
            });
          }
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        showSelectedLabels: false,
        showUnselectedLabels: false,
        selectedItemColor: const Color(0xFFDC143C),
        unselectedItemColor: const Color(0xFF64748B),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.search, size: 28),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.home, size: 28),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline, size: 28),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
