import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../services/api_service.dart';
import '../../services/translation_service.dart';
import '../../services/story_event_bus.dart';
import 'package:shared_preferences/shared_preferences.dart';

// --- Data Models ---
class StoryPageData {
  final String imageUrl;
  final String category;
  final String title;
  final String byline;
  final String description;

  StoryPageData({
    required this.imageUrl,
    required this.category,
    required this.title,
    required this.byline,
    required this.description,
  });
}

class StoryGroupData {
  final String id;
  final List<StoryPageData> pages;
  int likes;
  int views;
  bool isLikedByMe;
  final bool isAd;
  final String? adLink;

  StoryGroupData({
    required this.id,
    required this.pages,
    this.likes = 0,
    this.views = 0,
    this.isLikedByMe = false,
    this.isAd = false,
    this.adLink,
  });
}

// --- Dummy Data ---
final List<StoryGroupData> dummyStories = [];

// --- Stories Screen (Outer PageView) ---
class StoriesScreen extends StatefulWidget {
  final List<StoryGroupData>? stories;
  final int initialIndex;

  const StoriesScreen({
    super.key,
    this.stories,
    this.initialIndex = 0,
  });

  @override
  State<StoriesScreen> createState() => _StoriesScreenState();
}

class _StoriesScreenState extends State<StoriesScreen> {
  late PageController _pageController;
  List<StoryGroupData> _stories = [];
  bool _isLoading = true;
  String _langCode = 'EN';

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: widget.initialIndex);
    if (widget.stories != null) {
      _stories = widget.stories!;
      _isLoading = false;
    } else {
      _fetchStories();
    }
  }

  Future<void> _fetchStories() async {
    final prefs = await SharedPreferences.getInstance();
    _langCode = prefs.getString('selectedLanguage') ?? 'EN';
    final List<String> likedStories = prefs.getStringList('likedStories') ?? [];
    final List<String> likedAds = prefs.getStringList('likedAds') ?? [];

    try {
      final data = await ApiService.getStories();
      
      // Fetch settings and ads
      int storyAdFreq = 3;
      List<dynamic> storyAds = [];
      try {
        final settings = await ApiService.getSettings();
        for (var s in settings) {
          if (s['key'] == 'ad_frequency_story') {
            storyAdFreq = int.tryParse(s['value'].toString()) ?? 3;
          }
        }
        storyAds = await ApiService.getAds(type: 'story', isActive: true);
      } catch (e) {
        debugPrint('Failed to load ads or settings: $e');
      }

      List<StoryGroupData> mappedStories = [];
      for (var group in data) {
        // Double check status client-side to ensure draft stories are never displayed
        if (group['status'] == 'draft') continue;

        List<StoryPageData> mappedPages = [];
        
        for (var page in group['pages']) {
          String title = page['title'] ?? '';
          String description = page['description'] ?? '';
          String category = group['category'] ?? 'General';
          
          if (_langCode != 'EN') {
            title = await TranslationService.translateText(title, _langCode);
            description = await TranslationService.translateText(description, _langCode);
            category = await TranslationService.translateText(category, _langCode);
          }
          
          mappedPages.add(StoryPageData(
            imageUrl: 'https://asiaze.cloud${page['imageUrl']}',
            category: category,
            title: title,
            byline: 'By ASIAZE',
            description: description,
          ));
        }
        
        if (mappedPages.isNotEmpty) {
          mappedStories.add(StoryGroupData(
            id: group['_id'],
            pages: mappedPages,
            likes: group['likes'] ?? 0,
            views: group['views'] ?? 0,
            isLikedByMe: likedStories.contains(group['_id']),
          ));
        }
      }
      
      // Inject ads
      if (storyAds.isNotEmpty && storyAdFreq > 0) {
        List<StoryGroupData> withAds = [];
        int adIndex = 0;
        for (int i = 0; i < mappedStories.length; i++) {
          withAds.add(mappedStories[i]);
          if ((i + 1) % storyAdFreq == 0) {
            final ad = storyAds[adIndex % storyAds.length];
            final String mediaUrl = ad['mediaUrl'] ?? '';
            final url = mediaUrl.startsWith('http') ? mediaUrl : 'https://asiaze.cloud$mediaUrl';
            withAds.add(StoryGroupData(
              id: ad['_id'] ?? 'ad_$adIndex',
              isAd: true,
              adLink: ad['linkUrl'],
              likes: int.tryParse(ad['likes']?.toString() ?? '0') ?? 0,
              isLikedByMe: likedAds.contains(ad['_id']),
              pages: [
                StoryPageData(
                  imageUrl: url,
                  category: 'SPONSORED',
                  title: ad['title'] ?? 'Advertisement',
                  byline: 'By SPONSOR',
                  description: 'Sponsored Content',
                )
              ],
            ));
            adIndex++;
          }
        }
        mappedStories = withAds;
      }

      if (mounted) {
        setState(() {
          _stories = mappedStories;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Error loading stories: $e");
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onStoryCompleted() {
    if (_pageController.page?.toInt() == _stories.length - 1) {
      // Last story group finished, pop screen
      Navigator.pop(context);
    } else {
      // Go to next story group
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _onStoryPrevious() {
    if (_pageController.page?.toInt() == 0) {
      // First story group, pop screen (optional)
      // Navigator.pop(context);
    } else {
      // Go to previous story group
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Color(0xFFDC143C))),
      );
    }

    if (_stories.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.amp_stories, size: 64, color: Colors.grey.shade600),
              const SizedBox(height: 16),
              Text(
                'No stories available',
                style: GoogleFonts.lexendDeca(color: Colors.white70, fontSize: 16),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Go Back', style: TextStyle(color: Color(0xFFDC143C))),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        controller: _pageController,
        itemCount: _stories.length,
        itemBuilder: (context, index) {
          return StoryGroupView(
            storyGroup: _stories[index],
            onCompleted: _onStoryCompleted,
            onPreviousStoryGroup: _onStoryPrevious,
          );
        },
      ),
    );
  }
}

// --- Story Group View (Inner Pages) ---
class StoryGroupView extends StatefulWidget {
  final StoryGroupData storyGroup;
  final VoidCallback onCompleted;
  final VoidCallback onPreviousStoryGroup;

  const StoryGroupView({
    super.key,
    required this.storyGroup,
    required this.onCompleted,
    required this.onPreviousStoryGroup,
  });

  @override
  State<StoryGroupView> createState() => _StoryGroupViewState();
}

class _StoryGroupViewState extends State<StoryGroupView> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  int _currentIndex = 0;
  bool _hasRecordedView = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5), // 5 seconds per story page
    );

    _animController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _animController.stop();
        _animController.reset();
        setState(() {
          if (_currentIndex + 1 < widget.storyGroup.pages.length) {
            _currentIndex++;
            _animController.forward();
          } else {
            // Finished all pages in this group
            widget.onCompleted();
          }
        });
      }
    });

    _animController.forward();
    _recordView();
  }

  Future<void> _recordView() async {
    if (_hasRecordedView) return;
    _hasRecordedView = true;
    try {
      String deviceId = await ApiService.getDeviceId();
      final updatedStory = await ApiService.recordStoryView(widget.storyGroup.id, deviceId);
      if (mounted) {
        setState(() {
          widget.storyGroup.views = updatedStory['views'] ?? widget.storyGroup.views;
        });
        StoryEventBus.broadcast({
          'id': widget.storyGroup.id,
          'views': widget.storyGroup.views,
        });
      }
    } catch (e) {
      debugPrint('Failed to record story view: $e');
    }
  }

  Future<void> _toggleLike() async {
    if (!mounted) return;
    
    final token = await ApiService.getToken();
    if (token == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please login to like content'),
            duration: Duration(seconds: 2),
          ),
        );
      }
      return;
    }

    // Optimistic UI update
    setState(() {
      widget.storyGroup.isLikedByMe = !widget.storyGroup.isLikedByMe;
      widget.storyGroup.likes += widget.storyGroup.isLikedByMe ? 1 : -1;
    });

    try {
      Map<String, dynamic> updatedStory;
      if (widget.storyGroup.isAd) {
        // Ads don't have a dedicated endpoint for reels vs stories, use the generic Ad like endpoint
        updatedStory = await ApiService.toggleLikeAd(widget.storyGroup.id, !widget.storyGroup.isLikedByMe); // Pass original state
      } else {
        updatedStory = await ApiService.toggleLikeStory(widget.storyGroup.id);
      }
      
      // Update with confirmed server data
      if (mounted) {
        final prefs = await SharedPreferences.getInstance();
        setState(() {
          if (updatedStory['likes'] != null) {
            widget.storyGroup.likes = int.tryParse(updatedStory['likes'].toString()) ?? widget.storyGroup.likes;
          }
          
          final key = widget.storyGroup.isAd ? 'likedAds' : 'likedStories';
          final likedItems = prefs.getStringList(key) ?? [];
          
          if (widget.storyGroup.isLikedByMe && !likedItems.contains(widget.storyGroup.id)) {
            likedItems.add(widget.storyGroup.id);
          } else if (!widget.storyGroup.isLikedByMe && likedItems.contains(widget.storyGroup.id)) {
            likedItems.remove(widget.storyGroup.id);
          }
          prefs.setStringList(key, likedItems);
        });
        StoryEventBus.broadcast({
          'type': 'story_like_updated',
          'storyId': widget.storyGroup.id,
          'isLiked': widget.storyGroup.isLikedByMe,
          'likes': widget.storyGroup.likes
        });
      }
    } catch (e) {
      // Revert optimistic update on failure
      if (mounted) {
        setState(() {
          widget.storyGroup.isLikedByMe = !widget.storyGroup.isLikedByMe;
          widget.storyGroup.likes += widget.storyGroup.isLikedByMe ? 1 : -1;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update like status')),
        );
      }
    }
  }

  void _shareStory() {
    final String deepLink = 'https://asiaze.cloud/stories/${widget.storyGroup.id}';
    final String title = widget.storyGroup.pages[_currentIndex].title;
    // ignore: deprecated_member_use
    Share.share('Check out this story: $title\n$deepLink');
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    _animController.stop();
  }

  void _onTapUp(TapUpDetails details) {
    // If the tap occurred near the bottom of the screen (where the link/like buttons are),
    // we don't trigger the global story navigation to prevent hijacking the button taps.
    final double screenHeight = MediaQuery.of(context).size.height;
    if (details.globalPosition.dy > screenHeight - 150) {
      _animController.forward();
      return;
    }

    final double screenWidth = MediaQuery.of(context).size.width;
    final double dx = details.globalPosition.dx;

    if (dx < screenWidth / 3) {
      // Tap left (Previous)
      setState(() {
        if (_currentIndex > 0) {
          _currentIndex--;
          _animController.reset();
          _animController.forward();
        } else {
          // Go to previous story group
          widget.onPreviousStoryGroup();
        }
      });
    } else {
      // Tap right (Next)
      setState(() {
        if (_currentIndex + 1 < widget.storyGroup.pages.length) {
          _currentIndex++;
          _animController.reset();
          _animController.forward();
        } else {
          // Finished all pages in this group
          widget.onCompleted();
        }
      });
    }
  }

  void _onLongPress() {
    _animController.stop();
  }

  void _onLongPressEnd(LongPressEndDetails details) {
    _animController.forward();
  }

  @override
  Widget build(BuildContext context) {
    final pageData = widget.storyGroup.pages[_currentIndex];

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: () => _animController.forward(),
      onLongPress: _onLongPress,
      onLongPressEnd: _onLongPressEnd,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image
          Image.network(
            pageData.imageUrl,
            fit: BoxFit.cover,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return const Center(child: CircularProgressIndicator(color: Color(0xFFDC143C)));
            },
            errorBuilder: (context, error, stackTrace) {
              return Container(
                color: Colors.grey[900],
                child: const Center(
                  child: Icon(Icons.image_not_supported, color: Colors.white54, size: 50),
                ),
              );
            },
          ),
          
          // Gradient Overlay
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.black45,
                  Colors.transparent,
                  Colors.black87,
                  Colors.black,
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.0, 0.4, 0.8, 1.0],
              ),
            ),
          ),

          // UI Overlay wrapped in a SafeArea and placed above the gesture detector
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Thin red bar at the very top edge
                Container(
                  height: 3,
                  width: double.infinity,
                  color: const Color(0xFFDC143C),
                ),

                // Top Progress Bars
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Row(
                    children: List.generate(
                      widget.storyGroup.pages.length,
                      (index) => Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2.0),
                          child: AnimatedProgressBar(
                            animController: _animController,
                            position: index,
                            currentIndex: _currentIndex,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // Category Pill
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDC143C),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          pageData.category,
                          style: GoogleFonts.roboto(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                // Text Content
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pageData.title,
                        style: GoogleFonts.lexendDeca(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        pageData.byline,
                        style: GoogleFonts.roboto(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        pageData.description,
                        style: GoogleFonts.roboto(
                          fontSize: 16,
                          color: Colors.white.withAlpha(220),
                          height: 1.5,
                        ),
                      ),
                      if (widget.storyGroup.isAd && widget.storyGroup.adLink != null && widget.storyGroup.adLink!.isNotEmpty)
                        ElevatedButton.icon(
                          onPressed: () async {
                            String url = widget.storyGroup.adLink!;
                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                              url = 'https://$url';
                            }
                            final uri = Uri.parse(url);
                            try {
                              await launchUrl(uri, mode: LaunchMode.externalApplication);
                            } catch (e) {
                              debugPrint('Could not launch $url: $e');
                            }
                          },
                          icon: const Icon(Icons.open_in_new, size: 16, color: Colors.black),
                          label: Text(
                            "Tap to open link",
                            style: GoogleFonts.roboto(
                              color: Colors.black,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // Bottom Action Icons
                Padding(
                  padding: const EdgeInsets.fromLTRB(24.0, 24.0, 24.0, 32.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      // Views counter
                      Row(
                        children: [
                          const Icon(Icons.visibility, color: Colors.white70, size: 24),
                          const SizedBox(width: 4),
                          Text(
                            '${widget.storyGroup.views}',
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      // Like button and counter
                      GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: _toggleLike,
                        child: Row(
                          children: [
                            Icon(
                              widget.storyGroup.isLikedByMe ? Icons.favorite : Icons.favorite_border,
                              color: widget.storyGroup.isLikedByMe ? Colors.red : Colors.white,
                              size: 28,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${widget.storyGroup.likes}',
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      // Share button
                      GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: _shareStory,
                        child: const Icon(Icons.share, color: Colors.white, size: 28),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// --- Animated Progress Bar ---
class AnimatedProgressBar extends StatelessWidget {
  final AnimationController animController;
  final int position;
  final int currentIndex;

  const AnimatedProgressBar({
    super.key,
    required this.animController,
    required this.position,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          height: 3,
          decoration: BoxDecoration(
            color: Colors.white.withAlpha(80),
            borderRadius: BorderRadius.circular(2),
          ),
          child: Stack(
            children: [
              if (position < currentIndex)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(2),
                  ),
                )
              else if (position == currentIndex)
                AnimatedBuilder(
                  animation: animController,
                  builder: (context, child) {
                    return Container(
                      width: constraints.maxWidth * animController.value,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    );
                  },
                )
              else
                const SizedBox.shrink(),
            ],
          ),
        );
      },
    );
  }
}
