import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../widgets/news_card.dart';
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

class _HomeScreenState extends State<HomeScreen> {
  final PageController _pageController = PageController();
  int _currentNavIndex = 1; // 1 = Home (based on PRD/Figma)
  bool _isLoading = true;

  final List<String> _tabs = [
    'My Feed',
    'Stories',
    'Videos',
    'Business',
    'Tech',
    'Finance',
    'Entertainment',
  ];

  String _activeTab = 'My Feed';

  List<dynamic> _feedData = [];
  String _langCode = 'EN';
  String? _userState;
  
  // Translated UI Strings
  String _tBreakingNews = 'Breaking News: Major updates from around the world...';
  String _tLoadNewFeed = 'Load New Feed';
  String _tNoArticles = 'No articles available right now';
  String _tAllCaughtUp = 'You\'re all caught up!';
  String _tCheckBackLater = 'Check back later for more news.';
  
  String _tLocal = 'Local';
  String _tStories = 'Stories';
  String _tVideos = 'Videos';

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _langCode = prefs.getString('selectedLanguage') ?? 'EN';
      _userState = prefs.getString('userState');
    });

    // Translate UI strings if needed
    if (_langCode != 'EN') {
      _tBreakingNews = await TranslationService.translateText('Breaking News: Major updates from around the world...', _langCode);
      _tLoadNewFeed = await TranslationService.translateText('Load New Feed', _langCode);
      _tNoArticles = await TranslationService.translateText('No articles available right now', _langCode);
      _tAllCaughtUp = await TranslationService.translateText('You\'re all caught up!', _langCode);
      _tCheckBackLater = await TranslationService.translateText('Check back later for more news.', _langCode);
      _tLocal = await TranslationService.translateText('Local', _langCode);
      _tStories = await TranslationService.translateText('Stories', _langCode);
      _tVideos = await TranslationService.translateText('Videos', _langCode);
      
      // Translate tabs
      List<String> translatedTabs = [];
      for (String tab in _tabs) {
        translatedTabs.add(await TranslationService.translateText(tab, _langCode));
      }
      _tabs.clear();
      _tabs.addAll(translatedTabs);
      _activeTab = _tabs[0];
    }
    
    if (_userState != null && _userState!.isNotEmpty && !_tabs.contains(_tLocal)) {
      _tabs.insert(0, _tLocal);
      _activeTab = _tLocal;
    }
    
    await _fetchFeed();
  }

  Future<void> _fetchFeed() async {
    setState(() {
      _isLoading = true;
    });
    try {
      // Find original tab name if translated
      String apiQueryState = '';
      if (_userState != null && _activeTab == _tLocal) {
        apiQueryState = _userState!;
      }

      final data = await ApiService.getNews(state: apiQueryState.isNotEmpty ? apiQueryState : null);
      
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
            // Ticker
            Container(
              width: double.infinity,
              color: const Color(0xFFDC143C),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                _tBreakingNews,
                style: GoogleFonts.roboto(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            // Vertical Swipeable Feed
            Expanded(
              child: Stack(
                children: [
                  RefreshIndicator(
                    color: const Color(0xFFDC143C),
                    backgroundColor: Colors.white,
                    onRefresh: () async {
                      // Actually fetch new data on swipe down
                      await _fetchFeed();
                      _pageController.animateToPage(
                        0,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    },
                    child: _buildFeed(),
                  ),
                  // "Load New Feed" Pill (Simulated as positioned overlay like in second image)
                  if (_feedData.isNotEmpty) Positioned(
                    top: 16,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: GestureDetector(
                        onTap: () {
                          // Refresh logic
                          _fetchFeed();
                          _pageController.animateToPage(
                            0,
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        },
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
                              const Icon(Icons.refresh, color: Colors.white, size: 18),
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
      title: Text(
        'asiaze',
        style: GoogleFonts.lexendDeca(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: const Color(0xFFDC143C),
          letterSpacing: -1,
        ),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(40),
        child: SizedBox(
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
                  
                  if (tab == _tVideos) {
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
