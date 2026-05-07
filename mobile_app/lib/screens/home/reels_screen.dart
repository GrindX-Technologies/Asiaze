import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/api_service.dart';
import '../../services/translation_service.dart';

class ReelsScreen extends StatefulWidget {
  const ReelsScreen({super.key});

  @override
  State<ReelsScreen> createState() => _ReelsScreenState();
}

class _ReelsScreenState extends State<ReelsScreen> {
  final PageController _pageController = PageController();
  bool _isLoading = true;
  List<dynamic> _reelsData = [];
  String _langCode = 'EN';

  // Translated UI Strings
  String _tNoReels = 'No reels available right now';
  String _tAllCaughtUp = 'You\'re all caught up!';
  String _tSwipeUp = 'Swipe up';
  String _tTapToOpen = 'Tap to open article';

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
      _tNoReels = await TranslationService.translateText('No reels available right now', _langCode);
      _tAllCaughtUp = await TranslationService.translateText('You\'re all caught up!', _langCode);
      _tSwipeUp = await TranslationService.translateText('Swipe up', _langCode);
      _tTapToOpen = await TranslationService.translateText('Tap to open article', _langCode);
    }
    
    await _fetchReels();
  }

  Future<void> _fetchReels() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final data = await ApiService.getReels();
      
      List<dynamic> mappedData = [];
      for (var item in data) {
        String title = item['title'] ?? 'No Title';
        String description = item['description'] ?? '';
        
        if (_langCode != 'EN') {
          title = await TranslationService.translateText(title, _langCode);
          description = await TranslationService.translateText(description, _langCode);
        }
        
        mappedData.add({
          'id': item['_id']?.toString() ?? '',
          'title': title,
          'source': 'ASIAZE',
          'time': _formatDate(item['createdAt']),
          'description': description,
          'likes': (item['likes'] ?? 0).toString(),
          'videoUrl': item['videoUrl'],
          'thumbnailUrl': item['thumbnailUrl'],
          'duration': '01:00', // Placeholder
          'current': '00:00',  // Placeholder
        });
      }
      
      if (!mounted) return;
      setState(() {
        _reelsData = mappedData;
      });
    } catch (e) {
      debugPrint('Failed to load reels: $e');
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
    return Scaffold(
      backgroundColor: Colors.black,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFDC143C)))
          : _reelsData.isEmpty
              ? SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: SizedBox(
                    height: MediaQuery.of(context).size.height,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.video_library_outlined, size: 64, color: Colors.grey.shade600),
                          const SizedBox(height: 16),
                          Text(
                            _tNoReels,
                            style: GoogleFonts.lexendDeca(
                              fontSize: 16,
                              color: Colors.grey.shade400,
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
                    onRefresh: () async {
                      await _fetchReels();
                      _pageController.animateToPage(
                        0,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    },
                  child: PageView.builder(
                    controller: _pageController,
                    scrollDirection: Axis.vertical,
                    itemCount: _reelsData.length + 1, // +1 for "end of feed"
                    itemBuilder: (context, index) {
                      if (index == _reelsData.length) {
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
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        );
                      }
                      return ReelVideoPlayer(
                        reel: _reelsData[index],
                        tSwipeUp: _tSwipeUp,
                        tTapToOpen: _tTapToOpen,
                      );
                    },
                  ),
                ),
    );
  }
}

class ReelVideoPlayer extends StatefulWidget {
  final Map<String, dynamic> reel;
  final String tSwipeUp;
  final String tTapToOpen;

  const ReelVideoPlayer({
    super.key, 
    required this.reel,
    required this.tSwipeUp,
    required this.tTapToOpen,
  });

  @override
  State<ReelVideoPlayer> createState() => _ReelVideoPlayerState();
}

