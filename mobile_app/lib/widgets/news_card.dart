import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';
import '../services/saved_articles_service.dart';

class NewsCard extends StatefulWidget {
  final Map<String, dynamic> article;
  final VoidCallback onTap;

  const NewsCard({
    super.key,
    required this.article,
    required this.onTap,
  });

  @override
  State<NewsCard> createState() => _NewsCardState();
}

class _NewsCardState extends State<NewsCard> with SingleTickerProviderStateMixin {
  bool _isSaved = false;
  late AnimationController _saveAnimController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
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
    final saved = await SavedArticlesService.isSaved(widget.article['id'] ?? '');
    if (mounted) {
      setState(() => _isSaved = saved);
    }
  }

  Future<void> _toggleSave() async {
    if (_isSaved) {
      await SavedArticlesService.removeArticle(widget.article['id'] ?? '');
    } else {
      await SavedArticlesService.saveArticle(widget.article);
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

  void _shareArticle() {
    final String url = 'https://asiaze.cloud/article/${widget.article['id'] ?? ''}';
    // ignore: deprecated_member_use
    Share.share('Check out this article on ASIAZE:\n$url');
  }

  @override
  void dispose() {
    _saveAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Determine screen dimensions to make card fill most of the screen
    final size = MediaQuery.of(context).size;
    // We leave some space for the top nav and bottom nav
    final cardHeight = size.height * 0.7;

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        height: cardHeight,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(12),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Image
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                  child: Container(
                    height: cardHeight * 0.45,
                    width: double.infinity,
                    color: Colors.grey[300],
                    child: widget.article['coverImage'] != null && widget.article['coverImage'].isNotEmpty
                        ? Image.network(
                            'https://asiaze.cloud${widget.article['coverImage']}',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                const Icon(Icons.image, size: 64, color: Colors.grey),
                          )
                        : const Icon(Icons.image, size: 64, color: Colors.grey),
                  ),
                ),
                // FABs (Bookmark & Share)
                Positioned(
                  bottom: 0,
                  right: 16,
                  child: Transform.translate(
                    offset: const Offset(0, 16),
                    child: Row(
                      children: [
                        _buildSaveFab(),
                        const SizedBox(width: 8),
                        _buildShareFab(),
                      ],
                    ),
                  ),
                )
              ],
            ),
            const SizedBox(height: 24), // Space for floating FABs
            // Article Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.article['title'] ?? '',
                      style: GoogleFonts.roboto(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                        height: 1.3,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: Text(
                        widget.article['excerpt'] ?? '',
                        style: GoogleFonts.roboto(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: const Color(0xFF64748B), // Gray
                          height: 1.5,
                        ),
                        maxLines: 5,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      widget.article['meta'] ?? 'Few hours ago | ASIAZE',
                      style: GoogleFonts.roboto(
                        fontSize: 10,
                        color: const Color(0xFF94A3B8), // Light gray
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSaveFab() {
    return GestureDetector(
      onTap: _toggleSave,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          width: 36,
          height: 36,
          decoration: const BoxDecoration(
            color: Color(0xFFDC143C),
            shape: BoxShape.circle,
          ),
          child: Icon(
            _isSaved ? Icons.bookmark : Icons.bookmark_border,
            color: Colors.white,
            size: 18,
          ),
        ),
      ),
    );
  }

  Widget _buildShareFab() {
    return GestureDetector(
      onTap: _shareArticle,
      child: Container(
        width: 36,
        height: 36,
        decoration: const BoxDecoration(
          color: Color(0xFFDC143C),
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.share,
          color: Colors.white,
          size: 18,
        ),
      ),
    );
  }
}
