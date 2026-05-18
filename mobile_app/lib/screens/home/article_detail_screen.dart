import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/saved_articles_service.dart';
import '../../services/api_service.dart';

class ArticleDetailScreen extends StatefulWidget {
  final Map<String, dynamic> article;
  final List<dynamic>? feedList;
  final int? initialIndex;

  const ArticleDetailScreen({
    super.key,
    required this.article,
    this.feedList,
    this.initialIndex,
  });

  @override
  State<ArticleDetailScreen> createState() => _ArticleDetailScreenState();
}

class _ArticleDetailScreenState extends State<ArticleDetailScreen> with SingleTickerProviderStateMixin {
  late int _currentIndex;
  late PageController _pageController;
  bool _isSaved = false;
  bool _isLiked = false;
  late AnimationController _saveAnimController;
  late Animation<double> _scaleAnimation;

  bool _isLiking = false;

  bool _isPopping = false;
  double _overscrollAccumulator = 0.0;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex ?? 0;
    _pageController = PageController(initialPage: _currentIndex);
    
    _saveAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.3), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1.3, end: 1.0), weight: 50),
    ]).animate(CurvedAnimation(
      parent: _saveAnimController,
      curve: Curves.easeInOut,
    ));

    _checkSavedStatus();
  }

  Future<void> _checkSavedStatus() async {
    final currentArticle = _getCurrentArticle();
    final articleId = currentArticle['id'] ?? currentArticle['_id'] ?? '';
    final saved = await SavedArticlesService.isSaved(articleId);
    
    // Also check local liked status
    final prefs = await SharedPreferences.getInstance();
    final likedArticles = prefs.getStringList('likedArticles') ?? [];
    
    if (mounted) {
      setState(() {
        _isSaved = saved;
        _isLiked = likedArticles.contains(articleId);
      });
    }
  }

  Future<void> _toggleSave() async {
    final currentArticle = _getCurrentArticle();
    if (_isSaved) {
      await SavedArticlesService.removeArticle(currentArticle['id'] ?? '');
    } else {
      await SavedArticlesService.saveArticle(currentArticle);
      _saveAnimController.forward(from: 0.0);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Article saved!'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
    _checkSavedStatus();
  }

  Future<void> _toggleLike() async {
    if (_isLiking) return;
    
    final token = await ApiService.getToken();
    if (token == null || token.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please log in to like articles.'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 2),
          ),
        );
      }
      return;
    }

    final currentArticle = _getCurrentArticle();
    final articleId = currentArticle['id'] ?? currentArticle['_id'] ?? '';

    setState(() {
      _isLiking = true;
      _isLiked = !_isLiked;
    });

    try {
      await ApiService.toggleLikeNews(articleId, _isLiked);
      
      // Update local storage
      final prefs = await SharedPreferences.getInstance();
      final likedArticles = prefs.getStringList('likedArticles') ?? [];
      if (_isLiked && !likedArticles.contains(articleId)) {
        likedArticles.add(articleId);
      } else if (!_isLiked && likedArticles.contains(articleId)) {
        likedArticles.remove(articleId);
      }
      await prefs.setStringList('likedArticles', likedArticles);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isLiked ? 'Article liked!' : 'Article unliked!'),
            duration: const Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      debugPrint('Error toggling like: $e');
      if (mounted) {
        // Rollback optimistic update
        setState(() {
          _isLiked = !_isLiked;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update like: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLiking = false;
        });
      }
    }
  }

  void _shareArticle() async {
    final currentArticle = _getCurrentArticle();
    final String url = 'https://asiaze.cloud/article/${currentArticle['id'] ?? ''}';
    final result = await Share.share('Check out this article on ASIAZE:\n$url');
    
    if (result.status == ShareResultStatus.success) {
      try {
        final res = await ApiService.addSharePoints(currentArticle['id'].toString(), 'article');
        if (mounted && res.containsKey('added')) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Successfully shared! You earned ${res['added']} points.'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        debugPrint('Failed to award share points: $e');
        // If error message indicates already shared, we can optionally notify user
        if (mounted && e.toString().contains('already shared')) {
           ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('You have already received points for sharing this article.'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      }
    }
  }

  Map<String, dynamic> _getCurrentArticle() {
    if (widget.feedList != null && widget.feedList!.isNotEmpty) {
      return widget.feedList![_currentIndex]['mappedArticle'] ?? widget.feedList![_currentIndex];
    }
    return widget.article;
  }

  @override
  void dispose() {
    _saveAnimController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Widget _buildArticleView(Map<String, dynamic> article) {
    final title = article['title'] ?? 'Breakthrough in Renewable Energy: The Future Looks Bright';
    final subtitle = article['excerpt'] ?? 'A new era of sustainable energy solutions is emerging, promising a cleaner and more efficient future.';
    final source = article['meta'] ?? 'Source: TechCrunch | Published: April 1, 2023, 10:00 AM';

    return NotificationListener<ScrollNotification>(
      onNotification: (ScrollNotification notification) {
        if (notification is ScrollUpdateNotification) {
          if (notification.metrics.pixels >= notification.metrics.maxScrollExtent) {
            if (notification.dragDetails != null && notification.scrollDelta != null && notification.scrollDelta! > 0) {
              _overscrollAccumulator += notification.scrollDelta!;
            }
          } else {
            _overscrollAccumulator = 0.0;
          }
        } else if (notification is OverscrollNotification) {
          if (notification.dragDetails != null && notification.overscroll > 0) {
            _overscrollAccumulator += notification.overscroll;
          }
        } else if (notification is ScrollEndNotification) {
          _overscrollAccumulator = 0.0;
        }

        if (_overscrollAccumulator > 60.0) {
          if (!_isPopping) {
            _isPopping = true;
            Navigator.pop(context, 'next_article');
          }
        }
        return false;
      },
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Image
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: article['coverImage'] != null && article['coverImage'].toString().isNotEmpty
                    ? Image.network(
                        'https://asiaze.cloud${article['coverImage']}',
                        height: 220,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 220,
                          width: double.infinity,
                          color: Colors.grey[300],
                          child: const Icon(Icons.image, size: 64, color: Colors.grey),
                        ),
                      )
                    : Container(
                        height: 220,
                        width: double.infinity,
                        color: Colors.grey[300],
                        child: const Icon(Icons.image, size: 64, color: Colors.grey),
                      ),
              ),
            ),

            // Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                title,
                style: GoogleFonts.lexendDeca(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                  height: 1.3,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Subtitle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                subtitle,
                style: GoogleFonts.roboto(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: const Color(0xFF6B7280),
                  height: 1.5,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Source Line
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                source,
                style: GoogleFonts.roboto(
                  fontSize: 13,
                  color: const Color(0xFF9CA3AF),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Divider Red Accent
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16.0),
              height: 2,
              width: double.infinity,
              color: const Color(0xFFDC143C),
            ),
            const SizedBox(height: 24),

            // Body Text
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                article['content'] ?? 'No content available.',
                style: GoogleFonts.roboto(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: Colors.black87,
                  height: 1.6,
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: SizedBox(
          height: 36,
          child: Image.asset(
            'assets/images/asiaze_logo_header.png',
            fit: BoxFit.contain,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Colors.black),
            onPressed: _shareArticle,
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: Color(0xFFE2E8F0)),
        ),
      ),
      body: _buildArticleView(_getCurrentArticle()),
      bottomNavigationBar: _buildBottomActionBar(),
    );
  }

  Widget _buildBottomActionBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, -2),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: SafeArea(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            IconButton(
              icon: Icon(
                _isLiked ? Icons.favorite : Icons.favorite_border,
                size: 28,
                color: _isLiked ? const Color(0xFFDC143C) : Colors.black,
              ),
              onPressed: _toggleLike,
            ),
            ScaleTransition(
              scale: _scaleAnimation,
              child: IconButton(
                icon: Icon(
                  _isSaved ? Icons.bookmark : Icons.bookmark_border,
                  size: 28,
                  color: _isSaved ? const Color(0xFFDC143C) : Colors.black,
                ),
                onPressed: _toggleSave,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.share, size: 28, color: Colors.black),
              onPressed: _shareArticle,
            ),
          ],
        ),
      ),
    );
  }
}