class _ReelVideoPlayerState extends State<ReelVideoPlayer> {
  VideoPlayerController? _controller;
  bool _isPlaying = true;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  Future<void> _initializeVideo() async {
    if (widget.reel['videoUrl'] != null && widget.reel['videoUrl'].isNotEmpty) {
      final url = 'https://asiaze.cloud${widget.reel['videoUrl']}';
      _controller = VideoPlayerController.networkUrl(Uri.parse(url))
        ..setLooping(true)
        ..initialize().then((_) {
          if (mounted) {
            setState(() {});
            _controller?.play();
          }
        });
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Background Video Placeholder or Player
        Container(
          width: double.infinity,
          height: double.infinity,
          color: Colors.grey[900],
          child: _controller != null && _controller!.value.isInitialized
              ? GestureDetector(
                  onTap: () {
                    setState(() {
                      if (_controller!.value.isPlaying) {
                        _controller!.pause();
                        _isPlaying = false;
                      } else {
                        _controller!.play();
                        _isPlaying = true;
                      }
                    });
                  },
                  child: SizedBox.expand(
                    child: FittedBox(
                      fit: BoxFit.cover,
                      child: SizedBox(
                        width: _controller!.value.size.width,
                        height: _controller!.value.size.height,
                        child: VideoPlayer(_controller!),
                      ),
                    ),
                  ),
                )
              : Stack(
                  fit: StackFit.expand,
                  children: [
                    if (widget.reel['thumbnailUrl'] != null && widget.reel['thumbnailUrl'].isNotEmpty)
                      Image.network(
                        'https://asiaze.cloud${widget.reel['thumbnailUrl']}',
                        fit: BoxFit.cover,
                      ),
                    const Center(
                      child: CircularProgressIndicator(color: Colors.white54),
                    ),
                  ],
                ),
        ),

        // Play/Pause icon overlay
        if (!_isPlaying)
          Center(
            child: Icon(Icons.play_arrow, color: Colors.white.withAlpha(150), size: 80),
          ),

        // Dark gradient overlay at bottom
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          height: MediaQuery.of(context).size.height * 0.4,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  Colors.black.withAlpha(200),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),

        // Top Header
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                Image.asset(
                  'assets/images/logo.png',
                  width: 100, // Added explicit width to fit the horizontal logo gracefully
                  fit: BoxFit.contain,
                ),
                IconButton(
                  icon: const Icon(Icons.volume_up, color: Colors.white),
                  onPressed: () {}, // Toggle mute
                ),
              ],
            ),
          ),
        ),

        // Right Action Rail
        Positioned(
          right: 16,
          bottom: 120,
          child: Column(
            children: [
              _buildActionButton(Icons.favorite, widget.reel['likes']),
              const SizedBox(height: 24),
              _buildActionButton(Icons.bookmark, null),
              const SizedBox(height: 24),
              _buildActionButton(Icons.send, null), // Share icon
            ],
          ),
        ),

        // Bottom Content Panel
        Positioned(
          left: 16,
          right: 80, // Leave space for action rail
          bottom: 40,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.reel['title'],
                style: GoogleFonts.roboto(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${widget.reel['source']} • ${widget.reel['time']}',
                style: GoogleFonts.roboto(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                widget.reel['description'],
                style: GoogleFonts.roboto(
                  color: Colors.white,
                  fontSize: 14,
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),

        // Bottom Progress Bar & Hints
        Positioned(
          left: 16,
          right: 16,
          bottom: 16,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${widget.reel['current']} / ${widget.reel['duration']}',
                style: GoogleFonts.roboto(
                  color: Colors.white,
                  fontSize: 12,
                ),
              ),
              Row(
                children: [
                  Text(
                    widget.tSwipeUp,
                    style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.keyboard_arrow_up, color: Colors.white, size: 16),
                ],
              ),
              GestureDetector(
                onTap: () {
                  // Handle tap to open article
                },
                child: Text(
                  widget.tTapToOpen,
                  style: GoogleFonts.roboto(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Red Progress Bar (Simulated)
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: Container(
            height: 2,
            width: double.infinity,
            color: Colors.grey[800],
            alignment: Alignment.centerLeft,
            child: FractionallySizedBox(
              widthFactor: 0.5, // e.g. 50% progress
              child: Container(color: const Color(0xFFDC143C)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton(IconData icon, String? label) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Colors.black.withAlpha(100),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
        if (label != null) ...[
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.roboto(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ]
      ],
    );
  }
}
