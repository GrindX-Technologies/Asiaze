import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/api_service.dart';
import '../../services/translation_service.dart';
import '../../services/saved_reels_service.dart';

class ReelsScreen extends StatefulWidget {
  final String? initialReelId;
  const ReelsScreen({super.key, this.initialReelId});

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
          'articleLink': item['articleLink'],
          'duration': '01:00', // Placeholder
          'current': '00:00',  // Placeholder
        });
      }
      
      if (!mounted) return;
      setState(() {
        if (widget.initialReelId != null) {
          // Reorder so the requested reel is first
          final initialReelIndex = mappedData.indexWhere((r) => r['id'] == widget.initialReelId);
          if (initialReelIndex != -1) {
            final initialReel = mappedData.removeAt(initialReelIndex);
            mappedData.insert(0, initialReel);
          }
        }
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

class _ReelVideoPlayerState extends State<ReelVideoPlayer> with SingleTickerProviderStateMixin {
  VideoPlayerController? _controller;
  bool _isPlaying = true;
  bool _isMuted = false;
  bool _isSaved = false;
  
  bool _isLiked = false;
  int _likeCount = 0;
  bool _isLiking = false;
  
  late AnimationController _saveAnimController;
  late Animation<double> _scaleAnimation;
  bool _hasRecordedView = false;
  String _durationString = "00:00";
  String _positionString = "00:00";
  double _progressValue = 0.0;

  @override
  void initState() {
    super.initState();
    
    _likeCount = int.tryParse(widget.reel['likes'].toString()) ?? 0;
    
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
    _initializeVideo();
  }

  Future<void> _checkSavedStatus() async {
    final saved = await SavedReelsService.isSaved(widget.reel['id'] ?? widget.reel['_id'] ?? '');
    
    // Also check local liked status
    final prefs = await SharedPreferences.getInstance();
    final likedReels = prefs.getStringList('likedReels') ?? [];
    final reelId = widget.reel['id'] ?? widget.reel['_id'] ?? '';
    
    if (mounted) {
      setState(() {
        _isSaved = saved;
        _isLiked = likedReels.contains(reelId);
      });
    }
  }

  Future<void> _toggleSave() async {
    if (_isSaved) {
      await SavedReelsService.removeReel(widget.reel['id'] ?? '');
    } else {
      await SavedReelsService.saveReel(widget.reel);
      _saveAnimController.forward(from: 0.0);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Reel saved!'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
    if (mounted) {
      setState(() => _isSaved = !_isSaved);
    }
  }

  Future<void> _toggleLike() async {
    if (_isLiking) return;
    
    final token = await ApiService.getToken();
    if (token == null || token.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please log in to like reels.'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 2),
          ),
        );
      }
      return;
    }

    setState(() {
      _isLiking = true;
      _isLiked = !_isLiked;
      _likeCount = _isLiked ? _likeCount + 1 : math.max(0, _likeCount - 1);
    });

    try {
      final reelId = widget.reel['id'] ?? widget.reel['_id'] ?? '';
      final response = await ApiService.toggleLikeReel(reelId, _isLiked);
      
      // Update local storage
      final prefs = await SharedPreferences.getInstance();
      final likedReels = prefs.getStringList('likedReels') ?? [];
      if (_isLiked && !likedReels.contains(reelId)) {
        likedReels.add(reelId);
      } else if (!_isLiked && likedReels.contains(reelId)) {
        likedReels.remove(reelId);
      }
      await prefs.setStringList('likedReels', likedReels);

      if (mounted && response['likes'] != null) {
        setState(() {
          _likeCount = int.tryParse(response['likes'].toString()) ?? _likeCount;
        });
      }
    } catch (e) {
      debugPrint('Error toggling like: $e');
      if (mounted) {
        // Rollback optimistic update
        setState(() {
          _isLiked = !_isLiked;
          _likeCount = _isLiked ? _likeCount + 1 : math.max(0, _likeCount - 1);
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

  void _shareReel() {
    final String url = 'https://asiaze.cloud/reel/${widget.reel['id']}';
    // ignore: deprecated_member_use
    Share.share('Check out this reel on ASIAZE:\n$url');
  }

  void _toggleMute() {
    setState(() {
      _isMuted = !_isMuted;
      _controller?.setVolume(_isMuted ? 0.0 : 1.0);
    });
  }

  Future<void> _initializeVideo() async {
    if (widget.reel['videoUrl'] != null && widget.reel['videoUrl'].isNotEmpty) {
      String videoUrl = widget.reel['videoUrl'];
      final url = videoUrl.startsWith('http') ? videoUrl : 'https://asiaze.cloud$videoUrl';
      _controller = VideoPlayerController.networkUrl(Uri.parse(url))
        ..setLooping(true)
        ..initialize().then((_) {
          if (mounted) {
            setState(() {
              _durationString = _formatDuration(_controller!.value.duration);
            });
            _controller?.play();
            _recordView();
          }
        }).catchError((e) {
          debugPrint("Video initialization error: $e");
        });
        
      _controller?.addListener(() {
        if (mounted && _controller != null && _controller!.value.isInitialized) {
          final position = _controller!.value.position;
          final duration = _controller!.value.duration;
          setState(() {
            _positionString = _formatDuration(position);
            _progressValue = duration.inMilliseconds > 0 
                ? position.inMilliseconds / duration.inMilliseconds 
                : 0.0;
          });
        }
      });
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$minutes:$seconds";
  }

  Future<void> _recordView() async {
    if (_hasRecordedView) return;
    _hasRecordedView = true;
    try {
      final reelId = widget.reel['id'] ?? widget.reel['_id'] ?? '';
      String deviceId = await ApiService.getDeviceId();
      await ApiService.recordReelView(reelId, deviceId);
    } catch (e) {
      debugPrint('Failed to record reel view: $e');
    }
  }

  @override
  void dispose() {
    _saveAnimController.dispose();
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
                        widget.reel['thumbnailUrl'].toString().startsWith('http') 
                          ? widget.reel['thumbnailUrl'] 
                          : 'https://asiaze.cloud${widget.reel['thumbnailUrl']}',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return const Center(child: Icon(Icons.broken_image, color: Colors.white54, size: 50));
                        },
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
                if (Navigator.canPop(context))
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(100),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.arrow_back, color: Colors.white, size: 24),
                    ),
                  )
                else
                  const SizedBox(width: 40), // Placeholder to keep logo centered
                SizedBox(
                  height: 36,
                  child: Image.asset(
                    'assets/images/asiaze_logo_header.png',
                    fit: BoxFit.contain,
                  ),
                ),
                IconButton(
                  icon: Icon(_isMuted ? Icons.volume_off : Icons.volume_up, color: Colors.white),
                  onPressed: _toggleMute, // Toggle mute
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
              GestureDetector(
                onTap: _toggleLike,
                child: _buildActionButton(
                  _isLiked ? Icons.favorite : Icons.favorite_border,
                  _likeCount.toString(),
                  iconColor: _isLiked ? Colors.red : Colors.white,
                ),
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: _toggleSave,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: _buildActionButton(
                    _isSaved ? Icons.bookmark : Icons.bookmark_border,
                    null,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: _shareReel,
                child: _buildActionButton(Icons.send, null),
              ),
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
          bottom: 24, // Lifted up to make room for progress bar
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFF00FF00), width: 2), // Neon green highlight matching screenshot
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.black.withAlpha(150),
                ),
                child: Text(
                  '$_positionString / $_durationString',
                  style: GoogleFonts.roboto(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
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
              if (widget.reel['articleLink'] != null && widget.reel['articleLink'].toString().isNotEmpty)
                GestureDetector(
                  onTap: () async {
                    final url = widget.reel['articleLink'];
                    if (await canLaunchUrl(Uri.parse(url))) {
                      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      widget.tTapToOpen,
                      style: GoogleFonts.roboto(
                        color: Colors.black,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),

        // True Bottom Progress Bar
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: _controller != null && _controller!.value.isInitialized
              ? SliderTheme(
                  data: SliderThemeData(
                    trackHeight: 2,
                    thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                    overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
                    activeTrackColor: Colors.white,
                    inactiveTrackColor: Colors.white.withAlpha(80),
                    thumbColor: Colors.white,
                  ),
                  child: Slider(
                    value: _progressValue,
                    onChanged: (value) {
                      setState(() {
                        _progressValue = value;
                      });
                      final duration = _controller!.value.duration;
                      final newPosition = duration * value;
                      _controller!.seekTo(newPosition);
                    },
                  ),
                )
              : const SizedBox.shrink(),
        ),
      ],
    );
  }

  Widget _buildActionButton(IconData icon, String? label, {Color iconColor = Colors.white}) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Colors.black.withAlpha(100),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor, size: 24),
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
